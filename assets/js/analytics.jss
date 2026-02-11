// analytics.js - Tracks user behavior and performance metrics
class AnalyticsTracker {
    constructor() {
        this.events = [];
        this.userId = this.getUserId();
        this.sessionId = this.generateSessionId();
        this.pageStartTime = Date.now();
        this.init();
    }

    init() {
        this.setupPageTracking();
        this.setupEventTracking();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
        this.setupScrollTracking();
        this.setupVisibilityTracking();
        
        // Send initial page view
        this.trackPageView();
    }

    getUserId() {
        // Generate or retrieve user ID
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupPageTracking() {
        // Track page views on navigation
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });
        
        // Intercept link clicks for SPA-like tracking
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                this.trackNavigation(link.href, () => {
                    window.location.href = link.href;
                });
            }
        });
    }

    setupEventTracking() {
        // Track all clicks on elements with data-track attribute
        document.addEventListener('click', (e) => {
            const trackElement = e.target.closest('[data-track]');
            if (trackElement) {
                this.trackElementEvent('click', trackElement);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.trackFormSubmit(e.target);
            }
        });
        
        // Track search
        const searchForms = document.querySelectorAll('.search-form, .mobile-search-form');
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const input = form.querySelector('input[type="search"]');
                if (input?.value) {
                    this.trackEvent('search', {
                        query: input.value,
                        source: form.classList.contains('mobile-search-form') ? 'mobile' : 'desktop'
                    });
                }
            });
        });
        
        // Track newsletter subscription
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                const email = newsletterForm.querySelector('input[type="email"]');
                if (email?.value) {
                    this.trackEvent('newsletter_subscribe', {
                        email: email.value
                    });
                }
            });
        }
    }

    setupPerformanceTracking() {
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.trackEvent('performance_lcp', {
                    value: lastEntry.startTime,
                    url: lastEntry.name
                });
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.trackEvent('performance_fid', {
                        value: entry.processingStart - entry.startTime,
                        name: entry.name
                    });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });
            
            // Cumulative Layout Shift
            let clsValue = 0;
            let clsEntries = [];
            
            const observer = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                }
                
                // Report when the page is hidden
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        this.trackEvent('performance_cls', {
                            value: clsValue,
                            entries: clsEntries.length
                        });
                        observer.disconnect();
                    }
                });
            });
            
            observer.observe({ type: 'layout-shift', buffered: true });
        }
        
        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.pageStartTime;
            this.trackEvent('page_load', {
                loadTime: loadTime,
                connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
            });
        });
    }

    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackEvent('error_js', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });
        
        // Track Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('error_promise', {
                reason: e.reason?.toString() || 'Unknown'
            });
        });
    }

    setupScrollTracking() {
        let lastScrollPosition = 0;
        let scrollDepth = 0;
        
        window.addEventListener('scroll', () => {
            const currentPosition = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = Math.round((currentPosition / maxScroll) * 100);
            
            // Track 25%, 50%, 75%, 100% scroll milestones
            [25, 50, 75, 100].forEach(milestone => {
                if (scrollPercentage >= milestone && scrollDepth < milestone) {
                    this.trackEvent('scroll_depth', {
                        percentage: milestone,
                        timeOnPage: Date.now() - this.pageStartTime
                    });
                    scrollDepth = milestone;
                }
            });
            
            lastScrollPosition = currentPosition;
        });
    }

    setupVisibilityTracking() {
        let pageVisible = true;
        let hiddenTime = 0;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                hiddenTime = Date.now();
                pageVisible = false;
                this.trackEvent('page_hidden');
            } else if (!pageVisible) {
                const hiddenDuration = Date.now() - hiddenTime;
                pageVisible = true;
                this.trackEvent('page_visible', {
                    hiddenDuration: hiddenDuration
                });
            }
        });
        
        // Track time on page before leaving
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.pageStartTime;
            this.trackEvent('page_exit', {
                timeOnPage: timeOnPage,
                scrollDepth: scrollDepth || 0
            });
            
            // Send all pending events
            this.flushEvents();
        });
    }

    trackPageView() {
        const pageData = {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            platform: navigator.platform
        };
        
        this.trackEvent('page_view', pageData);
    }

    trackNavigation(url, callback) {
        this.trackEvent('navigation', {
            from: window.location.pathname,
            to: new URL(url).pathname
        });
        
        // Small delay to ensure tracking is sent
        setTimeout(callback, 100);
    }

    trackElementEvent(eventType, element) {
        const eventData = {
            event: eventType,
            element: element.tagName,
            id: element.id,
            className: element.className,
            text: element.textContent?.trim().substring(0, 100),
            href: element.href,
            ...element.dataset
        };
        
        this.trackEvent('element_interaction', eventData);
    }

    trackFormSubmit(form) {
        const formData = {
            formId: form.id,
            formAction: form.action,
            formMethod: form.method,
            fields: []
        };
        
        // Collect form field data (excluding passwords)
        Array.from(form.elements).forEach(element => {
            if (element.name && element.type !== 'password') {
                formData.fields.push({
                    name: element.name,
                    type: element.type,
                    value: element.value?.substring(0, 50) // Limit value length
                });
            }
        });
        
        this.trackEvent('form_submit', formData);
    }

    trackEvent(eventName, data = {}) {
        const event = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            sessionId: this.sessionId,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };
        
        this.events.push(event);
        
        // Send to analytics endpoint
        this.sendToAnalytics(event);
        
        // Log for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics Event:', event);
        }
        
        return event;
    }

    sendToAnalytics(event) {
        // Choose your analytics service:
        
        // Option 1: Google Analytics (if gtag is loaded)
        if (window.gtag) {
            window.gtag('event', event.event, event.data);
        }
        
        // Option 2: Your own analytics endpoint
        // this.sendToEndpoint(event);
        
        // Option 3: Console (for development)
        if (window.location.hostname === 'localhost') {
            console.log('[Analytics]', event.event, event.data);
        }
    }

    sendToEndpoint(event) {
        // Example: Send to your backend
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // });
    }

    flushEvents() {
        // Send all pending events
        this.events.forEach(event => {
            this.sendToEndpoint(event);
        });
        this.events = [];
    }

    // Public methods for external use
    identify(userProperties) {
        this.trackEvent('identify', userProperties);
    }

    setUserProperties(properties) {
        localStorage.setItem('analytics_user_properties', JSON.stringify(properties));
    }

    trackRevenue(amount, currency = 'INR', product = null) {
        this.trackEvent('revenue', {
            amount: amount,
            currency: currency,
            product: product
        });
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsTracker();
    
    // Expose public methods
    window.trackEvent = (eventName, data) => {
        if (window.analytics) {
            return window.analytics.trackEvent(eventName, data);
        }
    };
});