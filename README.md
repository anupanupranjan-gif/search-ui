# search-ui

A React eCommerce search frontend for the SearchX platform. Features a home page with a category department grid, a full search results page, and category browse pages — all backed by the search-api hybrid search service.

---

## Pages

**Home (`/`)** — Category grid with 10 department cards. Large search bar with quick search suggestions. Clicking a department navigates to the category page.

**Search (`/search?q=...`)** — Search results with a facet sidebar (sort options, brand filter, price range). Supports three search modes: Hybrid, Semantic, and Keyword. Paginated results with a product detail modal on click.

**Category (`/category/:label`)** — Pre-filtered product listing for a specific department. Same facet sidebar as the search page. Powered by the match-all backend query.

All pages share a persistent header with the search bar, search mode toggle (Hybrid / Semantic / Keyword), and AI Chat toggle.

---

## AI Chat Sidebar

A local Ollama-powered chat assistant embedded in the sidebar. It has context about the current search results on screen and answers questions like "which of these has the best rating?" or "find me something under $30". Runs `gemma3:1b` locally — no external API calls.

---

## Stack

- **Framework**: React 18 with React Router v6
- **Build**: Create React App
- **Fonts**: Lora (display), DM Mono (monospace)
- **Served by**: nginx (in Kubernetes)
- **AI**: Ollama (local, `gemma3:1b`)

---

## Project Structure

```
search-ui/
├── src/
│   ├── App.jsx                    # React Router setup, global state
│   ├── api.js                     # API fetch helpers, CATEGORY_MAP, sort utils
│   ├── index.js                   # React entry point
│   ├── pages/
│   │   ├── HomePage.jsx           # Category grid + hero search bar
│   │   ├── SearchPage.jsx         # Search results with facets
│   │   └── CategoryPage.jsx       # Category browse with facets
│   └── components/
│       ├── Header.jsx             # Search bar, mode toggle, AI Chat button
│       ├── FacetSidebar.jsx       # Sort + brand + price filters
│       ├── ProductComponents.jsx  # ProductCard, ProductModal, StarRating, Badge
│       ├── ResultsLayout.jsx      # Shared layout for Search and Category pages
│       └── ChatSidebar.jsx        # Ollama AI chat panel
├── public/
│   └── index.html
├── Dockerfile                     # FROM nginx:alpine, COPY build/
├── nginx.conf
└── package.json
```

---

## Local Development

```bash
npm install
npm start
```

Requires search-api running at `http://localhost:8081` (or set `REACT_APP_API_BASE`).

For AI Chat, requires Ollama running locally:
```bash
ollama serve
ollama pull gemma3:1b
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE` | `http://localhost:8081/api/v1` | search-api base URL |
| `REACT_APP_OLLAMA_BASE` | `http://localhost:11434` | Ollama base URL |

In production (Kind), `REACT_APP_API_BASE` is set to `/api/v1` so requests route through the nginx ingress.

---

## Kubernetes Deployment

Runs as a Deployment in the `default` namespace, served by nginx, accessible at `http://localhost/` via nginx ingress.

Managed by ArgoCD via Helm charts in [search-infra](https://github.com/anupanupranjan-gif/search-infra). CI/CD via GitHub Actions — every push to `main` builds the React app, packages it into a Docker image, pushes to `ghcr.io`, and updates the Helm chart image tag. ArgoCD auto-deploys.

Since the image is local to the Kind cluster (`imagePullPolicy: IfNotPresent`), new images are loaded with:
```bash
kind load docker-image search-ui:<tag> --name kind
```

---

## Category Data

Categories are mapped in `src/api.js` to match the actual Elasticsearch field values in the products index. The key mapping is:

| Display Name | ES Field Value |
|---|---|
| Home & Kitchen | `Amazon Home` |
| Electronics | `All Electronics` |
| Fashion | `AMAZON FASHION` |
| Health & Beauty | `Health & Personal Care` |

Some documents had malformed category values (`{"element": "Home & Kitchen"}`) which were cleaned via an Elasticsearch `update_by_query` script after indexing.

---

## Part of SearchX

This repo is one component of the SearchX platform:

- [search-api](https://github.com/anupanupranjan-gif/search-api) — Spring Boot hybrid search service (BM25 + vector)
- [search-catalog-indexer](https://github.com/anupanupranjan-gif/search-catalog-indexer) — Product indexing pipeline
- [prometheus-mcp](https://github.com/anupanupranjan-gif/prometheus-mcp) — Prometheus MCP server
- [observability-console](https://github.com/anupanupranjan-gif/observability-console) — AI-powered ops console
- [search-infra](https://github.com/anupanupranjan-gif/search-infra) — Kubernetes manifests, Helm charts, ArgoCD, Terraform
