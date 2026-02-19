const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");
const { encryptPassword } = require("../utils/encrypt-password");
const { comparePassword } = require("../utils/compare-password");
const ROLES = require("../enums/roles");

const User = sequelize.define("user", {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  user_role: {
    type: DataTypes.ENUM(ROLES.CUSTOMER, ROLES.ADMIN),
    allowNull: false,
    defaultValue: ROLES.CUSTOMER,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: {}
    }
  }
});


// create a hashed password before inserting it into DB
User.addHook('beforeCreate', async (user, options) => {
  if (user.password) {
    user.password = await encryptPassword(user.password);
  }
});


//this is for password validation (during login or any sort of authentication)
User.prototype.validatePassword = async function (password) {
  return await comparePassword(password, this.password);
};

//for updation hook
User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    user.password = await encryptPassword(user.password);
  }
});

module.exports = User;
