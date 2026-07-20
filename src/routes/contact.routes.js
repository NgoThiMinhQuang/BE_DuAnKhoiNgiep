import { Router } from "express";

import { answerChatbot, createContact } from "../controllers/contact.controller.js";

export const contactRouter = Router();

contactRouter.post("/chatbot", answerChatbot);
contactRouter.post("/", createContact);
