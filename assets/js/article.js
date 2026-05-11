// learning-notes — article.js
// 1. <h2>/<h3> から TOC を自動生成 + 見出し anchor link 付与
// 2. highlight.js を起動
// 3. メタタグ article:tags からタグチップを描画
// 4. .code-wrap の copy ボタン
// 5. dialog.lightbox で figure.zoomable をクリック拡大
// 6. .theme-toggle で OS追従 + localStorage 永続なダークモード

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
      // 見出しに anchor link を埋め込む（CSS .anchor-h で hover 表示）
      if (!h.classList.contains("anchor-h") && !h.querySelector(".anchor")) {
        h.classList.add("anchor-h");
        const anchor = document.createElement("a");
        anchor.className = "anchor";
        anchor.href = `#${id}`;
        anchor.setAttribute("aria-label", "セクションへのリンク");
        anchor.textContent = "#";
        h.insertBefore(anchor, h.firstChild);
      }
      const li = document.createElement("li");
      if (h.tagName === "H3") li.className = "toc-h3";
      const a = document.createElement("a");
      a.href = `#${id}`;
      // anchor span を除いたテキストのみ
      a.textContent = h.textContent.replace(/^#\s*/, "");
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

  // ---- copy ボタン（.code-wrap > .copy-btn）----
  function bindCopyButtons() {
    document.querySelectorAll(".code-wrap").forEach((wrap) => {
      if (wrap.querySelector(".copy-btn")) return;
      const code = wrap.querySelector("code");
      if (!code) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "copy";
      btn.setAttribute("aria-label", "コードをコピー");
      wrap.appendChild(btn);
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = "✓ copied";
          btn.dataset.state = "ok";
          setTimeout(() => {
            btn.textContent = "copy";
            delete btn.dataset.state;
          }, 1400);
        } catch (e) {
          btn.textContent = "✗ failed";
          setTimeout(() => (btn.textContent = "copy"), 1400);
        }
      });
    });
  }

  // ---- ダークモードトグル（OS追従 + localStorage 永続）----
  function bindThemeToggle() {
    const tog = document.querySelector(".theme-toggle");
    if (!tog) return;
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.style.colorScheme = saved;
    }
    tog.addEventListener("click", () => {
      const cur =
        getComputedStyle(document.documentElement).colorScheme || "light";
      const next = cur.includes("dark") ? "light" : "dark";
      document.documentElement.style.colorScheme = next;
      localStorage.setItem("theme", next);
    });
  }

  // ---- Lightbox（figure.zoomable をクリックで dialog.lightbox に表示）----
  function bindLightbox() {
    const dlg = document.querySelector("dialog.lightbox");
    if (!dlg) return;
    const lbBody = dlg.querySelector(".lb-body");
    if (!lbBody) return;
    document.querySelectorAll("figure.zoomable").forEach((fig) => {
      fig.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        lbBody.innerHTML = fig.innerHTML;
        dlg.showModal();
      });
    });
    const closeBtn = dlg.querySelector("button.close");
    if (closeBtn) closeBtn.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildToc();
    renderTags();
    highlight();
    bindCopyButtons();
    bindThemeToggle();
    bindLightbox();
  });
})();
