import os
import sys
import requests
from supabase import create_client, Client
import time
import re

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def make_slug(title):
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return slug[:50] + "-" + str(int(time.time()))

def summarize_with_groq(text, title):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    prompt = f"Rewrite this crypto news into a 'Cointelegraph-style' summary.\nFormat:\n1. A punchy title (max 10 words).\n2. 3 short paragraphs of analysis.\n\nSource: {title}\nContext: {text[:2000]}"
    payload = {"model": "llama3-70b-8192", "messages": [{"role": "user", "content": prompt}], "temperature": 0.5}
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Groq Error: {e}")
    return None

def fetch_and_process():
    print("Starting Scraper Job via RSS2JSON...")
    # Use rss2json to bypass Cloudflare/Bot protection
    rss_url = "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss"
    
    try:
        response = requests.get(rss_url, timeout=15)
        data = response.json()
        
        if data.get('status') != 'ok':
            print("Failed to fetch RSS")
            return

        for item in data['items'][:4]:
            # Check duplication
            existing = supabase.table('articles').select('id').eq('title', item['title']).execute()
            if len(existing.data) > 0:
                print(f"Skipping duplicate: {item['title']}")
                continue
            
            clean_text = re.sub(r'<[^>]+>', '', item['description']).strip()
            
            analysis = summarize_with_groq(clean_text, item['title'])
            if not analysis:
                analysis = f"{item['title']}\n\n{clean_text}"

            parts = analysis.split('\n\n', 1)
            final_title = parts[0].replace('**', '').replace('Title:', '').strip()
            final_content = parts[1].strip() if len(parts) > 1 else clean_text
            
            image_url = item.get('thumbnail') or item.get('enclosure', {}).get('link') or "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000"

            # EXACT MATCH WITH SUPABASE COLUMNS
            db_payload = {
                "title": final_title,
                "slug": make_slug(final_title),
                "content": final_content,
                "excerpt": final_content[:150] + "...",
                "image_url": image_url,
                "category": "Market News",
                "author": "Cointelegraph"
            }
            
            try:
                supabase.table('articles').insert(db_payload).execute()
                print(f"✅ Published: {final_title}")
            except Exception as e:
                print(f"❌ DB Error: {e}")
            time.sleep(2)
            
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    fetch_and_process()
