/**
 * main.js - Core functionality for GetUpDeals
 * Simplified version to fix initialization errors
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('GetUpDeals - Initializing...');
    
    // Initialize with error handling
    try {
        initGetUpDeals();
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorFallback(error);
    }
});

function initGetUpDeals() {
    // Store app instance
    window.getupdeals = {
        config: {},
        modules: {},
        utils: {}
    };
    
    // Initialize modules in sequence
    initConfig();
    initUtils();
    initModules();
    initEventListeners();
    initServiceWorker();
    
    console.log('GetUpDeals - Initialized successfully');
    
    // Mark as loaded
    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('loaded');
}

function initConfig() {
    // Basic configuration
    window.getupdeals.config = {
        debug: window.location.search.includes('debug=true'),
        isMobile: window.innerWidth < 768,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isOnline: navigator.onLine,
        version: '1.0.0',
        startTime: Date.now()
    };
    
    // Add device classes
    const html = document.documentElement;
    if (window.getupdeals.config.isMobile) html.classList.add('is-mobile');
    if (window.getupdeals.config.isTouch) html.classList.add('is-touch');
    if (!window.getupdeals.config.isTouch) html.classList.add('no-touch');
    
    console.log('Configuration initialized');
}

function initUtils() {
    // Utility functions
    window.getupdeals.utils = {
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Format currency
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
            }).format(amount);
        },
        
        // Get query parameters
        getQueryParam: function(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },
        
        // Safe DOM query
        query: function(selector) {
            try {
                return document.querySelector(selector);
            } catch (error) {
                console.warn('Invalid selector:', selector);
                return null;
            }
        },
        
        // Safe DOM query all
        queryAll: function(selector) {
            try {
                return document.querySelectorAll(selector);
            } catch (error) {
                console.warn('Invalid selector:', selector);
                return [];
            }
        }
    };
    
    console.log('Utilities initialized');
}

function initModules() {
    // Initialize core modules
    initNotifications();
    initAnalytics();
    initUserPreferences();
    
    console.log('Core modules initialized');
}

function initNotifications() {
    window.getupdeals.modules.notifications = {
        show: function(message, type = 'info', duration = 5000) {
            const types = {
                'info': { icon: 'info-circle', color: 'blue' },
                'success': { icon: 'check-circle', color: 'green' },
                'warning': { icon: 'exclamation-triangle', color: 'orange' },
                'error': { icon: 'exclamation-circle', color: 'red' }
            };
            
            const config = types[type] || types.info;
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid ${config.color};
                border-radius: 4px;
                padding: 15px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                min-width: 300px;
                max-width: 400px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            
            notification.innerHTML = `
                <i class="fas fa-${config.icon}" style="color: ${config.color}; font-size: 20px;"></i>
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 4px; color: #333;">${type.toUpperCase()}</strong>
                    <span style="color: #666; font-size: 14px;">${message}</span>
                </div>
                <button class="notification-close" style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px;">×</button>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            // Setup close button
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
            
            // Auto-dismiss
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.transform = 'translateX(400px)';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 300);
                    }
                }, duration);
            }
            
            return notification;
        },
        
        showToast: function(message, options = {}) {
            const type = options.type || 'info';
            return this.show(message, type, options.duration || 3000);
        }
    };
    
    console.log('Notifications module initialized');
}

function initAnalytics() {
    window.getupdeals.modules.analytics = {
        trackEvent: function(category, action, label, value) {
            // Simple console logging for now
            if (window.getupdeals.config.debug) {
                console.log('[Analytics]', category, action, label, value);
            }
            
            // Google Analytics (if available)
            if (typeof gtag === 'function') {
                gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: value
                });
            }
            
            // Facebook Pixel (if available)
            if (typeof fbq === 'function') {
                fbq('trackCustom', action, {
                    category: category,
                    label: label,
                    value: value
                });
            }
        },
        
        trackPageView: function(page) {
            const pagePath = page || window.location.pathname;
            
            if (typeof gtag === 'function') {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    page_path: pagePath
                });
            }
            
            if (window.getupdeals.config.debug) {
                console.log('[Analytics] Page View:', pagePath);
            }
        },
        
        trackError: function(error, context) {
            this.trackEvent('Errors', 'Error Occurred', context, 1);
            
            // Log to console in debug mode
            if (window.getupdeals.config.debug) {
                console.error(`[Error] ${context}:`, error);
            }
        }
    };
    
    // Track initial page view
    window.getupdeals.modules.analytics.trackPageView();
    console.log('Analytics module initialized');
}

function initUserPreferences() {
    // Try to load from localStorage
    let preferences = {};
    try {
        const saved = localStorage.getItem('getupdeals_preferences');
        if (saved) {
            preferences = JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Could not load preferences:', error);
    }
    
    window.getupdeals.modules.user = {
        preferences: preferences,
        
        savePreference: function(key, value) {
            this.preferences[key] = value;
            try {
                localStorage.setItem('getupdeals_preferences', 
                    JSON.stringify(this.preferences));
            } catch (error) {
                console.warn('Could not save preference:', error);
            }
        },
        
        getPreference: function(key, defaultValue = null) {
            return this.preferences[key] || defaultValue;
        },
        
        clearPreferences: function() {
            this.preferences = {};
            try {
                localStorage.removeItem('getupdeals_preferences');
            } catch (error) {
                console.warn('Could not clear preferences:', error);
            }
        }
    };
    
    console.log('User preferences module initialized');
}

function initEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
        document.documentElement.classList.remove('is-offline');
        document.documentElement.classList.add('is-online');
        window.getupdeals.modules.notifications.show('You are back online', 'success');
    });
    
    window.addEventListener('offline', () => {
        document.documentElement.classList.remove('is-online');
        document.documentElement.classList.add('is-offline');
        window.getupdeals.modules.notifications.show('You are offline. Some features may not work.', 'warning');
    });
    
    // Window resize with debounce
    const handleResize = window.getupdeals.utils.debounce(() => {
        const isMobile = window.innerWidth < 768;
        window.getupdeals.config.isMobile = isMobile;
        document.documentElement.classList.toggle('is-mobile', isMobile);
        
        // Dispatch custom event
        const event = new CustomEvent('getupdeals:resize', {
            detail: { width: window.innerWidth, height: window.innerHeight }
        });
        window.dispatchEvent(event);
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // Error handling
    window.addEventListener('error', (event) => {
        window.getupdeals.modules.analytics.trackError(event.error, 'global');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        window.getupdeals.modules.analytics.trackError(event.reason, 'promise');
    });
    
    // External link tracking
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="http"]');
        if (link && !link.href.includes(window.location.hostname)) {
            event.preventDefault();
            
            // Track external link click
            window.getupdeals.modules.analytics.trackEvent(
                'External', 
                'Link Click', 
                link.href,
                1
            );
            
            // Open in new tab
            window.open(link.href, '_blank', 'noopener noreferrer');
        }
    });
    
    console.log('Event listeners initialized');
}

function initServiceWorker() {
    // Only register if supported and in production
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
        navigator.serviceWorker.register('/assets/js/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    } else {
        console.log('ServiceWorker not registered (localhost or not supported)');
    }
}

function showUpdateNotification() {
    const notification = window.getupdeals.modules.notifications.show(
        'New version available. Refresh to update.',
        'info',
        0 // Don't auto-dismiss
    );
    
    // Add refresh button
    const content = notification.querySelector('div > div');
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh';
    refreshBtn.style.cssText = `
        margin-top: 10px;
        padding: 6px 12px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    refreshBtn.addEventListener('click', () => {
        window.location.reload();
    });
    
    content.appendChild(refreshBtn);
}

function showErrorFallback(error) {
    console.error('Critical error:', error);
    
    // Remove loading class
    document.documentElement.classList.remove('loading');
    
    // Show error message in console
    const errorMsg = `
        GetUpDeals Error:
        ${error.message || 'Unknown error'}
        
        Please refresh the page or contact support if the problem persists.
    `;
    
    console.error(errorMsg);
    
    // Optional: Show error to user
    if (window.getupdeals && window.getupdeals.modules.notifications) {
        window.getupdeals.modules.notifications.show(
            'Sorry, something went wrong. Please refresh the page.',
            'error',
            10000
        );
    }
}

// Export for debugging
if (window.location.search.includes('debug=true')) {
    window.debugGetUpDeals = {
        getConfig: () => window.getupdeals.config,
        showNotification: (msg, type) => 
            window.getupdeals.modules.notifications.show(msg, type),
        clearPreferences: () => window.getupdeals.modules.user.clearPreferences(),
        reload: () => window.location.reload()
    };
    console.log('Debug mode enabled');
}