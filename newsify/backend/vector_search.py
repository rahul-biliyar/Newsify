import os
import shutil
import json
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"
STORE_FOLDER = "vector_store"
NEWS_FILE = "news_data.json"
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")


def load_news_into_vector_store():
    try:
        if os.path.exists(STORE_FOLDER):
            shutil.rmtree(STORE_FOLDER)
        os.makedirs(STORE_FOLDER, exist_ok=True)

        with open(NEWS_FILE, "r", encoding="utf-8") as f:
            articles = json.load(f)

        documents = [
            Document(
                page_content=f"Title: {article['title']}\nDescription: {article['description']}\nContent: {article['content']}",
                metadata={"source": article.get("source", "unknown")}
            ) for article in articles
        ]

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, separators=[
                "\n", ".", " "]
        )
        chunks = [
            Document(page_content=chunk, metadata=doc.metadata)
            for doc in documents
            for chunk in text_splitter.split_text(doc.page_content)
        ]

        vector_store = FAISS.from_documents(chunks, embeddings)
        vector_store.save_local(STORE_FOLDER)

        print("News data loaded successfully into the vector store.")
        return "News data loaded successfully."
    except Exception as e:
        print(f"Error loading news into vector store: {e}")
        return f"Error loading news into vector store: {e}"


def search_vector_store(prompt):
    try:
        vector_store = FAISS.load_local(
            STORE_FOLDER, embeddings, allow_dangerous_deserialization=True
        )

        similar_docs = vector_store.similarity_search(
            prompt, k=5)

        if not similar_docs:
            return "No relevant articles found."

        context = "\n\n".join([doc.page_content for doc in similar_docs])
        return context
    except Exception as e:
        print(f"Error searching vector store: {e}")
        return f"Error searching vector store: {e}"


def generate_response(user_input, context, model_name="gpt-3.5-turbo"):
    messages = [
        {"role": "system", "content": "You are a helpful assistant based on news articles."},
        {"role": "user", "content": f"Query: {user_input}\n\nContext:\n{context}\n"}
    ]

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
            stream=False,
        )
        message_content = response.choices[0].message.content
        print(f"Chatbot: {message_content}")
        return message_content
    except Exception as e:
        print(f"Error generating response: {e}")
        return f"Error generating response: {e}"


def interactive_chat():
    try:
        print("Welcome to the Newsify AI. Type 'exit' to quit.")
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() == 'exit':
                print("Goodbye!")
                break

            context = search_vector_store(user_input)
            if context == "No relevant articles found.":
                print("Chatbot: No relevant articles found.")
                continue

            generate_response(user_input, context)

    except Exception as e:
        print(f"Error during interactive chat: {e}")


def cleanup_vector_store():
    try:
        if os.path.exists(STORE_FOLDER):
            shutil.rmtree(STORE_FOLDER)
        print("Vector store cleaned up successfully.")
    except Exception as e:
        print(f"Error cleaning up vector store: {e}")


if __name__ == "__main__":
    load_news_into_vector_store()
    interactive_chat()
    cleanup_vector_store()
