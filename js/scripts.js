// Scripts page functionality for Pevolution
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scripts
    initializeScripts();
    
    // Setup search and filter
    setupSearchFilter();
    
    // Setup script modal
    setupScriptModal();
    
    // Update script count
    updateScriptCount();
});

// Script data - Pevolution Private Collection
const scriptsData = [
    {
        id: 'animtroll',
        title: 'FE Animation Troll',
        game: 'Multiple Games',
        description: 'For trolling',
        uses: 0,
        version: 'v1.0.0',
        status: 'active',
        type: 'private',
        icon: 'FE',
        features: ['Aimbot', 'ESP', 'Speed', 'Hitbox']
    },
    {
        id: 'webhook1',
        title: 'Balls',
        game: 'Multiple Games',
        description: 'Suspicious script for trolling.',
        uses: 0,
        version: 'v1.0.0',
        status: 'active',
        type: 'private',
        icon: 'JO',
        features: ['FE', 'Trolling']
    },
    {
        id: 'animation',
        title: 'Jerk Off',
        game: 'Multiple Games',
        description: 'Suspicious script for trolling.',
        uses: 0,
        version: 'v1.0.0',
        status: 'active',
        type: 'private',
        icon: 'JO',
        features: ['FE', 'Trolling']
    },
    {
        id: 'centaura',
        title: 'Aimbot | ESP | Others',
        game: 'Centaura',
        description: 'Collection of utility scripts for various purposes',
        uses: 0,
        version: 'v2.1.0',
        status: 'non-active',
        type: 'private',
        icon: 'img/centaura.png',
        features: ['Aimbot', 'ESP', 'Speed', 'Hitbox']
    },
];

// Initialize scripts grid
function initializeScripts() {
    const scriptsGrid = document.getElementById('scriptsGrid');
    const loadingState = document.getElementById('loadingState');
    
    if (!scriptsGrid) return;
    
    // Load saved stats
    const savedStats = JSON.parse(localStorage.getItem('pevolution_script_stats') || '{}');
    scriptsData.forEach(script => {
        if (savedStats[script.id]) {
            script.uses = savedStats[script.id].uses || 0;
        }
    });
    
    // Simulate loading
    setTimeout(() => {
        renderScripts(scriptsData);
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }, 800);
}

// Render scripts to grid
function renderScripts(scripts) {
    const scriptsGrid = document.getElementById('scriptsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!scriptsGrid) return;
    
    scriptsGrid.innerHTML = '';
    
    if (scripts.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    scripts.forEach(script => {
        const card = createScriptCard(script);
        scriptsGrid.appendChild(card);
    });
}

// Create script card element
function createScriptCard(script) {
    const card = document.createElement('div');
    card.className = 'script-card';
    card.dataset.id = script.id;
    card.dataset.type = script.type;
    
    card.innerHTML = `
        <div class="script-header">
            <div class="script-icon">
    ${
        typeof script.icon === "string" &&
        (script.icon.endsWith(".png") ||
         script.icon.endsWith(".jpg") ||
         script.icon.endsWith(".jpeg") ||
         script.icon.endsWith(".webp") ||
         script.icon.endsWith(".svg"))
        ? `<img src="${script.icon}" alt="${script.title} icon">`
        : script.icon
    }
</div>

            <span class="script-badge private">PRIVATE</span>
        </div>
        <h3 class="script-title">${script.title}</h3>
        <div class="script-game">${script.game}</div>
        <p class="script-description">${script.description}</p>
        
        <div class="script-meta">
            <span class="meta-badge version">${script.version}</span>
            <span class="meta-badge">${script.status}</span>
        </div>
        
        <div class="script-stats">
            <div class="stat-item">
                <span class="stat-value">${script.uses}</span>
                <span class="stat-label">Uses</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${script.features ? script.features.length : 0}</span>
                <span class="stat-label">Features</span>
            </div>
        </div>
        
        <div class="script-actions">
            <button class="btn-primary copy-loader" data-id="${script.id}">
                Copy Loader
            </button>
        </div>
    `;
    
    // Add click event for copy button
    const copyBtn = card.querySelector('.copy-loader');
    if (copyBtn) {
        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showScriptModal(script);
        });
    }
    
    return card;
}

// Setup search and filter
function setupSearchFilter() {
    const searchInput = document.getElementById('scriptSearch');
    const filterSelect = document.getElementById('scriptFilter');
    const sortSelect = document.getElementById('scriptSort');
    
    const filterScripts = debounce(() => {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filterType = filterSelect ? filterSelect.value : 'all';
        const sortType = sortSelect ? sortSelect.value : 'popular';
        
        let filtered = scriptsData.filter(script => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                script.title.toLowerCase().includes(searchTerm) ||
                script.game.toLowerCase().includes(searchTerm) ||
                script.description.toLowerCase().includes(searchTerm);
            
            // Type filter (all scripts are private, but keep for future)
            const matchesType = filterType === 'all' || script.type === filterType;
            
            return matchesSearch && matchesType;
        });
        
        // Sort
        filtered.sort((a, b) => {
            switch (sortType) {
                case 'newest':
                    return b.version.localeCompare(a.version);
                case 'updated':
                    return b.uses - a.uses;
                case 'popular':
                default:
                    return b.uses - a.uses;
            }
        });
        
        renderScripts(filtered);
    }, 300);
    
    if (searchInput) searchInput.addEventListener('input', filterScripts);
    if (filterSelect) filterSelect.addEventListener('change', filterScripts);
    if (sortSelect) sortSelect.addEventListener('change', filterScripts);
}

// Setup script modal
function setupScriptModal() {
    const modal = document.getElementById('loaderModal');
    const closeBtn = document.getElementById('closeLoaderModal');
    const copyBtn = document.getElementById('copyLoaderBtn');
    
    if (!modal) return;
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Copy loader
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const codeElement = document.getElementById('loaderCode');
            if (!codeElement) return;
            
            const text = codeElement.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#10b981';
                
                // Track execution
                const scriptId = copyBtn.dataset.scriptId;
                if (scriptId) {
                    incrementScriptUses(scriptId);
                    if (typeof trackScriptExecution === 'function') {
                        trackScriptExecution(scriptId);
                    }
                }
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            });
        });
    }
}

// Show script modal
function showScriptModal(script) {
    const modal = document.getElementById('loaderModal');
    const modalTitle = document.getElementById('modalScriptTitle');
    const modalGame = document.getElementById('modalScriptGame');
    const modalVersion = document.getElementById('modalScriptVersion');
    const modalIcon = document.getElementById('modalScriptIcon');
    const loaderCode = document.getElementById('loaderCode');
    const copyBtn = document.getElementById('copyLoaderBtn');
    
    if (!modal) return;
    
    // Update modal content
    if (modalTitle) modalTitle.textContent = script.title;
    if (modalGame) modalGame.textContent = script.game;
    if (modalVersion) modalVersion.textContent = script.version;

    if (modalIcon) {
        modalIcon.innerHTML =
            typeof script.icon === "string" &&
            (script.icon.endsWith(".png") ||
             script.icon.endsWith(".jpg") ||
             script.icon.endsWith(".jpeg") ||
             script.icon.endsWith(".webp") ||
             script.icon.endsWith(".svg"))
            ? `<img src="${script.icon}" alt="${script.title} icon">`
            : script.icon;
    }

    if (copyBtn) copyBtn.dataset.scriptId = script.id;
    
    // Generate loader code
    if (loaderCode) {
        const loader = `loadstring(game:HttpGet("https://pevolution.vercel.app/api/script/${script.id}", true))()`;
        loaderCode.textContent = loader;
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Increment script uses
function incrementScriptUses(scriptId) {
    const script = scriptsData.find(s => s.id === scriptId);
    if (script) {
        script.uses++;
        
        // Save to localStorage
        const savedStats = JSON.parse(localStorage.getItem('pevolution_script_stats') || '{}');
        savedStats[scriptId] = savedStats[scriptId] || { uses: 0 };
        savedStats[scriptId].uses++;
        localStorage.setItem('pevolution_script_stats', JSON.stringify(savedStats));
        
        // Update UI
        updateScriptCount();
        renderScripts(scriptsData);
    }
}

// Update script count in footer
function updateScriptCount() {
    const scriptCount = document.getElementById('scriptCount');
    if (!scriptCount) return;
    
    const totalUses = scriptsData.reduce((sum, script) => sum + script.uses, 0);
    const scriptCountText = `${scriptsData.length} private scripts • ${totalUses} total executions`;
    
    scriptCount.textContent = scriptCountText;
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

