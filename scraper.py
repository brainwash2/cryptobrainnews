import os
import requests
import json
from bs4 import BeautifulSoup
from supabase import create_client, Client
import feedparser
import time
import random

# --- Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cointelegraph blocks standard python agents, so we fake being a browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.google.com/"
}

FEEDS = [
    {"source": "Cointelegraph", "url": "https://cointelegraph.com/rss"},
    {"source": "The Defiant", "url": "https://thedefiant.io/api/feed"}
]

def summarize_with_groq(text, title):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    
    prompt = f"""
    Rewrite this crypto news into a 'Cointelegraph-style' summary.
    Style: Professional, witty, institutional but engaging.
    Format: 
    1. A punchy title (max 10 words).
    2. 3 short paragraphs of analysis.
    
    Source: {title}
    Context: {text[:2000]}
    """
    
    payload = {
        "model": "llama3-70b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
    except:
        return None
    return None

def fetch_and_process():
    print("Starting Scraper Job...")
    
    for feed in FEEDS:
        print(f"Fetching: {feed['source']}")
        
        # Use requests with headers to download RSS content first
        try:
            response = requests.get(feed['url'], headers=HEADERS, timeout=10)
            if response.status_code != 200:
                print(f"Failed to fetch {feed['source']}: Status {response.status_code}")
                continue
                
            # Parse the content we downloaded
            parsed = feedparser.parse(response.content)
            
            if not parsed.entries:
                print(f"No entries found for {feed['source']}")
                continue

            print(f"Found {len(parsed.entries)} articles. Processing top 3...")

            for entry in parsed.entries[:3]:
                # Check duplication
                existing = supabase.table('articles').select('id').eq('title', entry.title).execute()
                if len(existing.data) > 0:
                    print(f"Skipping duplicate: {entry.title}")
                    continue
                
                print(f"Processing New: {entry.title}")
                
                # AI Summary
                raw_summary = entry.description if hasattr(entry, 'description') else entry.title
                soup = BeautifulSoup(raw_summary, "html.parser")
                clean_text = soup.get_text(separator=" ").strip()
                
                analysis = summarize_with_groq(clean_text, entry.title)
                if not analysis:
                    # Fallback to original text if AI fails
                    analysis = f"{entry.title}\n\n{clean_text}"

                # Formatting
                parts = analysis.split('\n\n', 1)
                final_title = parts[0].replace('**', '').replace('Title:', '').strip()
                final_body = parts[1].strip() if len(parts) > 1 else clean_text

                # Image extraction
                image_url = "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1000"
                if hasattr(entry, 'media_content'):
                    image_url = entry.media_content[0]['url']
                elif hasattr(entry, 'links'):
                    for link in entry.links:
                        if 'image' in link.type:
                            image_url = link.href
                            break

                # DB Insert
                data = {
                    "title": final_title,
                    "body": final_body,
                    "image_url": image_url,
                    "category": "Market News",
                    "tags": [feed['source']],
                    "author_name": feed['source'],
                    "source": feed['source'],
                    "external_url": entry.link
                }
                
                try:
                    supabase.table('articles').insert(data).execute()
                    print(f"✅ Published: {final_title}")
                except Exception as e:
                    print(f"❌ DB Error: {e}")
                
                time.sleep(2) 

        except Exception as e:
            print(f"Critical Feed Error: {e}")

if __name__ == "__main__":
    fetch_and_process()
