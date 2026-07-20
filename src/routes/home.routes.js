import { Router } from "express";

import { getHomePage, getPublicSettings } from "../controllers/home.controller.js";

export const homeRouter = Router();

homeRouter.get("/", getHomePage);
homeRouter.get("/settings", getPublicSettings);
