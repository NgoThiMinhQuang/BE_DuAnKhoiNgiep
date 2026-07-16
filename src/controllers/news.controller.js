import { createNewsComment, getNewsDetail, getNewsList } from "../services/news.service.js";

export async function listNews(_request, response, next) {
  try {
    response.json({ success: true, data: { articles: await getNewsList() } });
  } catch (error) {
    next(error);
  }
}

export async function showNews(request, response, next) {
  try {
    response.json({ success: true, data: await getNewsDetail(request.params.id) });
  } catch (error) {
    next(error);
  }
}

export async function addNewsComment(request, response, next) {
  try {
    const id = await createNewsComment(request.params.id, request.body);
    response.status(201).json({ success: true, data: { id, status: "CHO_DUYET" } });
  } catch (error) {
    next(error);
  }
}
