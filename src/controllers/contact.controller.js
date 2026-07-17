import { submitContact } from "../services/contact.service.js";

export async function createContact(request, response, next) {
  try {
    response.status(201).json({ success: true, data: await submitContact(request.body) });
  } catch (error) {
    next(error);
  }
}
