// Advanced Protection System v2.0
(function() {
    'use strict';
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        protectionLevel: 'maximum',
        enableAllProtections: true,
        debugMode: false,
        redirectOnDetect: false,
        redirectUrl: '/access-denied'
    };
    
    // ===== CORE PROTECTION =====
    
    // 1. Block Right Click (Context Menu)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        logSecurityEvent('Right click blocked');
        showSecurityAlert('Context menu is disabled');
        return false;
    }, { capture: true });
    
    // 2. Block Keyboard Shortcuts
    const blockedShortcuts = new Set([
        'F12', 'F11', 'F5',
        'Ctrl+Shift+I', 'Ctrl+Shift+J', 'Ctrl+Shift+C',
        'Ctrl+U', 'Ctrl+S', 'Ctrl+P',
        'Alt+Shift+D', 'Alt+Shift+I'
    ]);
    
    document.addEventListener('keydown', function(e) {
        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;
        
        // Check F12 and other F-keys
        if (key.startsWith('F') && !isNaN(key.slice(1))) {
            if (parseInt(key.slice(1)) >= 10) {
                e.preventDefault();
                e.stopPropagation();
                logSecurityEvent(`Function key ${key} blocked`);
                return false;
            }
        }
        
        // Check Ctrl+Shift combinations
        if (ctrl && shift) {
            const combination = `Ctrl+Shift+${key.toUpperCase()}`;
            if (blockedShortcuts.has(combination)) {
                e.preventDefault();
                e.stopPropagation();
                logSecurityEvent(`Shortcut ${combination} blocked`);
                showSecurityAlert('Developer tools are restricted');
                return false;
            }
        }
        
        // Check Ctrl combinations
        if (ctrl && !shift) {
            const combination = `Ctrl+${key.toUpperCase()}`;
            if (blockedShortcuts.has(combination)) {
                e.preventDefault();
                e.stopPropagation();
                logSecurityEvent(`Shortcut ${combination} blocked`);
                return false;
            }
        }
        
        // Check Alt+Shift combinations
        if (alt && shift) {
            const combination = `Alt+Shift+${key.toUpperCase()}`;
            if (blockedShortcuts.has(combination)) {
                e.preventDefault();
                e.stopPropagation();
                logSecurityEvent(`Shortcut ${combination} blocked`);
                return false;
            }
        }
        
        // Block Print Screen
        if (key === 'PrintScreen') {
            e.preventDefault();
            logSecurityEvent('Print screen blocked');
        }
    }, { capture: true });
    
    // 3. Prevent Text Selection on sensitive elements
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'CODE' || 
            e.target.tagName === 'PRE' || 
            e.target.closest('.code-block')) {
            e.preventDefault();
            logSecurityEvent('Text selection prevented on code element');
        }
    });
    
    // 4. Detect DevTools Open
    let devToolsOpen = false;
    const devToolsCheck = new Function('debug');
    
    function detectDevTools() {
        const startTime = performance.now();
        debug;
        const endTime = performance.now();
        
        const threshold = 100;
        const diff = endTime - startTime;
        
        if (diff > threshold) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                onDevToolsDetected();
            }
            return true;
        }
        return false;
    }
    
    // 5. Window Resize Detection (DevTools)
    let lastWidth = window.outerWidth;
    let lastHeight = window.outerHeight;
    
    setInterval(() => {
        const currentWidth = window.outerWidth;
        const currentHeight = window.outerHeight;
        
        if (Math.abs(currentWidth - lastWidth) > 100 || 
            Math.abs(currentHeight - lastHeight) > 100) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                onDevToolsDetected();
            }
        }
        
        lastWidth = currentWidth;
        lastHeight = currentHeight;
    }, 500);
    
    // 6. Console.log Protection
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };
    
    // Override console methods
    ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
        console[method] = function(...args) {
            if (CONFIG.debugMode) {
                originalConsole[method].apply(console, args);
            } else {
                // Optionally log to server or ignore
                logSecurityEvent(`Console.${method} called with:`, args);
            }
        };
    });
    
    // 7. Prevent Iframe Access
    if (window.top !== window.self) {
        // Block iframe embedding
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #0a0a0f;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: monospace;
                z-index: 9999;
            ">
                <div style="text-align: center; padding: 40px;">
                    <h1 style="color: #ef4444; margin-bottom: 20px;">Access Restricted</h1>
                    <p>This content cannot be embedded in iframes.</p>
                </div>
            </div>
        `;
        throw new Error('Iframe embedding not allowed');
    }
    
    // 8. Obfuscate Sensitive Data
    function obfuscateData(data) {
        // Simple obfuscation for demo purposes
        // In production, use stronger encryption
        return btoa(unescape(encodeURIComponent(data)))
            .split('')
            .reverse()
            .join('')
            .replace(/=/g, '');
    }
    
    // 9. Monitor DOM Changes (Anti-tamper)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'data-protected') {
                // React to protected attribute changes
                logSecurityEvent('Protected attribute modified');
            }
            
            // Check for script tag removal
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeName === 'SCRIPT' && 
                        node.hasAttribute('data-protected')) {
                        logSecurityEvent('Protected script element removed');
                        // Optionally restore the element
                        document.head.appendChild(node.cloneNode(true));
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-protected']
    });
    
    // 10. Prevent Source View
    document.addEventListener('keydown', function(e) {
        // Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            e.stopPropagation();
            logSecurityEvent('View source attempt blocked');
            showSecurityAlert('Page source is protected');
            return false;
        }
    });
    
    // ===== SECURITY EVENTS =====
    
    function logSecurityEvent(message, data) {
        if (CONFIG.debugMode) {
            originalConsole.info('[SECURITY]', message, data || '');
        }
        
        // Send to analytics (optional)
        try {
            const eventData = {
                event: 'security_alert',
                message: message,
                data: data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            // Store in localStorage for review
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(eventData);
            if (logs.length > 100) logs.shift(); // Keep only last 100 logs
            localStorage.setItem('security_logs', JSON.stringify(logs));
            
        } catch (e) {
            // Silent fail
        }
    }
    
    function showSecurityAlert(message) {
        // Create alert element
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 999999;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 400px;
        `;
        alert.textContent = `⚠️ ${message}`;
        document.body.appendChild(alert);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
    
    function onDevToolsDetected() {
        logSecurityEvent('Developer Tools detected');
        
        if (CONFIG.redirectOnDetect) {
            window.location.href = CONFIG.redirectUrl;
            return;
        }
        
        // Optionally disable functionality
        document.body.style.opacity = '0.5';
        document.body.style.pointerEvents = 'none';
        
        // Show warning
        showSecurityAlert('Developer tools detected. Some features may be disabled.');
        
        // Log the attempt
        const detectionLog = {
            type: 'devtools_detected',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        localStorage.setItem('last_detection', JSON.stringify(detectionLog));
    }
    
    // ===== INITIALIZATION =====
    
    // Add security styles
    const securityStyles = document.createElement('style');
    securityStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Disable text selection on protected elements */
        .code-block, .terminal-window, .loader-code {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        
        /* Hide scrollbars for code blocks */
        .code-content::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(securityStyles);
    
    // Mark protected elements
    document.addEventListener('DOMContentLoaded', function() {
        // Mark all code blocks as protected
        document.querySelectorAll('code, pre, .code-block').forEach(el => {
            el.setAttribute('data-protected', 'true');
        });
        
        // Mark script tags (except our own)
        document.querySelectorAll('script:not([data-protection-exempt])').forEach(el => {
            el.setAttribute('data-protected', 'true');
        });
        
        logSecurityEvent('Protection system initialized');
    });
    
    // ===== PUBLIC API =====
    window.SecuritySystem = {
        version: '2.0',
        config: CONFIG,
        getLogs: function() {
            return JSON.parse(localStorage.getItem('security_logs') || '[]');
        },
        clearLogs: function() {
            localStorage.removeItem('security_logs');
        },
        enableDebug: function() {
            CONFIG.debugMode = true;
            logSecurityEvent('Debug mode enabled');
        },
        disableDebug: function() {
            CONFIG.debugMode = false;
            logSecurityEvent('Debug mode disabled');
        }
    };
    
    // Add CSS for selection blocking
    const selectionBlockCSS = `
        ::selection {
            background: rgba(99, 102, 241, 0.2);
            color: inherit;
        }
        
        ::-moz-selection {
            background: rgba(99, 102, 241, 0.2);
            color: inherit;
        }
        
        [data-protected]::selection {
            background: transparent;
        }
        
        [data-protected]::-moz-selection {
            background: transparent;
        }
    `;
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = selectionBlockCSS;
    document.head.appendChild(styleSheet);
    
    // Final initialization log
    logSecurityEvent('Advanced Protection System loaded successfully');
    
})();