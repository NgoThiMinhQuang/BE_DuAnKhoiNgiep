import { Router } from "express";

import { getHomePage } from "../controllers/home.controller.js";

export const homeRouter = Router();

homeRouter.get("/", getHomePage);
