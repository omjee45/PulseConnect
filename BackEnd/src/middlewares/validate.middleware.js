const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Zod schema validation middleware factory.
 * Usage: router.post('/register', validate(registerSchema), controller)
 *
 * Validates req.body against the provided Zod schema.
 * On failure, formats Zod errors into a readable array and passes ApiError(400) to errorHandler.
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body); // also strips unknown fields
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(new ApiError(400, 'Validation failed', errors));
      }
      next(err);
    }
  };
}

module.exports = validate;
