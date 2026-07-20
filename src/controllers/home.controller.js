import { getHomeData } from "../services/home.service.js";
import { getAdminSettings } from "../services/admin.service.js";

export async function getHomePage(_request, response, next) {
  try {
    response.json({ success: true, data: await getHomeData() });
  } catch (error) {
    next(error);
  }
}

export async function getPublicSettings(_request, response, next) {
  try {
    response.json({ success: true, data: await getAdminSettings() });
  } catch (error) {
    next(error);
  }
}
