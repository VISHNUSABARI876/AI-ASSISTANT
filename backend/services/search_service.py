"""
Search Service — DuckDuckGo Instant Web Search Grounding.
Provides real-time web context enrichment for AI queries.
"""
import logging
import json
import re
import urllib.parse
import urllib.request
from typing import List, Dict

logger = logging.getLogger(__name__)


def search_web(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """
    Perform a light, keyless DuckDuckGo web search.
    Returns a list of dicts with keys: 'title', 'snippet', 'url'.
    """
    if not query or not query.strip():
        return []

    clean_query = query.strip()
    encoded_query = urllib.parse.quote_plus(clean_query)
    
    # 1. Try DuckDuckGo Instant Answer API first
    api_url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1&skip_disambig=1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    results = []

    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode("utf-8"))

            # Abstract / Direct Answer
            if data.get("AbstractText"):
                results.append({
                    "title": data.get("Heading") or clean_query,
                    "snippet": data.get("AbstractText"),
                    "url": data.get("AbstractURL") or "https://duckduckgo.com",
                })

            # Related Topics
            for topic in data.get("RelatedTopics", []):
                if len(results) >= max_results:
                    break
                if isinstance(topic, dict) and topic.get("Text") and topic.get("FirstURL"):
                    results.append({
                        "title": topic.get("Text")[:60] + "...",
                        "snippet": topic.get("Text"),
                        "url": topic.get("FirstURL"),
                    })
    except Exception as exc:
        logger.warning(f"DuckDuckGo API search error: {exc}")

    # 2. Fallback: DuckDuckGo HTML parsing if API returned few results
    if len(results) < max_results:
        try:
            html_url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            req = urllib.request.Request(html_url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                html_text = resp.read().decode("utf-8", errors="ignore")

                # Match snippet results
                # <a class="result__snippet" ...>...</a>
                snippets = re.findall(r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>', html_text, re.DOTALL)
                titles = re.findall(r'<a[^>]*class="result__url"[^>]*>(.*?)</a>', html_text, re.DOTALL)
                links = re.findall(r'href="//duckduckgo.com/l/\?uddg=(.*?)"', html_text)

                for i in range(min(len(snippets), max_results - len(results))):
                    clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
                    clean_title = re.sub(r'<[^>]+>', '', titles[i]).strip() if i < len(titles) else "Web Result"
                    raw_link = urllib.parse.unquote(links[i].split('&')[0]) if i < len(links) else ""

                    if clean_snippet:
                        results.append({
                            "title": clean_title or f"Result {i+1}",
                            "snippet": clean_snippet,
                            "url": raw_link or "https://duckduckgo.com"
                        })
        except Exception as exc:
            logger.warning(f"DuckDuckGo HTML fallback error: {exc}")

    return results[:max_results]


def format_search_context(results: List[Dict[str, str]]) -> str:
    """Format search results into a clean grounding context block for the LLM."""
    if not results:
        return ""

    context_lines = [
        "--- REAL-TIME WEB SEARCH RESULTS ---",
        "Use the following up-to-date web search grounding facts to inform your response. "
        "Include source URLs or citations when referencing these facts:",
    ]
    for idx, item in enumerate(results, start=1):
        context_lines.append(f"[{idx}] Title: {item['title']}")
        context_lines.append(f"    Snippet: {item['snippet']}")
        context_lines.append(f"    URL: {item['url']}")
        context_lines.append("")

    context_lines.append("--- END OF WEB SEARCH RESULTS ---")
    return "\n".join(context_lines)
