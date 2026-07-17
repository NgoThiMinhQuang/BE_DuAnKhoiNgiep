import { Router } from "express";

import { createContact } from "../controllers/contact.controller.js";

export const contactRouter = Router();

contactRouter.post("/", createContact);
