// cookie-consent.js - Handles GDPR cookie compliance
class CookieConsent {
    constructor() {
        this.cookieName = 'getupdeals_cookie_consent';
        this.cookieExpiryDays = 365;
        this.consent = this.getConsent();
        this.init();
    }

    init() {
        if (!this.consent) {
            this.showBanner();
        } else {
            this.applyConsent();
        }
        
        this.setupEventListeners();
    }

    getConsent() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${this.cookieName}=`));
        
        return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : null;
    }

    saveConsent(preferences) {
        const consentData = {
            accepted: true,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.cookieExpiryDays);

        document.cookie = `${this.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        
        this.consent = consentData;
        this.applyConsent();
        this.hideBanner();
        
        // Track consent given
        if (window.analytics) {
            window.analytics.trackEvent('cookie_consent_given', { preferences });
        }
    }

    showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'block';
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }

    setupEventListeners() {
        const acceptBtn = document.getElementById('cookieAccept');
        const declineBtn = document.getElementById('cookieDecline');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    analytics: true,
                    marketing: true,
                    preferences: true
                });
            });
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    analytics: false,
                    marketing: false,
                    preferences: false
                });
            });
        }
    }

    applyConsent() {
        if (!this.consent) return;
        
        const { preferences } = this.consent;
        
        // Apply analytics consent
        if (preferences.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // Apply marketing consent
        if (preferences.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }
    }

    enableAnalytics() {
        // Enable Google Analytics, etc.
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        
        // Enable our analytics
        if (window.analytics) {
            // Analytics already running
        }
    }

    disableAnalytics() {
        // Disable Google Analytics
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        
        // Optionally disable our analytics
        // window.analytics = null;
    }

    enableMarketing() {
        // Enable marketing scripts
        console.log('Marketing cookies enabled');
    }

    disableMarketing() {
        // Disable marketing scripts
        console.log('Marketing cookies disabled');
    }

    getConsentStatus() {
        return this.consent;
    }

    resetConsent() {
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        this.consent = null;
        this.showBanner();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
});