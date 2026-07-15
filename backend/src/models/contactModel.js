import { db } from "../config/database.js";

/**
 * Contact Model
 * Data access layer for contact_messages table.
 */
const ContactModel = {
  create: async (messageData) => {
    const [message] = await db("contact_messages").insert(messageData).returning("*");
    return message;
  }
};

export default ContactModel;
