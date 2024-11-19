from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import scrape_article_content
from news_handler import fetch_and_save_news, save_article_to_json
from vector_search import load_news_into_vector_store, search_vector_store, generate_response, cleanup_vector_store

app = Flask(__name__)
CORS(app)


@app.route("/api/search-news", methods=["GET"])
def search_news_and_vector():
    search_query = request.args.get("query", "top headlines")

    try:
        cleaned_articles = fetch_and_save_news(search_query)

        load_news_into_vector_store()
        context = search_vector_store(search_query)
        ai_response = generate_response(search_query, context)
        cleanup_vector_store()

        return jsonify({"articles": cleaned_articles, "aiResponse": ai_response})

    except Exception as e:
        print(f"Error in combined search: {e}")
        return jsonify({"error": "Failed to perform combined search."}), 500


@app.route("/api/ai-summary", methods=["POST"])
def ai_summary():
    article_data = request.get_json()
    article_url = article_data.get("url")
    article_title = article_data.get("title")

    article_content = scrape_article_content(article_url)

    if article_content:
        article_data_to_save = {
            "title": article_title,
            "description": article_data.get("description", ""),
            "content": article_content,
            "urlToImage": article_data.get("urlToImage", ""),
            "url": article_url
        }

        save_article_to_json(article_data_to_save)
        load_news_into_vector_store()
        context = search_vector_store(article_title)
        ai_summary = generate_response(article_title, context)
        cleanup_vector_store()

        return jsonify({"summary": ai_summary})
    else:
        return jsonify({"error": "Failed to scrape article content."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
