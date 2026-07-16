import { Router } from "express";

import { addNewsComment, listNews, showNews } from "../controllers/news.controller.js";

export const newsRouter = Router();

newsRouter.get("/", listNews);
newsRouter.get("/:id", showNews);
newsRouter.post("/:id/comments", addNewsComment);
