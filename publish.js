const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function publishArticle(data) {
  const { title, body, category, author_name, author_bio } = data;
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  const { error } = await supabase.from('articles').insert([{
    title, slug, body, category, author_name, author_bio,
    image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000',
    source: 'CryptoBrain',
    is_featured: true
  }]);

  if (error) console.error('Error:', error.message);
  else console.log('🚀 Article Published Successfully!');
}

// Example Usage
publishArticle({
  title: 'Ethereum Pectra Upgrade Set for Q1 2025',
  body: 'The Ethereum developer community has finalized the scope for the Pectra upgrade...',
  category: 'Infrastructure',
  author_name: 'Lead Dev',
  author_bio: 'Core contributor to the Ethereum ecosystem.'
});
