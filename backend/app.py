import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(
    __name__,
    static_folder="static",
    static_url_path="/assets",  # <-- important
    template_folder="templates",
)
CORS(app)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=GEMINI_API_KEY,
    temperature=0.0,
)


@app.route("/api/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        preference = data.get("preference")
        products = data.get("products")

        if not preference or not products:
            return jsonify({"error": "Missing preference or products"}), 400

        product_text = "\n".join(
            [
                f"- id: {p.get('id')}, name: {p.get('name')}, "
                f"category: {p.get('category')}, price: {p.get('price')}, rating: {p.get('rating')}"
                for p in products
            ]
        )

        prompt = f"""
You are an AI product recommendation system.

User preference:
\"\"\"{preference}\"\"\" 

Here is the list of available products:
{product_text}

From ONLY the above products, choose the best matches.

Rules:
- Only choose products from the list.
- Output ONLY a JSON array of product IDs. Example:
[1, 3, 5]
Do not add any explanation text. Only output valid JSON.
"""

        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY is not set"}), 500

        response = llm.invoke(prompt)

        text = ""
        try:
            content = response.content
            if isinstance(content, str):
                text = content
            elif isinstance(content, list) and len(content) > 0:
                # e.g. [{"type": "text", "text": "..."}]
                first = content[0]
                if isinstance(first, dict) and "text" in first:
                    text = first["text"]
                else:
                    text = str(first)
            else:
                text = str(response)
        except Exception:
            text = str(response)

        # Parse JSON array of IDs
        try:
            ids = json.loads(text.strip())
        except Exception:
            print("Failed to parse Gemini/LangChain response:", text)
            ids = []

        return jsonify({"recommendedIds": ids})

    except Exception as e:
        print("Server error:", str(e))
        return jsonify({"error": "Internal server error"}), 500


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/<path:path>")
def catch_all(path):
    return render_template("index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port)
