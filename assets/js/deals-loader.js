// deals-loader.js - Dynamically loads deals into your homepage
class DealsLoader {
    constructor() {
        this.dealsContainer = document.getElementById('dealsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.deals = [];
        this.isLoading = false;
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.hasMoreDeals = true;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Bind methods to maintain context
        this.handleFilterClick = this.handleFilterClick.bind(this);
        this.handleContainerClick = this.handleContainerClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    async init() {
        try {
            this.showLoadingSkeletons();
            await this.loadDealsData();
            this.renderDeals(this.deals);
            this.setupEventListeners();
            this.setupLazyLoading();
            this.setupInfiniteScroll();
        } catch (error) {
            console.error('Error initializing DealsLoader:', error);
            this.showErrorState();
        }
    }

    destroy() {
        // Clean up event listeners to prevent memory leaks
        this.filterButtons.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
        });
        
        if (this.dealsContainer) {
            this.dealsContainer.removeEventListener('click', this.handleContainerClick);
        }
        
        window.removeEventListener('scroll', this.handleScroll);
        
        // Clear references
        this.deals = [];
        this.dealsContainer = null;
        this.filterButtons = null;
    }

    showLoadingSkeletons() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoadingSkeletons() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    async loadDealsData() {
        try {
            // Try network first with cache busting
            const response = await fetch('./assets/data/deals.json?_=' + Date.now(), {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache for offline use
            await this.cacheDealsData(response.clone());
            
            this.deals = (data.deals || []).filter(deal => this.validateDealData(deal));
            
        } catch (error) {
            console.warn('Could not load deals.json, trying cache:', error);
            
            // Try to load from cache
            const cachedDeals = await this.loadFromCache();
            if (cachedDeals) {
                this.deals = cachedDeals;
            } else {
                // Fallback to sample data
                this.deals = this.getSampleDeals().filter(deal => this.validateDealData(deal));
            }
        }
    }

    async cacheDealsData(response) {
        try {
            if ('caches' in window) {
                const cache = await caches.open('deals-v1');
                await cache.put('./assets/data/deals.json', response);
            }
        } catch (error) {
            console.warn('Failed to cache deals:', error);
        }
    }

    async loadFromCache() {
        try {
            if ('caches' in window) {
                const cache = await caches.open('deals-v1');
                const cachedResponse = await cache.match('./assets/data/deals.json');
                
                if (cachedResponse) {
                    const data = await cachedResponse.json();
                    return data.deals || [];
                }
            }
            return null;
        } catch (error) {
            console.warn('Failed to load from cache:', error);
            return null;
        }
    }

    validateDealData(deal) {
        const required = ['id', 'title', 'currentPrice', 'originalPrice', 'store', 'image'];
        
        for (const field of required) {
            if (!deal[field]) {
                console.error(`Deal missing required field: ${field}`, deal);
                return false;
            }
        }

        // Validate URLs
        if (!this.isValidUrl(deal.affiliateLink)) {
            console.warn('Invalid affiliate link for deal:', deal.id);
            deal.affiliateLink = '#';
        }

        if (!this.isValidUrl(deal.image)) {
            console.warn('Invalid image URL for deal:', deal.id);
            deal.image = './assets/images/fallback-deal.jpg';
        }

        // Validate and recalculate discount if needed
        const calculatedDiscount = Math.round(((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100);
        if (Math.abs(calculatedDiscount - (deal.discount || 0)) > 1) {
            deal.discount = calculatedDiscount;
        }

        // Check if deal is expired
        if (deal.expiry && this.isDealExpired(deal.expiry)) {
            return false; // Filter out expired deals
        }

        return true;
    }

    isValidUrl(url) {
        if (!url || url === '#') return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    sanitizeUrl(url) {
        if (!url || url === '#') return '#';
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '#';
        } catch {
            return '#';
        }
    }

    isDealExpired(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        return now > expiry;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    getSampleDeals() {
        return [
            {
                id: "1",
                title: "Wireless Headphones",
                description: "Premium noise-cancelling headphones with 30hrs battery",
                currentPrice: 1999,
                originalPrice: 3999,
                discount: 50,
                category: "electronics",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/B0C5YHXYZ",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                reviews: 1243,
                expiry: this.getFutureDate(30),
                isFeatured: true,
                tags: ["bestseller", "limited-time", "audio"]
            },
            {
                id: "2",
                title: "Men's Casual Shirt",
                description: "Premium cotton shirt with stylish pattern",
                currentPrice: 599,
                originalPrice: 1499,
                discount: 60,
                category: "fashion",
                store: "myntra",
                affiliateLink: "https://www.myntra.com/shirt123",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.2,
                reviews: 567,
                expiry: this.getFutureDate(25),
                isFeatured: true,
                tags: ["fashion", "clothing", "bestseller"]
            },
            {
                id: "3",
                title: "Smart Watch Fitness Tracker",
                description: "Waterproof smartwatch with heart rate monitor",
                currentPrice: 2999,
                originalPrice: 5999,
                discount: 50,
                category: "gadgets",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/smartwatch123",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.3,
                reviews: 892,
                expiry: this.getFutureDate(28),
                isFeatured: true,
                tags: ["gadget", "fitness", "wearable"]
            },
            {
                id: "4",
                title: "Kitchen Mixer Grinder",
                description: "750W powerful mixer with 3 jars",
                currentPrice: 2499,
                originalPrice: 3999,
                discount: 38,
                category: "home-appliances",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/B0C5YHXYZ",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.4,
                reviews: 345,
                expiry: this.getFutureDate(30),
                isFeatured: true,
                tags: ["kitchen", "appliance", "bestseller"]
            }
        ];
    }

    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    renderDeals(deals) {
        // Disable filter buttons during render
        this.filterButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('loading');
        });

        // Clear existing content
        this.dealsContainer.innerHTML = '';
        
        // Filter deals based on current filter
        const filteredDeals = this.currentFilter === 'all' 
            ? deals 
            : deals.filter(deal => deal.store === this.currentFilter);
        
        // Paginate deals
        const start = 0;
        const end = this.currentPage * this.itemsPerPage;
        const paginatedDeals = filteredDeals.slice(start, end);
        
        // Render each deal
        paginatedDeals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            this.dealsContainer.appendChild(dealCard);
        });
        
        // Check if there are more deals to load
        this.hasMoreDeals = filteredDeals.length > end;
        
        // Hide loading overlay
        this.hideLoadingSkeletons();
        
        // Re-enable filter buttons
        this.filterButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('loading');
        });
        
        // If no deals found
        if (paginatedDeals.length === 0) {
            this.showNoDealsMessage();
        }
    }

    createDealCard(deal) {
        const card = document.createElement('div');
        card.className = 'deal-card';
        card.dataset.store = deal.store;
        card.dataset.category = deal.category;
        card.dataset.dealId = deal.id;
        
        const sanitizedAffiliateLink = this.sanitizeUrl(deal.affiliateLink);
        const formattedCurrentPrice = this.formatPrice(deal.currentPrice);
        const formattedOriginalPrice = this.formatPrice(deal.originalPrice);
        const savings = this.formatPrice(deal.originalPrice - deal.currentPrice);
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)} ${deal.store.charAt(0).toUpperCase() + deal.store.slice(1)}
                </span>
                ${deal.isFeatured ? '<span class="deal-badge featured">🔥 Hot</span>' : ''}
            </div>
            
            <div class="deal-image">
                <img data-src="${deal.image}" 
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ELoading...%3C/text%3E%3C/svg%3E"
                     alt="${this.escapeHtml(deal.title)}" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='./assets/images/fallback-deal.jpg';">
                <button class="wishlist-btn" data-deal-id="${deal.id}" aria-label="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            
            <div class="deal-content">
                <h3 class="deal-title">${this.escapeHtml(deal.title)}</h3>
                <p class="deal-description">${this.escapeHtml(deal.description || '')}</p>
                
                ${deal.rating ? `
                <div class="deal-rating">
                    <div class="stars">
                        ${this.generateStarRating(deal.rating)}
                    </div>
                    <span class="rating-text">${deal.rating} (${deal.reviews || 0} reviews)</span>
                </div>
                ` : ''}
                
                <div class="deal-pricing">
                    <div class="current-price">${formattedCurrentPrice}</div>
                    <div class="original-price">${formattedOriginalPrice}</div>
                    <div class="you-save">You save: ${savings}</div>
                </div>
                
                ${deal.expiry ? `
                <div class="deal-expiry">
                    <i class="far fa-clock"></i>
                    <span>Deal ends: ${this.formatDate(deal.expiry)}</span>
                </div>
                ` : ''}
                
                <div class="deal-actions">
                    <a href="${sanitizedAffiliateLink}" 
                       class="deal-btn primary" 
                       target="_blank" 
                       rel="noopener noreferrer nofollow"
                       data-affiliate="true"
                       data-deal-id="${deal.id}"
                       data-store="${deal.store}"
                       onclick="return DealsLoader.handleAffiliateClick('${deal.id}', '${deal.store}')">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary share-btn" data-deal-id="${deal.id}" aria-label="Share deal">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static handleAffiliateClick(dealId, store) {
        // Track affiliate click
        DealsLoader.trackEvent('affiliate_click', store, dealId);
        return true;
    }

    getStoreIcon(store) {
        const icons = {
            'amazon': '<i class="fab fa-amazon"></i>',
            'flipkart': '<img src="./assets/images/ui/flipkart-icon.png" alt="Flipkart" class="store-icon" onerror="this.style.display=\'none\'">',
            'myntra': '<img src="./assets/images/ui/myntra-icon.png" alt="Myntra" class="store-icon" onerror="this.style.display=\'none\'">',
            'ajio': '<img src="./assets/images/ui/ajio-icon.png" alt="Ajio" class="store-icon" onerror="this.style.display=\'none\'">'
        };
        return icons[store] || '<i class="fas fa-store"></i>';
    }

    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    setupEventListeners() {
        // Filter button clicks with debounce
        let filterTimeout;
        this.filterButtons.forEach(button => {
            button.removeEventListener('click', this.handleFilterClick);
            button.addEventListener('click', (e) => {
                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(() => this.handleFilterClick(e), 150);
            });
        });
        
        // Container click events for wishlist and share
        this.dealsContainer.addEventListener('click', this.handleContainerClick);
    }

    handleFilterClick(event) {
        const button = event.currentTarget;
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentFilter = button.dataset.filter;
        this.currentPage = 1; // Reset pagination
        this.renderDeals(this.deals);
        
        this.trackEvent('filter_click', this.currentFilter, 'filter_change');
    }

    handleContainerClick(event) {
        const wishlistBtn = event.target.closest('.wishlist-btn');
        if (wishlistBtn) {
            this.toggleWishlist(wishlistBtn);
            return;
        }
        
        const shareBtn = event.target.closest('.share-btn');
        if (shareBtn) {
            this.shareDeal(shareBtn);
            return;
        }
    }

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        
                        // Add error handling for lazy loaded images
                        img.addEventListener('error', () => {
                            this.retryImageLoad(img, 0);
                        });
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('.deal-image img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    retryImageLoad(imgElement, retryCount = 0) {
        const maxRetries = 3;
        const originalSrc = imgElement.dataset.src || imgElement.src;
        
        if (retryCount < maxRetries) {
            setTimeout(() => {
                imgElement.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'retry=' + retryCount;
            }, 1000 * (retryCount + 1));
        } else {
            imgElement.src = './assets/images/fallback-deal.jpg';
        }
    }

    setupInfiniteScroll() {
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        if (this.isLoading || !this.hasMoreDeals) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 1000;

        if (scrollPosition >= threshold) {
            this.loadMoreDeals();
        }
    }

    async loadMoreDeals() {
        if (this.isLoading || !this.hasMoreDeals) return;
        
        this.isLoading = true;
        
        // Show loading indicator at bottom
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-more';
        loadingIndicator.innerHTML = '<div class="spinner"></div><span>Loading more deals...</span>';
        this.dealsContainer.appendChild(loadingIndicator);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.currentPage++;
        this.renderDeals(this.deals);
        
        // Remove loading indicator
        loadingIndicator.remove();
        this.isLoading = false;
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        const isAdding = icon.classList.contains('far');
        
        if (isAdding) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.setAttribute('aria-label', 'Remove from wishlist');
            this.showToast('Added to wishlist!');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.setAttribute('aria-label', 'Add to wishlist');
            this.showToast('Removed from wishlist');
        }
        
        // Add animation
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
        
        // Track wishlist action
        this.trackEvent('wishlist', isAdding ? 'add' : 'remove', dealId);
        
        // Save to localStorage
        this.saveWishlistToStorage(dealId, isAdding);
    }

    saveWishlistToStorage(dealId, add) {
        try {
            let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            
            if (add && !wishlist.includes(dealId)) {
                wishlist.push(dealId);
            } else if (!add) {
                wishlist = wishlist.filter(id => id !== dealId);
            }
            
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.warn('Failed to save wishlist:', error);
        }
    }

    async shareDeal(button) {
        const dealId = button.dataset.dealId;
        const deal = this.deals.find(d => d.id === dealId);
        
        if (!deal) return;
        
        const shareData = {
            title: deal.title,
            text: `Check out this amazing deal: ${deal.title} for just ${this.formatPrice(deal.currentPrice)} (${deal.discount}% OFF)`,
            url: `${window.location.origin}/deals/${deal.category}/${deal.id}/`
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.showToast('Thanks for sharing!');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                this.showToast('Deal link copied to clipboard!');
            }
            
            this.trackEvent('share', 'deal_shared', dealId);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.warn('Share failed:', error);
                this.showToast('Could not share deal', 'error');
            }
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    showNoDealsMessage() {
        const message = document.createElement('div');
        message.className = 'no-deals-message';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No deals found</h3>
            <p>Try changing your filters or check back later for new deals!</p>
            <button class="retry-btn" onclick="window.location.reload()">Refresh Page</button>
        `;
        this.dealsContainer.appendChild(message);
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="retry-btn" id="retryLoading">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.retryCount++;
            if (this.retryCount <= this.maxRetries) {
                this.showLoadingSkeletons();
                this.init();
            } else {
                this.showToast('Max retries reached. Please refresh the page.', 'error');
            }
        });
    }

    static trackEvent(category, action, label, value) {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
        
        // Facebook Pixel
        if (window.fbq) {
            fbq('trackCustom', category, {
                action: action,
                label: label,
                value: value
            });
        }
        
        // Console logging for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Track:', { category, action, label, value });
        }
    }
}

// Make static method available globally
window.DealsLoader = DealsLoader;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if deals grid exists
    if (!document.getElementById('dealsGrid')) {
        console.warn('Deals grid not found on this page');
        return;
    }
    
    const dealsLoader = new DealsLoader();
    
    // Store instance for debugging
    window.dealsLoader = dealsLoader;
    
    // Initialize
    dealsLoader.init();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        dealsLoader.destroy();
    });
});
