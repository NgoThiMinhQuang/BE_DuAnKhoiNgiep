import { Router } from "express";

import { showImage } from "../controllers/media.controller.js";

export const mediaRouter = Router();

mediaRouter.get("/:id", showImage);
