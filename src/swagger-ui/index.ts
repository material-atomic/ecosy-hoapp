import { SwaggerRegistry } from "../swagger";
import { Router } from "../router";
import { Descriptor } from "../descriptor";
import type { Context } from "hono";
import type { SwaggerConfig } from "../swagger";

export interface SwaggerOptions extends SwaggerConfig {
  base: string; // Tên miền gốc để mount (vd: '/docs')
}

// Bóc tách Style, Script và HTML ra làm 3 file riêng biệt
const CSS_CONTENT = `
:root {
  --bg-base: #09090b; --bg-surface: #18181b; --bg-surface-hover: #27272a;
  --border: #3f3f46; --text-main: #f4f4f5; --text-muted: #a1a1aa;
  --cl-get: #10b981; --cl-post: #3b82f6; --cl-put: #f59e0b; --cl-delete: #ef4444; 
  --cl-bg-get: rgba(16,185,129,0.1); --cl-bg-post: rgba(59,130,246,0.1);
  --cl-bg-delete: rgba(239,68,68,0.1);
  --primary: #8b5cf6;
}
* { box-sizing: border-box; }
body { 
  margin: 0; padding: 0; font-family: 'Inter', sans-serif;
  background: var(--bg-base); color: var(--text-main);
  display: flex; height: 100vh; overflow: hidden;
}
.sidebar {
  width: 320px; background: var(--bg-surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.sidebar-header { padding: 24px 20px; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid var(--border); }
.nav-list { list-style: none; padding: 12px; margin: 0; overflow-y: auto; }
.nav-item { 
  padding: 10px 12px; margin-bottom: 4px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; gap: 10px; font-size: 0.9rem;
  transition: all 0.2s;
}
.nav-item:hover, .nav-item.active { background: var(--bg-surface-hover); }
.badge { 
  font-size: 0.65rem; font-weight: 600; padding: 3px 6px; border-radius: 4px; 
  font-family: 'JetBrains Mono', monospace; min-width: 45px; text-align: center;
}
.badge.get { color: var(--cl-get); background: var(--cl-bg-get); }
.badge.post { color: var(--cl-post); background: var(--cl-bg-post); }
.badge.delete { color: var(--cl-delete); background: var(--cl-bg-delete); }
.nav-path { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; overflow: hidden; text-overflow: ellipsis; }
.nav-item.active .nav-path { color: var(--text-main); }
.main-header { padding: 40px; border-bottom: 1px solid var(--border); }
.main-content { padding: 40px; display: flex; gap: 40px; }
.details-pane { flex: 1; }
.test-pane { width: 400px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; height: fit-content; }
h1 { margin: 0 0 10px 0; font-size: 2rem; font-weight: 500; }
.endpoint-summary { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.endpoint-url { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-muted); }
.description { color: var(--text-muted); line-height: 1.6; }
.pane-title { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin: 0 0 16px 0; font-weight: 600; }
.btn-primary { 
  width: 100%; padding: 12px; background: var(--primary); color: white;
  border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 500; 
  cursor: pointer; transition: opacity 0.2s;
}
.btn-primary:active { opacity: 0.8; }
.response-area { margin-top: 24px; display: none; }
.response-area pre {
  background: #000; padding: 16px; border-radius: 6px; border: 1px solid var(--border);
  overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #e4e4e7;
}
.status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; margin-bottom: 10px; }
.status-ok { background: var(--cl-bg-get); color: var(--cl-get); }
.status-err { background: var(--cl-bg-delete); color: var(--cl-delete); }
`;

const JS_CONTENT = `
let specs = null;
let currentEndpoint = null;

const ui = {
  navList: document.getElementById('nav-list'),
  main: document.getElementById('main'),
  mainBadge: document.getElementById('main-badge'),
  mainUrl: document.getElementById('main-url'),
  mainTitle: document.getElementById('main-title'),
  mainDesc: document.getElementById('main-desc'),
  btnSend: document.getElementById('btn-send'),
  resArea: document.getElementById('res-area'),
  resStatusBadge: document.getElementById('res-status-badge'),
  resBody: document.getElementById('res-body')
};

async function init() {
  try {
    const res = await fetch(window.API_JSON_URL);
    specs = await res.json();
    renderNav();
  } catch (err) {
    ui.navList.innerHTML = '<div style="padding:20px;color:red">Failed to load API specs</div>';
  }
}

function renderNav() {
  ui.navList.innerHTML = '';
  if (!specs || !specs.paths) return;
  
  let isFirst = true;
  Object.entries(specs.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, meta]) => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = \`<span class="badge \${method.toLowerCase()}">\${method.toUpperCase()}</span><span class="nav-path">\${path}</span>\`;
      
      li.onclick = () => {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        openEndpoint(method, path, meta);
      };
      
      ui.navList.appendChild(li);
      if (isFirst) { li.click(); isFirst = false; }
    });
  });
}

function openEndpoint(method, path, meta) {
  currentEndpoint = { method: method.toUpperCase(), path };
  ui.main.style.display = 'flex';
  ui.resArea.style.display = 'none';
  ui.btnSend.textContent = 'Send Request';
  
  ui.mainBadge.className = 'badge ' + method.toLowerCase();
  ui.mainBadge.textContent = currentEndpoint.method;
  ui.mainUrl.textContent = path;
  ui.mainTitle.textContent = meta.summary || 'API Endpoint';
  ui.mainDesc.textContent = meta.description || 'No description available.';
}

ui.btnSend.onclick = async () => {
  if (!currentEndpoint) return;
  ui.btnSend.textContent = 'Sending...';
  ui.resArea.style.display = 'none';
  
  const startTime = Date.now();
  try {
    const res = await fetch(currentEndpoint.path, { method: currentEndpoint.method });
    const delay = Date.now() - startTime;
    
    const isOk = res.ok;
    ui.resStatusBadge.className = 'status-badge ' + (isOk ? 'status-ok' : 'status-err');
    ui.resStatusBadge.textContent = \`\${res.status} \${res.statusText} (\${delay}ms)\`;
    
    const json = await res.json().catch(() => ('No JSON body returned.'));
    ui.resBody.textContent = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    
  } catch (err) {
    ui.resStatusBadge.className = 'status-badge status-err';
    ui.resStatusBadge.textContent = 'Network Error';
    ui.resBody.textContent = err.message;
  }
  
  ui.resArea.style.display = 'block';
  ui.btnSend.textContent = 'Send Request';
};

init();
`;

export class Swagger {
  private registry: SwaggerRegistry;
  private options: SwaggerOptions;

  constructor(options: SwaggerOptions) {
    this.options = options;
    this.registry = new SwaggerRegistry(options);
    
    // Auto-inject this instance into the Global Router DIP
    Router.registry(this.registry);
  }

  getRouter() {
    const uiRouter = new Router(this.options.base);
    
    // 1. Phục vụ CSS
    uiRouter.get(
      Descriptor({ url: '/style.css', summary: 'Swagger CSS', tags: ['Swagger UI'], type: 'text' })
        .use((c: Context) => {
          c.header('Content-Type', 'text/css');
          return CSS_CONTENT;
        })
    );

    // 2. Phục vụ JS
    uiRouter.get(
      Descriptor({ url: '/script.js', summary: 'Swagger JS', tags: ['Swagger UI'], type: 'text' })
        .use((c: Context) => {
          c.header('Content-Type', 'text/javascript');
          return JS_CONTENT;
        })
    );

    // 3. Phục vụ JSON cấu hình OpenAPI
    uiRouter.get(
      Descriptor({ url: '/json', summary: 'Swagger JSON Specs', tags: ['Swagger Specs'] })
        .use((c: Context) => {
          return c.json(this.registry.getOpenApiJson());
        })
    );

    // 4. Phục vụ trang HTML chính
    uiRouter.get(
      Descriptor({ url: '/', summary: 'Swagger Explorer', tags: ['Swagger UI'], type: 'html' })
        .use(() => {
          return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${this.options.info.title || "Ecosy API Explorer"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${this.options.base}/style.css" />
</head>
<body>
  <div class="sidebar" id="sidebar">
    <div class="sidebar-header">${this.options.info.title || "API Explorer"}</div>
    <ul class="nav-list" id="nav-list">
      <div style="padding: 20px; color: var(--text-muted); font-size: 0.85rem">Loading specifications...</div>
    </ul>
  </div>
  
  <div class="main" id="main" style="display:none">
    <div class="main-header">
      <div class="endpoint-summary">
        <span class="badge" id="main-badge">GET</span>
        <span class="endpoint-url" id="main-url">/path</span>
      </div>
      <h1 id="main-title">Endpoint Title</h1>
      <div class="description" id="main-desc">Description goes here</div>
    </div>
    
    <div class="main-content">
      <div class="details-pane">
        <h3 class="pane-title">Parameters & Body</h3>
        <p style="color:var(--text-muted); font-size:0.9rem">No parameters required for this version.</p>
      </div>
      
      <div class="test-pane">
        <h3 class="pane-title">Try it out</h3>
        <button class="btn-primary" id="btn-send">Send Request</button>
        <div class="response-area" id="res-area">
          <div class="status-badge" id="res-status-badge">200 OK</div>
          <pre id="res-body">{ "success": true }</pre>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Khai báo url JSON cho script.js dùng
    window.API_JSON_URL = "${this.options.base}/json";
  </script>
  <script type="module" src="${this.options.base}/script.js"></script>
</body>
</html>`;
        })
    );

    return uiRouter;
  }
}
