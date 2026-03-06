import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_ME',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-04',
  useCdn: false, // Set to false to ensure you get the newest articles immediately
})

export async function getSanityPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0...10] {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": mainImage.asset->url,
      publishedAt,
      category,
      body
    }
  `)
}

export async function getSanityPostBySlug(slug: string) {
  return client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      "imageUrl": mainImage.asset->url,
      publishedAt,
      category,
      body
    }
  `, { slug })
}
