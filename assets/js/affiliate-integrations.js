// affiliate-integrations.js - Handles affiliate tracking and conversions
class AffiliateIntegration {
    constructor() {
        this.affiliateId = 'GETUPDEALS2024'; // Your affiliate ID
        this.clickTimeout = 24 * 60 * 60 * 1000; // 24 hours for click tracking
        this.init();
    }

    init() {
        this.setupClickTracking();
        this.injectAffiliateLinks();
        this.setupConversionTracking();
        this.setupLinkRewriter();
    }

    setupClickTracking() {
        // Track all outbound affiliate clicks
        document.addEventListener('click', (e) => {
            const affiliateLink = e.target.closest('[data-affiliate]');
            if (affiliateLink) {
                this.trackAffiliateClick(affiliateLink);
            }
        });
    }

    trackAffiliateClick(link) {
        const dealId = link.dataset.dealId;
        const store = link.dataset.store || 'unknown';
        const timestamp = Date.now();
        
        // Store click data in localStorage
        const clickData = {
            dealId,
            store,
            timestamp,
            url: link.href,
            source: 'getupdeals'
        };
        
        localStorage.setItem(`affiliate_click_${dealId}`, JSON.stringify(clickData));
        
        // Track in analytics
        if (window.analytics) {
            window.analytics.trackEvent('affiliate_click', {
                dealId,
                store,
                url: link.href
            });
        }
        
        // Send to your backend (if you have one)
        this.sendClickToBackend(clickData);
    }

    sendClickToBackend(clickData) {
        // Example: Send to your tracking endpoint
        // fetch('/api/track-click', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(clickData)
        // });
        
        console.log('Affiliate click tracked:', clickData);
    }

    injectAffiliateLinks() {
        // Convert regular links to affiliate links
        const affiliateElements = document.querySelectorAll('[data-affiliate="true"]');
        
        affiliateElements.forEach(element => {
            if (element.tagName === 'A') {
                this.convertToAffiliateLink(element);
            }
        });
    }

    convertToAffiliateLink(link) {
        const originalUrl = link.href;
        
        // Skip if already converted
        if (link.dataset.affiliateConverted === 'true') {
            return;
        }
        
        // Add affiliate parameters based on store
        const affiliateUrl = this.addAffiliateParams(originalUrl, link.dataset.store);
        
        // Update the link
        link.href = affiliateUrl;
        link.dataset.affiliateConverted = 'true';
        
        // Add rel attributes for security
        link.rel = 'noopener noreferrer';
        link.target = '_blank';
    }

    addAffiliateParams(url, store) {
        if (!url || !store) return url;
        
        let affiliateUrl = url;
        const params = new URLSearchParams();
        
        // Add common affiliate parameters
        params.append('affiliate_id', this.affiliateId);
        params.append('source', 'getupdeals');
        params.append('utm_source', 'getupdeals');
        params.append('utm_medium', 'affiliate');
        params.append('utm_campaign', store);
        params.append('ref', this.affiliateId);
        
        // Store-specific parameters
        switch(store.toLowerCase()) {
            case 'amazon':
                params.append('tag', 'getupdeals-21'); // Amazon affiliate tag
                break;
            case 'flipkart':
                params.append('affid', 'getupdeals'); // Flipkart affiliate ID
                break;
            case 'myntra':
                params.append('pId', this.affiliateId);
                break;
            case 'ajio':
                params.append('utm_term', this.affiliateId);
                break;
        }
        
        // Add parameters to URL
        const separator = affiliateUrl.includes('?') ? '&' : '?';
        affiliateUrl += separator + params.toString();
        
        return affiliateUrl;
    }

    setupConversionTracking() {
        // Track page views for conversion detection
        if (document.referrer) {
            const referrer = new URL(document.referrer);
            
            // Check if coming from an affiliate store
            if (this.isAffiliateStoreReferrer(referrer.hostname)) {
                this.trackPossibleConversion();
            }
        }
    }

    isAffiliateStoreReferrer(hostname) {
        const affiliateStores = [
            'amazon.in',
            'flipkart.com',
            'myntra.com',
            'ajio.com',
            'tatacliq.com',
            'nykaa.com'
        ];
        
        return affiliateStores.some(store => hostname.includes(store));
    }

    trackPossibleConversion() {
        // Check for recent affiliate clicks
        const storageKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('affiliate_click_')
        );
        
        storageKeys.forEach(key => {
            const clickData = JSON.parse(localStorage.getItem(key));
            const timeSinceClick = Date.now() - clickData.timestamp;
            
            // If click was within the timeout period
            if (timeSinceClick < this.clickTimeout) {
                // Track as possible conversion
                if (window.analytics) {
                    window.analytics.trackEvent('possible_conversion', {
                        dealId: clickData.dealId,
                        store: clickData.store,
                        timeSinceClick: Math.round(timeSinceClick / 1000 / 60) // in minutes
                    });
                }
                
                // Remove from storage after tracking
                localStorage.removeItem(key);
            }
        });
    }

    setupLinkRewriter() {
        // Intercept clicks on store tabs to add affiliate params
        const storeLinks = document.querySelectorAll('.store-link, .store-tab a');
        
        storeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const store = link.closest('[data-store]')?.dataset.store || 
                             link.dataset.store || 'amazon';
                
                if (!link.href.includes('affiliate_id')) {
                    e.preventDefault();
                    const affiliateUrl = this.addAffiliateParams(link.href, store);
                    window.open(affiliateUrl, '_blank');
                }
            });
        });
    }

    // Utility function to get commission rates (for display)
    getCommissionRate(store) {
        const commissions = {
            'amazon': '1-10%',
            'flipkart': '2-15%',
            'myntra': '4-20%',
            'ajio': '3-12%',
            'tatacliq': '3-10%',
            'nykaa': '5-25%'
        };
        
        return commissions[store] || '1-15%';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.affiliateIntegration = new AffiliateIntegration();
});