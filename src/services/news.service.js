import {
  findPublishedArticleById,
  findPublishedArticles,
  findRelatedArticles,
  findNewsStoreSettings,
  increaseArticleViews,
  insertArticleComment,
} from "../repositories/news.repository.js";

function parseContent(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return {
      lead: parsed.lead ?? "",
      body: Array.isArray(parsed.sections) ? parsed.sections : [],
    };
  } catch {
    return { lead: "", body: [{ paragraphs: [value] }] };
  }
}

function mapSummary(row) {
  return {
    id: row.id,
    slug: row.duong_dan,
    title: row.tieu_de,
    excerpt: row.tom_tat ?? "",
    image: row.anh_dai_dien_url,
    date: row.ngay_dang,
    author: row.tac_gia,
    category: row.chuyen_muc,
    views: row.luot_xem,
  };
}

export async function getNewsList() {
  return (await findPublishedArticles()).map(mapSummary);
}

export async function getNewsDetail(id) {
  const articleRow = await findPublishedArticleById(id);
  if (!articleRow) {
    const error = new Error("Không tìm thấy bài viết");
    error.statusCode = 404;
    throw error;
  }

  const [relatedRows, , storeRow] = await Promise.all([
    findRelatedArticles(id),
    increaseArticleViews(id),
    findNewsStoreSettings(),
  ]);
  const content = parseContent(articleRow.noi_dung);

  return {
    article: { ...mapSummary(articleRow), ...content },
    relatedArticles: relatedRows.map(mapSummary),
    store: { name: storeRow.ten_cua_hang, hotline: storeRow.hotline ?? "", email: storeRow.email ?? "" },
  };
}

export async function createNewsComment(articleId, input) {
  const article = await findPublishedArticleById(articleId);
  if (!article) {
    const error = new Error("Không tìm thấy bài viết");
    error.statusCode = 404;
    throw error;
  }

  const name = input.name?.trim();
  const email = input.email?.trim();
  const content = input.content?.trim();
  if (!name || !email || !content) {
    const error = new Error("Vui lòng nhập đầy đủ họ tên, email và nội dung");
    error.statusCode = 400;
    throw error;
  }

  return insertArticleComment({ articleId, name, email, content });
}
