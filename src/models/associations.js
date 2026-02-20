const { Comics } = require("./comics");
const { Category } = require("./categories");
const { Tag } = require("./tags");

// Comic <-> Category (many-to-many)
Comics.belongsToMany(Category, {
    through: "comic-categories",
    foreignKey: "comic_id",
    otherKey: "category_id"
});
Category.belongsToMany(Comics, {
    through: "comic-categories",
    foreignKey: "category_id",
    otherKey: "comic_id"
});

// Comic <-> Tag (many-to-many)
Comics.belongsToMany(Tag, {
    through: "comic-tags",
    foreignKey: "comic_id",
    otherKey: "tag_id"
});
Tag.belongsToMany(Comics, {
    through: "comic-tags",
    foreignKey: "tag_id",
    otherKey: "comic_id"
});
