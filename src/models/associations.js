const { Comics } = require("./comics");
const { Category } = require("./categories");
const { Tag } = require("./tags");
const User = require("./user");
const Order = require("./order");
const ComicCharacter = require("./comic_characters");
const CharacterBook = require("./character_book");
const Role = require("./role");
const Cart = require("./cart");
const CartItem = require("./cart_item");
const Payment = require("./payment");

// Comic <-> Category (many-to-many); alias avoids collision with Comics.categories (JSONB attribute)
Comics.belongsToMany(Category, {
    through: "comic-categories",
    foreignKey: "comic_id",
    otherKey: "category_id",
    as: "categoryList"
});
Category.belongsToMany(Comics, {
    through: "comic-categories",
    foreignKey: "category_id",
    otherKey: "comic_id",
    as: "comics"
});

// Comic <-> Tag (many-to-many); alias avoids collision with Comics.tags (JSONB attribute)
Comics.belongsToMany(Tag, {
    through: "comic-tags",
    foreignKey: "comic_id",
    otherKey: "tag_id",
    as: "tagList"
});
Tag.belongsToMany(Comics, {
    through: "comic-tags",
    foreignKey: "tag_id",
    otherKey: "comic_id",
    as: "comics"
});

Comics.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator"
});

User.hasMany(Comics, {
    foreignKey: "created_by",
    as: "comics"
});

// Order -> User (customer); Order belongs to User via customer_id
Order.belongsTo(User, {
    foreignKey: "customer_id",
    as: "customer"
});
User.hasMany(Order, {
    foreignKey: "customer_id",
    as: "orders"
});

// ComicCharacter <-> Role (many-to-many)
ComicCharacter.belongsToMany(Role, {
    through: "character-roles",
    foreignKey: "character_id",
    otherKey: "role_id",
    as: "roles"
});
Role.belongsToMany(ComicCharacter, {
    through: "character-roles",
    foreignKey: "role_id",
    otherKey: "character_id",
    as: "characters"
});

// ComicCharacter <-> CharacterBook (one-to-many)
ComicCharacter.hasMany(CharacterBook, {
    foreignKey: "character_id",
    as: "books"
});
CharacterBook.belongsTo(ComicCharacter, {
    foreignKey: "character_id"
});

// CartItem -> Comics association already defined in cart_item.js model

// CartItem -> CharacterBook association already defined in cart_item.js model

// Order -> Payment (one-to-one via order_id)
Order.hasOne(Payment, { as: 'payment', foreignKey: 'order_id' });
Payment.belongsTo(Order, { as: 'order', foreignKey: 'order_id' });