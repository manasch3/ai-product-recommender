import { useState } from "react";
import "./App.css";
import axios from "axios";

const PRODUCTS = [
  { id: 1, name: "iPhone 14", category: "phone", price: 799, rating: 4.7 },
  { id: 2, name: "Pixel 8", category: "phone", price: 699, rating: 4.6 },
  { id: 3, name: "Samsung Galaxy A54", category: "phone", price: 449, rating: 4.4 },
  { id: 4, name: "Redmi Note 13", category: "phone", price: 299, rating: 4.3 },
  { id: 5, name: "MacBook Air M2", category: "laptop", price: 1199, rating: 4.8 },
  { id: 6, name: "Dell Inspiron 15", category: "laptop", price: 749, rating: 4.2 },
  { id: 7, name: "Sony WH-1000XM5", category: "headphone", price: 399, rating: 4.9 },
  { id: 8, name: "JBL Tune 510BT", category: "headphone", price: 49, rating: 4.1 },
];

const CATEGORIES = ["all", "phone", "laptop", "headphone"];

function App() {
  const [preference, setPreference] = useState("");
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const handleRecommend = async () => {
    if (!preference.trim()) {
      setError("Please describe what you are looking for.");
      return;
    }

    setError("");
    setLoading(true);
    setRecommendedIds([]);
    setLastQuery(preference);

    try {
      const response = await axios.post("/api/recommend", {
        preference,
        products: PRODUCTS,
      });

      const ids = response.data.recommendedIds || [];
      setRecommendedIds(ids);
    } catch (err) {
      console.error("Frontend error:", err);
      setError("Something went wrong while fetching recommendations.");
    } finally {
      // 🔴 ensures the button text always resets
      setLoading(false);
    }
  };

  const recommendedProducts = PRODUCTS.filter((p) =>
    recommendedIds.includes(p.id)
  );
  const recommendedIdSet = new Set(recommendedIds);

  const visibleProducts = PRODUCTS.filter((p) =>
    activeCategory === "all" ? true : p.category === activeCategory
  );

  return (
    <div className="page">
      {/* TOP NAVBAR */}
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <span className="logo-mark">AI</span>
            <span className="logo-text">ShopSense</span>
          </div>
          <div className="nav-search">
            <input
              type="text"
              placeholder="Search products"
              className="nav-search-input"
            />
            <button className="nav-search-btn">Search</button>
          </div>
        </div>
        <div className="navbar-right">
          <button className="nav-icon-btn">Orders</button>
          <button className="nav-icon-btn">Cart</button>
          <div className="avatar">M</div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="hero">
        <div className="hero-text">
          <h1>Discover your next favourite product.</h1>
        </div>
        <div className="hero-card">
          <div className="hero-orb" />
          <p className="hero-card-value">
            {recommendedProducts.length > 0
              ? `${recommendedProducts.length} matches`
              : "No active query"}
          </p>
          <p className="hero-card-sub">AI recommendations</p>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="content">
        {/* LEFT COLUMN – AI PANEL */}
        <section className="panel panel-ai">
          <div className="panel-header">
            <h2>Preference</h2>
          </div>

          <textarea
            className="ai-input"
            placeholder='Example: "Phone under $500 with good battery"'
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
          />

          <div className="ai-actions">
            <button
              className="primary-btn"
              onClick={handleRecommend}
              disabled={loading}
            >
              {loading ? "Getting recommendations…" : "Get AI Recommendations"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          {lastQuery && (
            <div className="last-query">
              <span className="last-query-label">Last query</span>
              <p className="last-query-text">{lastQuery}</p>
            </div>
          )}

          <div className="ai-summary">
            <div className="ai-stat">
              <span className="ai-stat-label">Total products</span>
              <span className="ai-stat-value">{PRODUCTS.length}</span>
            </div>
            <div className="ai-stat">
              <span className="ai-stat-label">Recommended</span>
              <span className="ai-stat-value">
                {recommendedProducts.length}/{PRODUCTS.length}
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN – RECOMMENDATIONS STRIP */}
        <section className="panel panel-reco">
          <div className="panel-header">
            <h2>Recommended</h2>
          </div>

          <div className="reco-strip">
            {loading && <p className="muted">Fetching recommendations…</p>}

            {!loading && recommendedProducts.length === 0 && !error && (
              <p className="muted">No results yet.</p>
            )}

            {!loading &&
              recommendedProducts.map((p) => (
                <div key={p.id} className="reco-card">
                  <div className="reco-tag">Top match</div>
                  <div className="reco-name">{p.name}</div>
                  <div className="reco-meta">
                    <span>${p.price}</span>
                    <span>⭐ {p.rating}</span>
                  </div>
                  <div className="reco-category">{p.category}</div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* CATALOG SECTION */}
      <section className="panel panel-catalog">
        <div className="catalog-header">
          <div>
            <h2>Catalog</h2>
          </div>
          <div className="category-filter">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  "category-chip" + (activeCategory === cat ? " active" : "")
                }
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "all"
                  ? "All products"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {visibleProducts.map((p) => {
            const isRecommended = recommendedIdSet.has(p.id);
            return (
              <div
                key={p.id}
                className={
                  "product-card" + (isRecommended ? " product-card-recommended" : "")
                }
              >
                {isRecommended && <span className="badge-recommended">AI pick</span>}
                <div className="product-image-skeleton" />
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="product-category">
                    {p.category.charAt(0).toUpperCase() + p.category.slice(1)}
                  </p>
                  <div className="product-meta-row">
                    <span className="product-price">${p.price}</span>
                    <span className="product-rating">⭐ {p.rating}</span>
                  </div>
                  <button type="button" className="secondary-btn">
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
