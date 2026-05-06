const { StatusCodes } = require("http-status-codes");
const { sequelize } = require("../../config/pg-config");
const Cart = require("../models/cart");
const CartItem = require("../models/cart_item");
const { Comics } = require("../models/comics");
const CharacterBook = require("../models/character_book");
const Order = require("../models/order");
const Payment = require("../models/payment");

// Configurable max quantity per item
const MAX_QUANTITY = 20;

// Tax rate (10%)
const TAX_RATE = 0.10;
// Shipping rate ($5 flat)
const SHIPPING_RATE = 5.00;

const calculateTotals = (items) => {
    let subtotal = 0;
    let discount = 0;

    items.forEach(item => {
        const unitPrice = parseFloat(item.unit_price_snapshot);
        const originalPrice = item.original_price_snapshot ? parseFloat(item.original_price_snapshot) : unitPrice;
        const itemTotal = unitPrice * item.quantity;
        const originalTotal = originalPrice * item.quantity;

        subtotal += itemTotal;
        discount += (originalTotal - itemTotal);
    });

    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const grandTotal = subtotal + tax + SHIPPING_RATE;

    return {
        items_count: itemsCount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        shipping: SHIPPING_RATE,
        tax: parseFloat(tax.toFixed(2)),
        grand_total: parseFloat(grandTotal.toFixed(2))
    };
};

// Get or create active cart for customer
const getOrCreateCart = async (customerId, transaction = null) => {
    let cart = await Cart.findOne({
        where: { customer_id: customerId, status: 'active' },
        include: [{ model: CartItem, as: 'items' }],
        transaction
    });

    if (!cart) {
        cart = await Cart.create({
            customer_id: customerId,
            status: 'active',
            currency: 'USD'
        }, { transaction });
    }

    return cart;
};

// Add item to cart
const addItemToCart = async (customerId, itemType, itemId, quantity) => {
    const transaction = await sequelize.transaction();

    try {
        // Get or create active cart
        const cart = await getOrCreateCart(customerId, transaction);

        // Find the product
        let product = null;
        let title = '';
        let author = null;
        let image = null;
        let unitPrice = 0;
        let originalPrice = null;
        let meta = {};

        if (itemType === 'comic') {
            product = await Comics.findByPk(itemId, { transaction });
            if (!product) {
                await transaction.rollback();
                return { status: StatusCodes.NOT_FOUND, message: "Comic not found" };
            }
            title = product.title;
            author = product.author;
            image = product.cover_image_url;
            unitPrice = parseFloat(product.discounted_price || product.price);
            originalPrice = parseFloat(product.price);
            meta = {
                book_type: product.is_digital ? 'E-book' : 'Physical',
                slug: product.slug,
                rating: product.rating
            };
        } else if (itemType === 'character_book') {
            product = await CharacterBook.findByPk(itemId, { transaction });
            if (!product) {
                await transaction.rollback();
                return { status: StatusCodes.NOT_FOUND, message: "Character book not found" };
            }
            title = product.title;
            author = product.author;
            image = product.image;
            unitPrice = parseFloat(product.discounted_price || product.original_price || 0);
            originalPrice = product.original_price ? parseFloat(product.original_price) : null;
            meta = {
                book_type: product.book_type,
                tags: product.tags,
                pdf_url: product.pdf_file,
                category: product.category
            };
        }

        // Check stock
        if (product.stock !== undefined && product.stock < quantity) {
            await transaction.rollback();
            return {
                status: StatusCodes.BAD_REQUEST,
                message: `Insufficient stock. Only ${product.stock} items available.`
            };
        }

        // Check if item already exists in cart
        const existingItem = await CartItem.findOne({
            where: {
                cart_id: cart.cart_id,
                item_type: itemType,
                [itemType === 'comic' ? 'comic_id' : 'character_book_id']: itemId
            },
            transaction
        });

        let cartItem;
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > MAX_QUANTITY) {
                await transaction.rollback();
                return {
                    status: StatusCodes.BAD_REQUEST,
                    message: `Maximum quantity (${MAX_QUANTITY}) exceeded. Current cart quantity: ${existingItem.quantity}`
                };
            }
            existingItem.quantity = newQuantity;
            await existingItem.save({ transaction });
            cartItem = existingItem;
        } else {
            cartItem = await CartItem.create({
                cart_id: cart.cart_id,
                item_type: itemType,
                comic_id: itemType === 'comic' ? itemId : null,
                character_book_id: itemType === 'character_book' ? itemId : null,
                title_snapshot: title,
                author_snapshot: author,
                image_snapshot: image,
                unit_price_snapshot: unitPrice,
                original_price_snapshot: originalPrice,
                quantity,
                meta
            }, { transaction });
        }

        // Reload cart with items
        const updatedCart = await Cart.findOne({
            where: { cart_id: cart.cart_id },
            include: [{ model: CartItem, as: 'items' }],
            transaction
        });

        await transaction.commit();

        const items = updatedCart.items || [];
        const totals = calculateTotals(items);

        return {
            status: StatusCodes.CREATED,
            message: existingItem ? "Item quantity updated in cart" : "Item added to cart",
            data: {
                cart_id: updatedCart.cart_id,
                status: updatedCart.status,
                currency: updatedCart.currency,
                items: items.map(formatCartItem),
                ...totals
            }
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Get cart with totals
const getCart = async (customerId) => {
    try {
        const cart = await getOrCreateCart(customerId);
        const items = cart.items || [];
        const totals = calculateTotals(items);

        // Check stock for all items
        const stockWarnings = await checkStockLevels(items);

        return {
            status: StatusCodes.OK,
            message: "Cart fetched successfully",
            data: {
                cart_id: cart.cart_id,
                status: cart.status,
                currency: cart.currency,
                items: items.map(formatCartItem),
                ...totals,
                stock_warnings: stockWarnings.length > 0 ? stockWarnings : undefined
            }
        };
    } catch (e) {
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Check stock levels for cart items
const checkStockLevels = async (items) => {
    const warnings = [];

    for (const item of items) {
        let product = null;

        if (item.item_type === 'comic' && item.comic_id) {
            product = await Comics.findByPk(item.comic_id);
        } else if (item.item_type === 'character_book' && item.character_book_id) {
            product = await CharacterBook.findByPk(item.character_book_id);
        }

        if (product && product.stock !== undefined) {
            if (product.stock === 0) {
                warnings.push({
                    item_id: item.item_id,
                    title: item.title_snapshot,
                    issue: "Out of stock"
                });
            } else if (product.stock < item.quantity) {
                warnings.push({
                    item_id: item.item_id,
                    title: item.title_snapshot,
                    issue: `Stock reduced. Available: ${product.stock}, In cart: ${item.quantity}`
                });
            }
        }
    }

    return warnings;
};

// Update cart item quantity
const updateCartItem = async (customerId, itemId, quantity) => {
    const transaction = await sequelize.transaction();

    try {
        const cart = await getOrCreateCart(customerId, transaction);

        const cartItem = await CartItem.findOne({
            where: { item_id: itemId, cart_id: cart.cart_id },
            transaction
        });

        if (!cartItem) {
            await transaction.rollback();
            return { status: StatusCodes.NOT_FOUND, message: "Cart item not found" };
        }

        if (quantity <= 0) {
            await cartItem.destroy({ transaction });
            await transaction.commit();
            return getCart(customerId);
        }

        if (quantity > MAX_QUANTITY) {
            await transaction.rollback();
            return {
                status: StatusCodes.BAD_REQUEST,
                message: `Maximum quantity is ${MAX_QUANTITY}`
            };
        }

        // Check stock
        let product = null;
        if (cartItem.item_type === 'comic' && cartItem.comic_id) {
            product = await Comics.findByPk(cartItem.comic_id, { transaction });
        } else if (cartItem.item_type === 'character_book' && cartItem.character_book_id) {
            product = await CharacterBook.findByPk(cartItem.character_book_id, { transaction });
        }

        if (product && product.stock !== undefined && product.stock < quantity) {
            await transaction.rollback();
            return {
                status: StatusCodes.BAD_REQUEST,
                message: `Insufficient stock. Only ${product.stock} items available.`
            };
        }

        cartItem.quantity = quantity;
        await cartItem.save({ transaction });

        const updatedCart = await Cart.findOne({
            where: { cart_id: cart.cart_id },
            include: [{ model: CartItem, as: 'items' }],
            transaction
        });

        await transaction.commit();

        const items = updatedCart.items || [];
        const totals = calculateTotals(items);

        return {
            status: StatusCodes.OK,
            message: "Cart item updated",
            data: {
                cart_id: updatedCart.cart_id,
                status: updatedCart.status,
                currency: updatedCart.currency,
                items: items.map(formatCartItem),
                ...totals
            }
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Remove item from cart
const removeCartItem = async (customerId, itemId) => {
    const transaction = await sequelize.transaction();

    try {
        const cart = await getOrCreateCart(customerId, transaction);

        const cartItem = await CartItem.findOne({
            where: { item_id: itemId, cart_id: cart.cart_id },
            transaction
        });

        if (!cartItem) {
            await transaction.rollback();
            return { status: StatusCodes.NOT_FOUND, message: "Cart item not found" };
        }

        await cartItem.destroy({ transaction });

        const updatedCart = await Cart.findOne({
            where: { cart_id: cart.cart_id },
            include: [{ model: CartItem, as: 'items' }],
            transaction
        });

        await transaction.commit();

        const items = updatedCart.items || [];
        const totals = calculateTotals(items);

        return {
            status: StatusCodes.OK,
            message: "Item removed from cart",
            data: {
                cart_id: updatedCart.cart_id,
                status: updatedCart.status,
                currency: updatedCart.currency,
                items: items.map(formatCartItem),
                ...totals
            }
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Clear cart
const clearCart = async (customerId) => {
    const transaction = await sequelize.transaction();

    try {
        const cart = await getOrCreateCart(customerId, transaction);

        await CartItem.destroy({
            where: { cart_id: cart.cart_id },
            transaction
        });

        await transaction.commit();

        return {
            status: StatusCodes.OK,
            message: "Cart cleared",
            data: {
                cart_id: cart.cart_id,
                status: cart.status,
                currency: cart.currency,
                items: [],
                items_count: 0,
                subtotal: 0,
                discount: 0,
                shipping: 0,
                tax: 0,
                grand_total: 0
            }
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Create order from cart
const createOrderFromCart = async (customerId, paymentMode) => {
    const transaction = await sequelize.transaction();

    try {
        // Lock cart and validate
        const cart = await Cart.findOne({
            where: { customer_id: customerId, status: 'active' },
            include: [{ model: CartItem, as: 'items' }],
            lock: true,
            transaction
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            await transaction.rollback();
            return { status: StatusCodes.BAD_REQUEST, message: "Cart is empty" };
        }

        // Revalidate stock and prices
        for (const item of cart.items) {
            let product = null;
            let currentPrice = null;
            let currentStock = null;

            if (item.item_type === 'comic' && item.comic_id) {
                product = await Comics.findByPk(item.comic_id, {
                    lock: true,
                    transaction
                });
            } else if (item.item_type === 'character_book' && item.character_book_id) {
                product = await CharacterBook.findByPk(item.character_book_id, {
                    lock: true,
                    transaction
                });
            }

            if (!product) {
                await transaction.rollback();
                return {
                    status: StatusCodes.BAD_REQUEST,
                    message: `Product "${item.title_snapshot}" is no longer available`
                };
            }

            // Update price snapshot if changed
            if (item.item_type === 'comic') {
                currentPrice = parseFloat(product.discounted_price || product.price);
                currentStock = product.stock_quantity;
            } else {
                currentPrice = parseFloat(product.discounted_price || product.original_price || 0);
                currentStock = product.stock;
            }

            if (currentPrice !== parseFloat(item.unit_price_snapshot)) {
                item.unit_price_snapshot = currentPrice;
                await item.save({ transaction });
            }

            if (currentStock < item.quantity) {
                await transaction.rollback();
                return {
                    status: StatusCodes.BAD_REQUEST,
                    message: `Insufficient stock for "${item.title_snapshot}". Available: ${currentStock}`
                };
            }
        }

        // Compute totals
        const totals = calculateTotals(cart.items);

        // Build comics JSONB for order
        const comicsData = cart.items.map(item => ({
            item_id: item.item_id,
            item_type: item.item_type,
            comic_id: item.comic_id,
            character_book_id: item.character_book_id,
            title: item.title_snapshot,
            author: item.author_snapshot,
            image: item.image_snapshot,
            unit_price: item.unit_price_snapshot,
            original_price: item.original_price_snapshot,
            quantity: item.quantity,
            meta: item.meta
        }));

        // Create order
        const order = await Order.create({
            customer_id: customerId,
            total_amount: totals.grand_total,
            order_status: 'placed',
            comics: comicsData
        }, { transaction });

        // Create payment
        const payment = await Payment.create({
            payment_status: paymentMode === 'online-transfer' ? 'paid' : 'unpaid',
            payment_received: paymentMode === 'online-transfer' ? totals.grand_total : 0,
            payment_mode: paymentMode,
            order_id: order.order_id
        }, { transaction });

        // Reduce stock
        for (const item of cart.items) {
            let product = null;

            if (item.item_type === 'comic' && item.comic_id) {
                product = await Comics.findByPk(item.comic_id, { transaction });
                if (product) {
                    product.stock_quantity = Math.max(0, product.stock_quantity - item.quantity);
                    await product.save({ transaction });
                }
            } else if (item.item_type === 'character_book' && item.character_book_id) {
                product = await CharacterBook.findByPk(item.character_book_id, { transaction });
                if (product) {
                    product.stock = Math.max(0, product.stock - item.quantity);
                    await product.save({ transaction });
                }
            }
        }

        // Mark cart as converted and create new empty active cart
        cart.status = 'converted';
        await cart.save({ transaction });

        await Cart.create({
            customer_id: customerId,
            status: 'active',
            currency: 'USD'
        }, { transaction });

        await transaction.commit();

        return {
            status: StatusCodes.CREATED,
            message: "Order created successfully",
            data: {
                order: {
                    order_id: order.order_id,
                    order_status: order.order_status,
                    total_amount: order.total_amount,
                    items: comicsData
                },
                payment: {
                    payment_id: payment.payment_id,
                    payment_status: payment.payment_status,
                    payment_mode: payment.payment_mode,
                    payment_received: payment.payment_received
                },
                cart_total: totals
            }
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
    }
};

// Format cart item for response
const formatCartItem = (item) => {
    return {
        item_id: item.item_id,
        item_type: item.item_type,
        comic_id: item.comic_id,
        character_book_id: item.character_book_id,
        title: item.title_snapshot,
        author: item.author_snapshot,
        image: item.image_snapshot,
        unit_price: parseFloat(item.unit_price_snapshot),
        original_price: item.original_price_snapshot ? parseFloat(item.original_price_snapshot) : null,
        quantity: item.quantity,
        meta: item.meta,
        created_at: item.created_at,
        updated_at: item.updated_at
    };
};

module.exports = {
    addItemToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    createOrderFromCart,
    MAX_QUANTITY
};