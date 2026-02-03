// Main JavaScript for Pevolution
document.addEventListener('DOMContentLoaded', function() {
    // Initialize stats
    initializeStats();
    
    // Mobile navigation
    setupMobileNav();
    
    // Update server status
    updateServerStatus();
    
    // Update stats animation
    animateStats();
    
    // Track page visit
    trackPageVisit();
});

// Initialize stats from localStorage
function initializeStats() {
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    
    // Set initial values
    const counters = {
        totalScripts: 3, // Fixed: 3 private scripts
        totalExecutions: stats.totalExecutions || 0,
        webVisitors: stats.totalVisitors || 0,
        uptime: 100 // Always 100% for now
    };
    
    // Update counters on page
    Object.keys(counters).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = counters[key];
        }
    });
}

// Mobile navigation
function setupMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Server status (always online for private hub)
function updateServerStatus() {
    const statusElement = document.getElementById('serverStatus');
    if (!statusElement) return;
    
    statusElement.textContent = '🟢 System Online';
    statusElement.style.color = '#10b981';
}

// Animate stats bars
function animateStats() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-out';
            bar.style.width = width;
        }, 300);
    });
}

// Track page visit
function trackPageVisit() {
    const stats = JSON.parse(localStorage.getItem('pevolution_stats') || '{}');
    
    // Track unique page views per session
    const sessionKey = 'pevolution_session';
    const currentSession = sessionStorage.getItem(sessionKey);
    
    if (!currentSession) {
        // New session
        sessionStorage.setItem(sessionKey, Date.now().toString());
        
        // Update visitor stats
        if (typeof updateVisitorStats === 'function') {
            updateVisitorStats();
        }
    }
    
    // Update page view count
    if (!stats.pageViews) stats.pageViews = 0;
    stats.pageViews++;
    localStorage.setItem('pevolution_stats', JSON.stringify(stats));
}

// ================================
// THEME TOGGLE (SAFE)
// ================================
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

if (toggle) {
    const savedTheme = localStorage.getItem("pevo-theme") || "dark";
    root.dataset.theme = savedTheme;

    toggle.innerHTML =
        savedTheme === "dark"
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

    toggle.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        localStorage.setItem("pevo-theme", next);

        toggle.innerHTML =
            next === "dark"
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
    });
}