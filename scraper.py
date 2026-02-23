import os
import requests
import json
from bs4 import BeautifulSoup
from supabase import create_client, Client
import feedparser
import time

# --- Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Must be service role to bypass RLS
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

FEEDS = [
    {"source": "Cointelegraph", "url": "https://cointelegraph.com/rss"},
    {"source": "The Defiant", "url": "https://thedefiant.io/api/feed"}
]

def summarize_with_groq(text, title):
    """Uses Groq LLaMA3 to turn an article into an Institutional Alpha Call"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    
    prompt = f"""
    You are an elite crypto quantitative analyst writing for a terminal called CryptoBrainNews.
    Take the following crypto news article and rewrite it into an "Alpha Call" format.
    Tone: Institutional, highly analytical, objective, concise.
    Format: 
    1. A punchy, analytical title (max 10 words).
    2. Exactly 3 paragraphs of deep analysis. Focus on liquidity flows, market impact, and technicals.
    
    Source Title: {title}
    Source Text: {text[:3000]}
    """
    
    payload = {
        "model": "llama3-70b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    return None

def fetch_and_process():
    for feed in FEEDS:
        print(f"Parsing feed: {feed['source']}")
        parsed = feedparser.parse(feed['url'])
        
        # Grab the top 2 latest articles from each feed
        for entry in parsed.entries[:2]:
            # Check if already in DB
            existing = supabase.table('articles').select('id').eq('title', entry.title).execute()
            if len(existing.data) > 0:
                print(f"Skipping (already exists): {entry.title}")
                continue
                
            print(f"Processing: {entry.title}")
            
            # Extract basic text from RSS description/content
            raw_html = entry.description if hasattr(entry, 'description') else ""
            soup = BeautifulSoup(raw_html, "html.parser")
            clean_text = soup.get_text(separator="\n").strip()
            
            # Generate Alpha Analysis
            analysis = summarize_with_groq(clean_text, entry.title)
            if not analysis:
                continue
                
            # Parse Title and Body from Groq response
            parts = analysis.split('\n\n', 1)
            ai_title = parts[0].replace('**', '').replace('Title:', '').strip()
            ai_body = parts[1].strip() if len(parts) > 1 else analysis
            
            # Find an image (if available in RSS)
            image_url = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200" # Fallback
            if hasattr(entry, 'media_content') and len(entry.media_content) > 0:
                image_url = entry.media_content[0]['url']
                
            # Insert into Supabase
            data = {
                "title": ai_title,
                "body": ai_body,
                "image_url": image_url,
                "category": "Alpha Call",
                "tags": ["AI Analysis", "Market Intel"],
                "author_name": "CryptoBrain AI",
                "source": feed['source']
            }
            
            try:
                supabase.table('articles').insert(data).execute()
                print(f"Successfully published: {ai_title}")
            except Exception as e:
                print(f"DB Insert failed: {e}")
                
            time.sleep(3) # Rate limit protection

if __name__ == "__main__":
    fetch_and_process()
