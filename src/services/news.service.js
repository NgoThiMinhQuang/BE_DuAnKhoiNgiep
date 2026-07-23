import {
  findPublishedArticleById,
  findPublishedArticles,
  findRelatedArticles,
  findNewsStoreSettings,
  findApprovedArticleComments,
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

  const [relatedRows, , storeRow, commentRows] = await Promise.all([
    findRelatedArticles(id),
    increaseArticleViews(id),
    findNewsStoreSettings(),
    findApprovedArticleComments(id),
  ]);
  const content = parseContent(articleRow.noi_dung);

  return {
    article: { ...mapSummary(articleRow), ...content },
    relatedArticles: relatedRows.map(mapSummary),
    comments: commentRows.map((comment) => ({
      id: String(comment.id),
      name: comment.ho_ten,
      content: comment.noi_dung,
      createdAt: comment.ngay_tao,
    })),
    store: { name: storeRow.ten_cua_hang, hotline: storeRow.hotline ?? "", email: storeRow.email ?? "" },
  };
}

export async function createNewsComment(articleId, input) {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const content = input.content?.trim();
  if (!name || !email || !content) {
    const error = new Error("Vui lòng nhập đầy đủ họ tên, email và nội dung");
    error.statusCode = 400;
    throw error;
  }

  if (name.length > 150 || email.length > 150 || content.length > 2000) {
    const error = new Error("Bình luận vượt quá độ dài cho phép");
    error.statusCode = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Email không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const article = await findPublishedArticleById(articleId);
  if (!article) {
    const error = new Error("Không tìm thấy bài viết");
    error.statusCode = 404;
    throw error;
  }

  return insertArticleComment({ articleId, name, email, content });
}
