import requests
from bs4 import BeautifulSoup


def scrape_article_content(url):
    try:
        print(f"Scraping content from: {url}")
        page = requests.get(url)
        page.raise_for_status()

        soup = BeautifulSoup(page.content, "html.parser")
        content = " ".join([p.get_text() for p in soup.find_all("p")])

        if not content.strip():
            print(f"Warning: No readable content found for {url}")
        else:
            print(f"Successfully scraped content from {url[:50]}...")

        return content.strip() if content else None

    except requests.exceptions.RequestException as e:
        print(f"Error scraping {url}: {e}")
        return None
