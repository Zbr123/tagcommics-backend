const {stripe} = require("../../config/stripe");
const { StatusCodes } = require("http-status-codes");
const { Comics } = require("../models/comics");
const CharacterBook = require("../models/character_book");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Library = require("../models/library");
const { sequelize } = require("../../config/pg-config");


// Base URLs
const SUCCESS_URL = process.env.FRONTEND_URL
  ? `${process.env.FRONTEND_URL}/checkout/success`
  : "http://localhost:3000/checkout/success";
const CANCEL_URL = process.env.FRONTEND_URL
  ? `${process.env.FRONTEND_URL}/checkout/cancel`
  : "http://localhost:3000/checkout/cancel";

// Resolve item details for checkout session
const resolveItem = async (itemType, itemId) => {
  let product = null;

  if (itemType === "comic") {
    product = await Comics.findByPk(itemId);
  } else if (itemType === "character_book") {
    product = await CharacterBook.findByPk(itemId);
  }

  if (!product) {
    return null;
  }

  const title = product.title;
  const unitPrice =
    parseFloat(product.discounted_price) ||
    parseFloat(product.original_price) ||
    parseFloat(product.price) ||
    0;
  const image = product.cover_image_url || product.image;
  const author = product.author;

  return {
    title,
    unit_price: unitPrice,
    image,
    author,
    product,
  };
};

// Create checkout session
const createCheckoutSession = async (customerId, items, customerEmail) => {
  try {
    if (!items || items.length === 0) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message: "Items are required",
      };
    }

    // Build line items and validate stock
    const lineItems = [];
    const validatedItems = [];

    for (const item of items) {
      const { item_type, item_id, quantity = 1 } = item;

      const resolved = await resolveItem(item_type, item_id);
      if (!resolved) {
        return {
          status: StatusCodes.NOT_FOUND,
          message: `Product not found: ${item_type} ${item_id}`,
        };
      }

      const { title, unit_price, image, author, product } = resolved;

      // Check stock
      const stock =
        product.stock !== undefined
          ? product.stock
          : product.stock_quantity || 0;

      if (stock < quantity) {
        return {
          status: StatusCodes.BAD_REQUEST,
          message: `Insufficient stock for "${title}". Available: ${stock}`,
        };
      }

      const lineItem = {
        price_data: {
          currency: "usd",
          product_data: {
            name: title,
            description: author ? `by ${author}` : "Comic/Book",
            images: image ? [`${process.env.BASE_URL}/api/v1/uploads/comics/images/${image}`] : [],
          },
          unit_amount: Math.round(unit_price * 100), // Stripe uses cents
        },
        quantity,
      };

      lineItems.push(lineItem);
      validatedItems.push({
        item_type,
        item_id,
        title,
        unit_price: unit_price,
        image,
        author,
        quantity,
        // Only store minimal needed data in metadata (Stripe has 500 char limit)
        pdf_url: item_type === "character_book" && product.pdf_file ? product.pdf_file : null
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: CANCEL_URL,
      customer_email: customerEmail,
      metadata: {
        customer_id: customerId,
        items: JSON.stringify(validatedItems),
      },
      shipping_address_collection: {
        allowed_countries: ["US", "PK", "GB", "CA", "AU"],
      },
    });

    return {
      status: StatusCodes.OK,
      message: "Checkout session created",
      data: {
        session_id: session.id,
        url: session.url,
      },
    };
  } catch (e) {
    console.error("Stripe createCheckoutSession error:", e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message,
    };
  }
};

// Verify webhook signature and construct event
const constructEvent = (payload, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

// Handle checkout session completed (payment success)
const handleCheckoutSessionCompleted = async (session) => {
  console.log("=== handleCheckoutSessionCompleted START ===");
  const transaction = await sequelize.transaction();

  try {
    const { customer_id, items } = session.metadata;
    console.log("customer_id:", customer_id);
    console.log("items string:", items);

    if (!customer_id || !items) {
      throw new Error("Missing metadata in Stripe session");
    }

    const itemsArray = JSON.parse(items);
    console.log("itemsArray parsed:", itemsArray.length, "items");

    // Calculate totals
    let subtotal = 0;
    const comicsData = itemsArray.map((item) => {
      const itemTotal = item.unit_price * item.quantity;
      subtotal += itemTotal;
      return {
        item_type: item.item_type,
        comic_id: item.item_type === "comic" ? item.item_id : null,
        character_book_id: item.item_type === "character_book" ? item.item_id : null,
        title: item.title,
        author: item.author,
        image: item.image,
        unit_price: item.unit_price,
        original_price: item.unit_price,
        quantity: item.quantity,
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const shipping = 5.0; // Flat shipping
    const grandTotal = subtotal + tax + shipping;
    console.log("grandTotal calculated:", grandTotal);

    // Create Order
    console.log("Creating Order with customer_id:", customer_id);
    const order = await Order.create(
      {
        customer_id,
        total_amount: grandTotal,
        order_status: "placed",
        comics: comicsData,
      },
      { transaction }
    );
    console.log("Order created, order_id:", order.order_id);

    // Create Payment (already paid via Stripe)
    console.log("Creating Payment with order_id:", order.order_id);
    const payment = await Payment.create(
      {
        payment_status: "paid",
        payment_received: grandTotal,
        payment_mode: "online-transfer",
        order_id: order.order_id,
        stripe_customer_id: session.customer,
        stripe_session_id: session.id,
      },
      { transaction }
    );
    console.log("Payment created, payment_id:", payment.payment_id);

    // Reduce stock
    console.log("Reducing stock for", itemsArray.length, "items");
    for (const item of itemsArray) {
      let product = null;

      if (item.item_type === "comic") {
        product = await Comics.findByPk(item.item_id, { transaction });
        if (product) {
          product.stock_quantity = Math.max(
            0,
            product.stock_quantity - item.quantity
          );
          await product.save({ transaction });
          console.log("Reduced stock for comic:", item.item_id);
        } else {
          console.log("Comic not found for stock reduction:", item.item_id);
        }
      } else if (item.item_type === "character_book") {
        product = await CharacterBook.findByPk(item.item_id, { transaction });
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save({ transaction });
          console.log("Reduced stock for character_book:", item.item_id);
        } else {
          console.log("CharacterBook not found for stock reduction:", item.item_id);
        }
      }
    }

    // Add items to library
    console.log("Adding", itemsArray.length, "items to library");
    for (const item of itemsArray) {
      console.log("Creating library entry for:", item.title, "item_type:", item.item_type);
      const libraryEntry = await Library.create(
        {
          customer_id,
          order_id: order.order_id,
          item_type: item.item_type,
          comic_id: item.item_type === "comic" ? item.item_id : null,
          character_book_id: item.item_type === "character_book" ? item.item_id : null,
          title: item.title,
          author: item.author,
          image: item.image,
          pdf_url: item.pdf_url,
        },
        { transaction }
      );
      console.log("Library entry created, id:", libraryEntry.id);
    }

    await transaction.commit();
    console.log("Transaction committed successfully");
    console.log(`Order ${order.order_id} created from Stripe session ${session.id}`);
    console.log("=== handleCheckoutSessionCompleted END ===");

    return { order, payment };
  } catch (e) {
    await transaction.rollback();
    console.error("!!! handleCheckoutSessionCompleted ERROR !!!");
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    throw e;
  }
};

// Get checkout session details
const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: StatusCodes.OK,
      message: "Session retrieved",
      data: session,
    };
  } catch (e) {
    console.error("Stripe getCheckoutSession error:", e);
    return {
      status: StatusCodes.NOT_FOUND,
      message: e.message,
    };
  }
};

module.exports = {
  createCheckoutSession,
  constructEvent,
  handleCheckoutSessionCompleted,
  getCheckoutSession,
};