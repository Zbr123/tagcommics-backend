const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");

const registerValidatorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.optional(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const registerValidator = (req, res, done) => {
  try {
    const { error } = registerValidatorSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
    }
    done();
  } catch (error) {
    console.error("validators->authValidator.js->registerValidator");
    console.log(error);
  }
};

const loginValidator = (req, res, done) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
    }
    done();
  } catch (error) {
    console.error("validators->authValidator.js->loginValidator");
    console.log(error);
  }
};

module.exports = {
  registerValidator,
  loginValidator,
};
