import Joi from 'joi';
import ContactService from '../services/contactService.js';
import { asyncHandler, ValidationError } from '../middlewares/errorHandler.js';

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters'
  }),
  email: Joi.string().trim().email().max(255).required().messages({
    'string.email': 'Must be a valid email address'
  }),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
  subject: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Subject is required'
  }),
  message: Joi.string().trim().min(10).max(5000).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters'
  })
});

const validate = (schema, body) => {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key,
      issue: d.message
    }));
    throw new ValidationError(error.details[0].message, details);
  }
  return value;
};

const ContactController = {
  createContact: asyncHandler(async (req, res) => {
    const data = validate(contactSchema, req.body);
    const message = await ContactService.createContactMessage(data);

    res.status(201).json({
      success: true,
      message: 'Message received. We will contact you soon.',
      data: {
        id: message.id,
        created_at: message.created_at
      }
    });
  })
};

export default ContactController;
