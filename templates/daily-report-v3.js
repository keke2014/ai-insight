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
\n</script>