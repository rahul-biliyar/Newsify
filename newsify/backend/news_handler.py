import requests
import json
from scraper import scrape_article_content

API_KEY = "7cbf35ec96564be1b12f1a328830215f"


def fetch_and_save_news(search_query="top headlines"):
    url = "https://newsapi.org/v2/everything"
    params = {
        'q': search_query,
        'language': 'en',
        'pageSize': 6,
        'sortBy': 'relevancy',
        'apiKey': API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    news_data = response.json()
    articles = news_data.get("articles", [])

    cleaned_articles = []
    for article in articles:
        title = article.get("title", "")
        if "[Removed]" in title:
            continue

        article_url = article.get("url")
        image_url = article.get("urlToImage")
        scraped_content = scrape_article_content(article_url)
        content = scraped_content if scraped_content else article.get(
            "content", "Content not available")

        cleaned_articles.append({
            "title": title,
            "description": article.get("description", ""),
            "content": content,
            "urlToImage": image_url,
            "url": article_url
        })

    try:
        with open("news_data.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_articles, f, ensure_ascii=False, indent=4)
        print("News data successfully saved to news_data.json")
    except Exception as e:
        print(f"Error saving news data to JSON: {e}")

    return cleaned_articles


def save_article_to_json(article_data):
    try:
        with open("news_data.json", "w", encoding="utf-8") as f:
            json.dump([article_data], f, ensure_ascii=False, indent=4)
        print(f"Article '{article_data['title']}' saved to news_data.json.")
    except Exception as e:
        print(f"Error saving article data to JSON: {e}")
