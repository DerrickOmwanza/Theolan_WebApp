import Joi from 'joi';
import { ValidationError } from '../middlewares/errorHandler.js';

/**
 * Validate request data against a Joi schema.
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {Object} data - Data to validate
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
export const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key,
      issue: d.message
    }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

export default { validate };