import { createClient } from 'next-sanity';
import { cached } from './cache';
 
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_ME',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-04',
  useCdn: true,
});
 
export async function getSanityPosts() {
  return cached('sanity:posts', async () => {
    return client.fetch(`*[_type == "post" && status != "archived"] | order(publishedAt desc)[0...50] {
      _id, title, "slug": slug.current,
      "imageUrl": mainImage.asset->url,
      publishedAt, scheduledPublishAt, status, category, excerpt,
      "authorName": author->name,
      "authorAvatar": author->avatar.asset->url,
      "authorRole": author->role,
      seo, body
    }`);
  }, 60);
}
 
export async function getSanityPostsByCategory(category: string) {
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return cached(`sanity:posts:${category}`, async () => {
    return client.fetch(
      `*[_type == "post" && status != "archived" && (category == $cat || category == $slug)] | order(publishedAt desc)[0...30] {
        _id, title, "slug": slug.current,
        "imageUrl": mainImage.asset->url,
        publishedAt, category, excerpt,
        "authorName": author->name, seo, body
      }`,
      { cat: capitalized, slug: category.toLowerCase() }
    );
  }, 60);
}
 
// Admin: fetch all posts including drafts (uses non-CDN client)
export async function getAllPostsAdmin() {
  const adminClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_ME',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-03-04',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
  return adminClient.fetch(`*[_type == "post"] | order(_createdAt desc) {
    _id, title, "slug": slug.current, status, category,
    publishedAt, scheduledPublishAt, _createdAt, _updatedAt,
    "authorName": author->name
  }`);
}
 
export async function getSanityAirdrops() {
  return cached('sanity:airdrops', async () => {
    return client.fetch(`*[_type == "airdropGuide"] {
      _id, title, "slug": slug.current, chain, probability,
      "imageUrl": image.asset->url, isFeatured, steps
    }`);
  }, 300);
}
 
export async function getSanityEvents() {
  return cached('sanity:events', async () => {
    return client.fetch(`*[_type == "event" && endDate >= now()] | order(startDate asc) {
      _id, title, startDate, endDate, locationCity, locationCountry,
      venue, url, isOnline, isFeatured, description, "imageUrl": image.asset->url
    }`);
  }, 300);
}
 
export async function getSanityPlaybooks() {
  return cached('sanity:playbooks', async () => {
    return client.fetch(`*[_type == "playbook"] {
      _id, title, protocol, yamlConfig, sybilParams, tier,
      isThirdParty, authorName, stripeAccountId, priceUsd
    }`);
  }, 300);
}
 
export async function getSanityGlossary() {
  return cached('sanity:glossary', async () => {
    return client.fetch(`*[_type == "glossaryTerm"] { _id, term, definition, category }`);
  }, 3600);
}
 
export async function getActiveNotifications() {
  return cached('sanity:notifications', async () => {
    return client.fetch(`*[_type == "siteNotification" && activeFrom <= now() && activeUntil >= now()] {
      _id, message, type, link
    }`);
  }, 60);
}
