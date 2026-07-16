import { getHomeData } from "../services/home.service.js";

export async function getHomePage(_request, response, next) {
  try {
    response.json({ success: true, data: await getHomeData() });
  } catch (error) {
    next(error);
  }
}
