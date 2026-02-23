import os
import sys
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import feedparser
import time
import re

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

FEEDS = [
    {"source": "Cointelegraph", "url": "https://cointelegraph.com/rss"}
]

def make_slug(title):
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return slug[:50]

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
    print("Starting Scraper Job...")
    for feed in FEEDS:
        try:
            response = requests.get(feed['url'], headers=HEADERS, timeout=10)
            if response.status_code != 200:
                continue
            parsed = feedparser.parse(response.content)
            
            for entry in parsed.entries[:3]:
                # Check duplication
                existing = supabase.table('articles').select('id').eq('title', entry.title).execute()
                if len(existing.data) > 0:
                    continue
                
                raw_summary = entry.description if hasattr(entry, 'description') else entry.title
                soup = BeautifulSoup(raw_summary, "html.parser")
                clean_text = soup.get_text(separator=" ").strip()
                
                analysis = summarize_with_groq(clean_text, entry.title)
                if not analysis:
                    analysis = f"{entry.title}\n\n{clean_text}"

                parts = analysis.split('\n\n', 1)
                final_title = parts[0].replace('**', '').replace('Title:', '').strip()
                final_body = parts[1].strip() if len(parts) > 1 else clean_text
                
                image_url = "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1000"
                if hasattr(entry, 'media_content'):
                    image_url = entry.media_content[0]['url']
                
                slug = make_slug(final_title) + "-" + str(int(time.time()))

                data = {
                    "title": final_title,
                    "slug": slug,
                    "body": final_body,
                    "content": final_body,
                    "image_url": image_url,
                    "category": "Market News",
                    "author_name": feed['source'],
                    "source": feed['source'],
                    "external_url": entry.link
                }
                
                try:
                    res = supabase.table('articles').insert(data).execute()
                    print(f"✅ Published: {final_title}")
                except Exception as e:
                    print(f"❌ DB Error: {e}")
                time.sleep(2)
        except Exception as e:
            print(f"Feed Error: {e}")

if __name__ == "__main__":
    fetch_and_process()
