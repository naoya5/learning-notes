// learning-notes — search.js
// data/articles.json を読み込んでカードを描画、検索＆タグフィルタを実装

(function () {
  "use strict";

  const cardsEl = document.getElementById("cards");
  const emptyEl = document.getElementById("empty");
  const searchEl = document.getElementById("search");
  const tagFilterEl = document.getElementById("tag-filter");

  let articles = [];
  let activeTag = null;
  let query = "";

  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function articleHref(a) {
    return `articles/${a.date}-${a.slug}.html`;
  }

  function render() {
    const q = query.trim().toLowerCase();
    const list = articles.filter((a) => {
      if (activeTag && !a.tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = [a.title, a.summary, a.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    if (list.length === 0) {
      cardsEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    cardsEl.innerHTML = list
      .map(
        (a) => `
      <a class="card" href="${escapeHtml(articleHref(a))}">
        <p class="card-meta">${escapeHtml(a.date)}</p>
        <h2>${escapeHtml(a.title)}</h2>
        <p>${escapeHtml(a.summary || "")}</p>
        <div class="card-tags">
          ${a.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </a>
    `,
      )
      .join("");
  }

  function renderTagFilter() {
    const counts = new Map();
    articles.forEach((a) => {
      a.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    tagFilterEl.innerHTML =
      `<button data-tag="" aria-pressed="${activeTag === null}">All</button>` +
      sorted
        .map(
          ([t, n]) =>
            `<button data-tag="${escapeHtml(t)}" aria-pressed="${activeTag === t}">${escapeHtml(t)} <small>(${n})</small></button>`,
        )
        .join("");
  }

  function bindEvents() {
    searchEl.addEventListener("input", (e) => {
      query = e.target.value;
      render();
    });

    tagFilterEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tag]");
      if (!btn) return;
      const t = btn.getAttribute("data-tag") || "";
      activeTag = t === "" ? null : t === activeTag ? null : t;
      renderTagFilter();
      render();
    });
  }

  // クエリパラメータ ?tag=foo を反映（記事ページから戻ってきた時用）
  function applyInitialFilter() {
    const params = new URLSearchParams(location.search);
    const t = params.get("tag");
    if (t) activeTag = t;
  }

  fetch("data/articles.json", { cache: "no-cache" })
    .then((r) => r.json())
    .then((data) => {
      articles = (data || []).sort((a, b) => (a.date < b.date ? 1 : -1));
      applyInitialFilter();
      renderTagFilter();
      render();
      bindEvents();
    })
    .catch((err) => {
      cardsEl.innerHTML = "";
      emptyEl.hidden = false;
      emptyEl.textContent = `読み込みエラー: ${err.message}`;
    });
})();
