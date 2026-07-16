import {
  findFeaturedProducts,
  findFeaturedTestimonials,
  findLatestArticles,
} from "../repositories/home.repository.js";

export async function getHomeData() {
  const [products, articles, testimonials] = await Promise.all([
    findFeaturedProducts(),
    findLatestArticles(),
    findFeaturedTestimonials(),
  ]);

  return {
    featuredProduct: products.find((product) => product.slug === "combo-cham-soc-da-toan-dien-dau-do-3-mon-150g") ?? products[0] ?? null,
    bestSellers: products.map((product) => ({ ...product, rating: Math.round(product.ratingNum) })),
    articles,
    testimonials,
  };
}
