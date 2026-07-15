import ContactModel from '../models/contactModel.js';
import EmailService from './emailService.js';
import logger from '../middlewares/logger.js';

const ContactService = {
  createContactMessage: async (contactData) => {
    const message = await ContactModel.create(contactData);

    const businessEmail = process.env.FROM_EMAIL || 'noreply@theolan.co.ke';
    EmailService.sendAdminAlert(businessEmail, {
      title: 'New Contact Message',
      message: '<p><strong>Name:</strong> ' + contactData.name + '</p><p><strong>Email:</strong> ' + contactData.email + '</p>' + (contactData.phone ? '<p><strong>Phone:</strong> ' + contactData.phone + '</p>' : '') + '<p><strong>Subject:</strong> ' + contactData.subject + '</p><p><strong>Message:</strong></p><p>' + contactData.message.replace(/\n/g, '<br>') + '</p>',
      action_url: null
    }).catch((err) => {
      logger.error('Contact message email notification failed', {
        contactMessageId: message.id,
        error: err.message
      });
    });

    logger.info('Contact message created', {
      contactMessageId: message.id,
      name: contactData.name,
      email: contactData.email
    });

    return message;
  }
};

export default ContactService;
