// learning-notes — article.js
// 1. <h2>/<h3> から TOC を自動生成
// 2. highlight.js を起動
// 3. メタタグ article:tags からタグチップを描画

(function () {
  "use strict";

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

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // ---- TOC 生成 ----
  function buildToc() {
    const toc = document.getElementById("toc");
    if (!toc) return;
    const ul = toc.querySelector("ul");
    if (!ul) return;

    const headings = document.querySelectorAll(
      ".article-body h2, .article-body h3",
    );
    if (headings.length < 2) {
      toc.style.display = "none";
      return;
    }

    headings.forEach((h, i) => {
      let id = h.id;
      if (!id) {
        id = slugify(h.textContent) || `h-${i}`;
        h.id = id;
      }
      const li = document.createElement("li");
      if (h.tagName === "H3") li.className = "toc-h3";
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = h.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });

    // 現在見出しハイライト
    const links = ul.querySelectorAll("a");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = ul.querySelector(`a[href="#${entry.target.id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => l.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
  }

  // ---- タグチップ描画（記事ヒーロー）----
  function renderTags() {
    const meta = document.querySelector('meta[name="article:tags"]');
    if (!meta) return;
    const tags = meta.content
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length === 0) return;

    const heroMeta = document.querySelector(".article-meta");
    if (!heroMeta) return;
    if (heroMeta.querySelector(".tags")) return;

    const wrap = document.createElement("span");
    wrap.className = "tags";
    wrap.innerHTML =
      ` <span class="dot">·</span> ` +
      tags
        .map(
          (t) =>
            `<a href="../index.html?tag=${encodeURIComponent(t)}" class="tag">${escapeHtml(t)}</a>`,
        )
        .join(" ");
    heroMeta.appendChild(wrap);
  }

  // ---- highlight.js 起動 ----
  function highlight() {
    if (typeof window.hljs === "undefined") return;
    document
      .querySelectorAll('pre code[class*="language-"]')
      .forEach((el) => window.hljs.highlightElement(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildToc();
    renderTags();
    highlight();
  });
})();
