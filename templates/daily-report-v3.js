<script>
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.setAttribute('aria-selected', 'true');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });
    
// Theme Switcher Logic
function getSavedTheme() { return localStorage.getItem('theme') || 'system'; }
function applyTheme(theme) {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    document.querySelectorAll('.theme-switcher-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.getElementById('theme-btn-' + theme);
    if(activeBtn) activeBtn.classList.add('active');
}
window.setTheme = function(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
};
// Init UI
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTheme(getSavedTheme()));
} else {
    applyTheme(getSavedTheme());
}
// Listeners
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if(getSavedTheme() === 'system') applyTheme('system');
});
\n
// Search Feature Logic
let searchIndex = [];
let isSearchLoaded = false;

window.loadSearchIndex = async function() {
    if (isSearchLoaded) return;
    try {
        let p = "search_index.json";
        if (window.location.pathname.includes("/01-daily-reports/")) {
            p = "../../search_index.json";
        }
        const res = await fetch(p);
        searchIndex = await res.json();
        isSearchLoaded = true;
    } catch (e) {
        console.error("Failed to load search index", e);
    }
};

window.renderSearchResults = function(query) {
    const modal = document.getElementById("search-modal");
    if (!query.trim()) {
        modal.classList.remove("active");
        return;
    }
    
    query = query.toLowerCase();
    const results = searchIndex.filter(item => 
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.content && item.content.toLowerCase().includes(query))
    ).slice(0, 15);
    
    if (results.length === 0) {
        modal.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-muted)">无匹配结果</div>';
    } else {
        const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
        const highlight = (text) => text.replace(regex, '<span class="search-result-highlight">$1</span>');
        
        const prefix = window.location.pathname.includes("/01-daily-reports/") ? "../../" : "";
        
        let html = "";
        results.forEach(r => {
            const titleSnippet = highlight(r.title || "无标题");
            let contentSnippet = r.content || "";
            const matchIndex = contentSnippet.toLowerCase().indexOf(query);
            if(matchIndex > -1) {
                let start = Math.max(0, matchIndex - 30);
                contentSnippet = (start > 0 ? "..." : "") + contentSnippet.substring(start, start + 80) + "...";
            } else {
                contentSnippet = contentSnippet.substring(0, 80) + "...";
            }
            contentSnippet = highlight(contentSnippet);
            
            html += `<div class="search-result-item" onclick="window.location.href='${prefix}${r.url}'">
                <div class="search-result-title">${titleSnippet}</div>
                <div class="search-result-meta"><span class="badge ${r.type === '摘要' ? 'blue' : (r.type === '深度' ? 'purple' : 'green')}" style="padding:2px 6px; border-radius:4px; font-size:11px;">${r.type}</span> ${r.date}</div>
                <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.4;">${contentSnippet}</div>
            </div>`;
        });
        modal.innerHTML = html;
    }
    modal.classList.add("active");
};

// Init Search Events
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("search-modal")) {
        const modal = document.createElement("div");
        modal.id = "search-modal";
        document.body.appendChild(modal);
        
        document.addEventListener("click", (e) => {
            if (!modal.contains(e.target) && e.target.id !== "search-input") {
                modal.classList.remove("active");
            }
        });
    }

    const searchInputBox = document.getElementById("search-input");
    if (searchInputBox) {
        searchInputBox.addEventListener("focus", window.loadSearchIndex);
        
        let debounceTimer;
        searchInputBox.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(isSearchLoaded) window.renderSearchResults(e.target.value);
            }, 300);
        });
    }
});
\n</script>