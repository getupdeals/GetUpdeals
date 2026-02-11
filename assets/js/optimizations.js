/**
 * optimizations.js - FIXED & Optimized for GetUpDeals
 * Essential performance optimizations for production
 */

class PerformanceOptimizer {
    constructor() {
        // Initialize missing properties
        this.prefetchedUrls = new Set();
        this.backgroundInterval = null;
        this.metricsReported = 0;
        
        // Config - Simplified for MVP
        this.config = {
            lazyLoadImages: true,        // Essential for deal images
            deferNonCriticalCSS: true,   // Improves FCP
            prefetchLinks: false,        // Disable initially (add later)
            cacheResponses: false,       // Disable initially (complex)
            monitorPerformance: false,   // Disable initially (enable in staging)
            optimizeAnimations: true,    // Simple will-change optimizations
            debounceScroll: true,        // Improve scroll performance
            throttleResize: true,        // Improve resize performance
            debug: false                 // Disable in production
        };
        
        this.cache = new Map();
        this.observedElements = new Set();
        this.performanceMarks = new Set();
        this.resourceTimings = [];
        this.MAX_RESOURCE_TIMINGS = 100; // Prevent memory leak
        
        // Store original fetch for cleanup
        this.originalFetch = null;
        
        this.init();
    }
    
    /**
     * Initialize optimizations
     */
    init() {
        this.markPerformance('optimizations:start');
        
        // Check if low-end device
        if (this.isLowEndDevice()) {
            this.reduceOptimizationsForLowEnd();
        }
        
        // Apply optimizations
        this.applyOptimizations();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.markPerformance('optimizations:ready');
        this.measurePerformance('optimizations:init');
        
        if (this.config.debug) {
            console.log('🚀 Performance optimizations enabled');
        }
    }
    
    /**
     * Apply all configured optimizations
     */
    applyOptimizations() {
        try {
            // Image optimizations
            if (this.config.lazyLoadImages) {
                this.lazyLoadImages();
            }
            
            // CSS optimizations
            if (this.config.deferNonCriticalCSS) {
                this.deferNonCriticalCSS();
            }
            
            // Animation optimizations
            if (this.config.optimizeAnimations) {
                this.optimizeAnimations();
            }
            
            // Scroll optimizations
            if (this.config.debounceScroll) {
                this.debounceScrollEvents();
            }
            
            // Resize optimizations
            if (this.config.throttleResize) {
                this.throttleResizeEvents();
            }
            
            // Link prefetching (disabled initially)
            if (this.config.prefetchLinks) {
                this.prefetchImportantLinks();
            }
            
            // Response caching (disabled initially)
            if (this.config.cacheResponses) {
                this.setupResponseCaching();
            }
            
        } catch (error) {
            console.warn('Optimization failed:', error);
        }
    }
    
    /**
     * Check if device is low-end
     */
    isLowEndDevice() {
        // Check for mobile or low hardware
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
        const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
        
        return isMobile || lowMemory || lowCores;
    }
    
    /**
     * Reduce optimizations for low-end devices
     */
    reduceOptimizationsForLowEnd() {
        this.config.monitorPerformance = false;
        this.config.prefetchLinks = false;
        this.config.cacheResponses = false;
        
        if (this.config.debug) {
            console.log('📱 Reduced optimizations for low-end device');
        }
    }
    
    /**
     * Lazy load images and iframes
     */
    lazyLoadImages() {
        if (!('IntersectionObserver' in window)) {
            this.lazyLoadImagesFallback();
            return;
        }
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px', // Load slightly before visible
            threshold: 0.01
        });
        
        // Lazy load deal images
        document.querySelectorAll('img[data-src], .deal-image img').forEach(img => {
            if (!img.complete && !img.classList.contains('lazy-loaded')) {
                img.classList.add('lazy-loading');
                imageObserver.observe(img);
                this.observedElements.add(img);
            }
        });
    }
    
    /**
     * Fallback for browsers without IntersectionObserver
     */
    lazyLoadImagesFallback() {
        const lazyLoad = () => {
            document.querySelectorAll('img[data-src], .deal-image img').forEach(img => {
                if (this.isElementInViewport(img) && !img.classList.contains('lazy-loaded')) {
                    this.loadImage(img);
                }
            });
        };
        
        // Initial load
        lazyLoad();
        
        // Load on scroll and resize
        window.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
    }
    
    /**
     * Load an image and handle callbacks
     */
    loadImage(img) {
        return new Promise((resolve) => {
            // Set sources from data attributes
            if (img.getAttribute('data-src')) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            }
            
            if (img.getAttribute('data-srcset')) {
                img.srcset = img.getAttribute('data-srcset');
                img.removeAttribute('data-srcset');
            }
            
            // Handle load event
            if (img.complete) {
                this.onImageLoad(img);
                resolve(img);
            } else {
                img.addEventListener('load', () => {
                    this.onImageLoad(img);
                    resolve(img);
                });
                
                img.addEventListener('error', () => {
                    this.onImageError(img);
                    resolve(img);
                });
            }
        });
    }
    
    /**
     * Handle successful image load
     */
    onImageLoad(img) {
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        // Smooth fade-in
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    }
    
    /**
     * Handle image load error
     */
    onImageError(img) {
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-error');
        
        // Fallback to placeholder
        if (img.getAttribute('data-fallback')) {
            img.src = img.getAttribute('data-fallback');
        }
    }
    
    /**
     * Check if element is in viewport
     */
    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    /**
     * Defer non-critical CSS
     */
    deferNonCriticalCSS() {
        // Identify and defer non-critical stylesheets
        document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])').forEach(link => {
            // Skip if already deferred or critical
            if (link.media === 'only x' || link.getAttribute('data-critical')) {
                return;
            }
            
            // Mark as non-critical
            link.setAttribute('data-deferred', 'true');
            link.media = 'only x';
            
            // Load after page is interactive
            const loadStylesheet = () => {
                link.media = 'all';
                if (this.config.debug) {
                    console.log('📄 Loaded deferred CSS:', link.href);
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', loadStylesheet);
            } else {
                loadStylesheet();
            }
        });
    }
    
    /**
     * Optimize CSS animations
     */
    optimizeAnimations() {
        // Add will-change to frequently animated elements
        const animatedSelectors = [
            '.deal-card',
            '.category-card',
            '.btn-primary',
            '.nav-link'
        ];
        
        animatedSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.add('optimize-animations');
            });
        });
    }
    
    /**
     * Debounce scroll events
     */
    debounceScrollEvents() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Handle scroll-based cleanups
                this.onScrollCleanup();
            }, 150);
        }, { passive: true });
    }
    
    /**
     * Throttle resize events
     */
    throttleResizeEvents() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(() => {
                    resizeTimeout = null;
                    this.onResizeOptimizations();
                }, 250);
            }
        });
    }
    
    /**
     * Cleanup on scroll
     */
    onScrollCleanup() {
        // Unload images far from viewport to save memory
        const viewportHeight = window.innerHeight;
        
        this.observedElements.forEach(element => {
            if (!element.isConnected) {
                this.observedElements.delete(element);
                return;
            }
            
            const rect = element.getBoundingClientRect();
            const distanceFromViewport = Math.min(
                Math.abs(rect.top),
                Math.abs(rect.bottom - viewportHeight)
            );
            
            // If image is more than 2 viewports away, unload
            if (distanceFromViewport > viewportHeight * 2) {
                element.style.contentVisibility = 'auto';
            }
        });
    }
    
    /**
     * Handle resize optimizations
     */
    onResizeOptimizations() {
        // Adjust optimizations for new viewport size
        this.adjustForViewport();
    }
    
    /**
     * Adjust optimizations for current viewport
     */
    adjustForViewport() {
        const isMobile = window.innerWidth < 768;
        
        // Adjust lazy loading distance
        if (isMobile) {
            // Load images sooner on mobile
            this.updateLazyLoadMargin('150px 0px');
        } else {
            this.updateLazyLoadMargin('100px 0px');
        }
    }
    
    /**
     * Update lazy loading margin
     */
    updateLazyLoadMargin(margin) {
        // Note: In production, you'd recreate observers with new margin
        // For now, just update config
        if (this.config.debug) {
            console.log('📱 Updated lazy load margin:', margin);
        }
    }
    
    /**
     * Prefetch important links (disabled by default)
     */
    prefetchImportantLinks() {
        // Only enable this after initial launch
        const importantLinks = [
            '/blog/',
            '/deals/',
            '/categories/'
        ];
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                importantLinks.forEach(link => {
                    this.prefetchLink(link);
                });
            });
        }
    }
    
    /**
     * Prefetch a single link
     */
    prefetchLink(url) {
        if (this.prefetchedUrls.has(url)) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
        
        this.prefetchedUrls.add(url);
        
        if (this.config.debug) {
            console.log('📥 Prefetched:', url);
        }
    }
    
    /**
     * Setup response caching (disabled by default)
     */
    setupResponseCaching() {
        this.originalFetch = window.fetch;
        
        window.fetch = async function(resource, options = {}) {
            const url = typeof resource === 'string' ? resource : resource.url;
            
            // Skip non-GET requests
            if (options.method && options.method !== 'GET') {
                return this.originalFetch(resource, options);
            }
            
            // Simple caching for JSON responses
            const cacheKey = `${url}-${JSON.stringify(options)}`;
            
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5 minutes
                    return new Response(new Blob([JSON.stringify(cached.data)]), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            
            const response = await this.originalFetch(resource, options);
            
            // Cache successful JSON responses
            if (response.ok && url.includes('.json')) {
                const clone = response.clone();
                try {
                    const data = await clone.json();
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    // Not JSON, skip caching
                }
            }
            
            return response;
        }.bind(this);
    }
    
    /**
     * Setup event listeners for dynamic optimizations
     */
    setupEventListeners() {
        // Preload on hover for better UX
        document.addEventListener('mouseover', (e) => {
            this.onElementHover(e.target);
        }, { passive: true });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
        
        // Optimize on user interaction
        document.addEventListener('click', (e) => {
            this.onUserInteraction(e);
        }, { passive: true });
    }
    
    /**
     * Handle element hover for optimizations
     */
    onElementHover(element) {
        // Preload images in hovered deal cards
        if (element.closest('.deal-card, .category-card')) {
            const images = element.querySelectorAll('img[data-src]');
            if (images.length > 0) {
                images.forEach(img => {
                    if (!img.classList.contains('lazy-loaded')) {
                        this.loadImage(img);
                    }
                });
            }
        }
    }
    
    /**
     * Handle user interaction
     */
    onUserInteraction(event) {
        // Prepare buttons for animation
        const button = event.target.closest('.btn, .deal-btn');
        if (button) {
            button.classList.add('interacting');
            setTimeout(() => {
                button.classList.remove('interacting');
            }, 300);
        }
    }
    
    /**
     * Handle page hidden state
     */
    onPageHidden() {
        // Reduce activity when page is hidden
        document.documentElement.classList.add('page-hidden');
        
        // Clear background tasks
        if (this.backgroundInterval) {
            clearInterval(this.backgroundInterval);
            this.backgroundInterval = null;
        }
    }
    
    /**
     * Handle page visible state
     */
    onPageVisible() {
        // Restore normal activity
        document.documentElement.classList.remove('page-hidden');
    }
    
    /**
     * Mark performance timing
     */
    markPerformance(name) {
        if ('performance' in window && performance.mark) {
            performance.mark(name);
            this.performanceMarks.add(name);
        }
    }
    
    /**
     * Measure performance between marks
     */
    measurePerformance(name, startMark, endMark) {
        if ('performance' in window && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
            } catch (error) {
                // Silent fail
            }
        }
    }
    
    /**
     * Get optimization statistics
     */
    getStats() {
        return {
            lazyLoaded: document.querySelectorAll('.lazy-loaded').length,
            lazyLoading: document.querySelectorAll('.lazy-loading').length,
            observedElements: this.observedElements.size,
            cacheSize: this.cache.size,
            prefetchedUrls: this.prefetchedUrls.size
        };
    }
    
    /**
     * Cleanup all optimizations
     */
    cleanup() {
        // Restore original fetch if overridden
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
        }
        
        // Clear intervals
        if (this.backgroundInterval) {
            clearInterval(this.backgroundInterval);
            this.backgroundInterval = null;
        }
        
        // Clear observers
        this.observedElements.clear();
        
        // Clear cache
        this.cache.clear();
        
        if (this.config.debug) {
            console.log('🧹 Performance optimizer cleaned up');
        }
    }
    
    /**
     * Enable debug mode
     */
    enableDebug() {
        this.config.debug = true;
        console.log('🔧 Performance optimizer debug mode enabled');
    }
}

// Initialize optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already initialized
    if (!window.performanceOptimizer) {
        window.performanceOptimizer = new PerformanceOptimizer();
        
        // Expose for debugging via URL parameter
        if (window.location.search.includes('debug=perf')) {
            window.performanceOptimizer.enableDebug();
            
            // Expose debug methods
            window.debugPerf = {
                getStats: () => window.performanceOptimizer.getStats(),
                cleanup: () => window.performanceOptimizer.cleanup()
            };
        }
    }
});

// Add CSS for optimizations
const optimizationStyles = `
/* Lazy loading styles */
.lazy-loading {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

.lazy-loaded {
    opacity: 1;
    transition: opacity 0.3s ease;
}

/* Animation optimization */
.optimize-animations {
    will-change: transform, opacity;
}

/* Page hidden state */
.page-hidden .deal-card,
.page-hidden .category-card {
    animation-play-state: paused;
}

/* Loading animation */
@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;

// Inject styles
const style = document.createElement('style');
style.textContent = optimizationStyles;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}