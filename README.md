# learning-notes

学んだこと・気になったことをHTMLで書き残す個人ノート集。

公開URL: https://naoya5.github.io/learning-notes/

## 構成

```
.
├── index.html              トップページ（カードグリッド + 検索 + タグ）
├── 404.html
├── articles/               各記事（YYYY-MM-DD-slug.html）
├── assets/css/             base.css / index.css / article.css
├── assets/js/              search.js / article.js
├── data/articles.json      記事メタデータ（自動生成）
└── .github/workflows/deploy.yml   Pages自動デプロイ
```

## 運用

記事の追加・更新は Claude Code の `/html` スキル経由で行う。
スキル本体: `~/.claude/skills/html/`

ローカル確認:

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

デプロイ: `main` への push で GitHub Actions が自動実行。

## 規約

- 記事は単独で完結する独立HTML
- `<head>` の `<meta name="article:*">` が記事メタデータの正
- `data/articles.json` は `~/.claude/skills/html/scripts/update-index.py` が再生成
- スタイルは `assets/css/` に集約、記事内 `<style>` 禁止
