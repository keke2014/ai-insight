#!/usr/bin/env python3
import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DATA_PATH = PROJECT_ROOT / "data"

def clean_html(raw_html):
    if not isinstance(raw_html, str):
        return ""
    cleanr = re.compile('<.*?>')
    return re.sub(cleanr, '', raw_html).strip()

def build_index():
    index_data = []
    
    for file_path in sorted(DATA_PATH.glob("daily-content-*.json"), reverse=True):
        date_str = file_path.stem.replace("daily-content-", "")
        # Get path for HTML file
        month_str = date_str[:7]
        html_url = f"01-daily-reports/{month_str}/{date_str}-v3.html"
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            continue
            
        # Parse overview
        for ov in data.get("overview", []):
            if ov.get("headline"):
                index_data.append({
                    "date": date_str,
                    "type": "摘要",
                    "title": clean_html(ov.get("headline")),
                    "content": clean_html(ov.get("text")),
                    "url": html_url
                })
                
        # Parse deep focus
        for tab in data.get("tabs", []):
            df = tab.get("deep_focus", {})
            if df and df.get("title"):
                index_data.append({
                    "date": date_str,
                    "type": "深度",
                    "title": clean_html(df.get("title")),
                    "content": clean_html(df.get("takeaway", "")) + " " + " ".join(clean_html(p) for p in df.get("paragraphs", [])),
                    "url": html_url
                })
                
            # Parse news
            for region in ["overseas", "china"]:
                for news in tab.get("news", {}).get(region, []):
                    if news.get("title"):
                        content_str = ""
                        details = news.get("details", {})
                        if isinstance(details, dict):
                            content_str = clean_html(details.get("finding", "")) + " " + clean_html(details.get("impact", ""))
                        index_data.append({
                            "date": date_str,
                            "type": "资讯",
                            "title": clean_html(news.get("title")),
                            "content": content_str,
                            "url": html_url
                        })

    # Save to root and public
    root_index = PROJECT_ROOT / "search_index.json"
    public_index = PROJECT_ROOT / "public" / "search_index.json"
    
    with open(root_index, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, separators=(',', ':'))
    
    public_index.parent.mkdir(exist_ok=True)
    with open(public_index, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print(f"✅ Built search index with {len(index_data)} entries.")

if __name__ == "__main__":
    build_index()
