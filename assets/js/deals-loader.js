// deals-loader.js - Dynamically loads deals from Firebase (Products Manager)
class DealsLoader {
    constructor() {
        this.dealsContainer = document.getElementById('dealsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.deals = [];
        this.isLoading = false;
        // Firebase references (global firebase assumed)
        this.db = firebase.firestore();
    }

    async init() {
        try {
            this.showLoadingSkeletons();
            await this.loadDealsData();
            this.renderDeals(this.deals);
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing DealsLoader:', error);
            this.showErrorState();
        }
    }

    showLoadingSkeletons() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }

    hideLoadingSkeletons() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    async loadDealsData() {
        try {
            // Fetch all active products from Firestore
            const snapshot = await this.db.collection('products')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                console.warn('No products found in Firestore');
                this.deals = [];
                return;
            }

            this.deals = [];
            snapshot.forEach(doc => {
                const product = doc.data();
                const deal = this.mapProductToDeal(product);
                if (deal) this.deals.push(deal);
            });
        } catch (error) {
            console.error('Firebase fetch error:', error);
            throw error;
        }
    }

    mapProductToDeal(product) {
        // Extract primary affiliate link (first one from affiliateLinks array)
        let affiliateLink = '#';
        let store = 'unknown';
        if (product.affiliateLinks && product.affiliateLinks.length > 0) {
            affiliateLink = product.affiliateLinks[0].url;
            store = product.affiliateLinks[0].store.toLowerCase();
        }

        // Use extraFields for description if available
        let description = product.extraFields?.description || 
                         product.extraFields?.shortDesc || 
                         `${product.title} - Grab this amazing deal!`;

        // Rating & reviews (optional)
        const rating = product.rating || 0;
        const reviews = product.reviews || 0;

        // Expiry date (from extraFields or null)
        const expiry = product.extraFields?.expiry || null;

        // Featured flag (check tags)
        const isFeatured = product.tags?.includes('featured') || 
                           product.tags?.includes('hot') || 
                           false;

        // Ensure required fields exist
        if (!product.title || !product.price) return null;

        return {
            id: product.id,
            title: product.title,
            description: description,
            currentPrice: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            category: product.category || 'uncategorized',
            store: store,
            affiliateLink: affiliateLink,
            image: product.image || '', // main image URL
            rating: rating,
            reviews: reviews,
            expiry: expiry,
            isFeatured: isFeatured,
            tags: product.tags || []
        };
    }

    renderDeals(deals) {
        this.dealsContainer.innerHTML = '';
        const filteredDeals = this.currentFilter === 'all' 
            ? deals 
            : deals.filter(deal => deal.store === this.currentFilter);
        
        filteredDeals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            this.dealsContainer.appendChild(dealCard);
        });
        
        this.hideLoadingSkeletons();
        
        if (filteredDeals.length === 0) {
            this.showNoDealsMessage();
        }
    }

    createDealCard(deal) {
        const card = document.createElement('div');
        card.className = 'deal-card';
        card.dataset.store = deal.store;
        card.dataset.category = deal.category;
        card.dataset.dealId = deal.id;
        
        const formattedCurrentPrice = `₹${deal.currentPrice.toLocaleString('en-IN')}`;
        const formattedOriginalPrice = `₹${deal.originalPrice.toLocaleString('en-IN')}`;
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)} ${deal.store.charAt(0).toUpperCase() + deal.store.slice(1)}
                </span>
                ${deal.isFeatured ? '<span class="deal-badge featured">🔥 Hot</span>' : ''}
            </div>
            
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy">
                <button class="wishlist-btn" data-deal-id="${deal.id}" aria-label="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            
            <div class="deal-content">
                <h3 class="deal-title">${deal.title}</h3>
                <p class="deal-description">${deal.description}</p>
                
                <div class="deal-rating">
                    <div class="stars">
                        ${this.generateStarRating(deal.rating)}
                    </div>
                    <span class="rating-text">${deal.rating} (${deal.reviews} reviews)</span>
                </div>
                
                <div class="deal-pricing">
                    <div class="current-price">${formattedCurrentPrice}</div>
                    <div class="original-price">${formattedOriginalPrice}</div>
                    <div class="you-save">You save: ₹${(deal.originalPrice - deal.currentPrice).toLocaleString('en-IN')}</div>
                </div>
                
                <div class="deal-expiry">
                    <i class="far fa-clock"></i>
                    <span>Deal ends: ${deal.expiry ? this.formatDate(deal.expiry) : 'Limited time'}</span>
                </div>
                
                <div class="deal-actions">
                    <a href="${deal.affiliateLink}" 
                       class="deal-btn primary" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       data-affiliate="true"
                       data-deal-id="${deal.id}"
                       data-store="${deal.store}"
                       data-track="deal_click">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary share-btn" data-deal-id="${deal.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    getStoreIcon(store) {
        const icons = {
            'amazon': '<i class="fab fa-amazon"></i>',
            'flipkart': '<img src="./assets/images/ui/flipkart-icon.png" alt="Flipkart" class="store-icon">',
            'myntra': '<img src="./assets/images/ui/myntra-icon.png" alt="Myntra" class="store-icon">',
            'ajio': '<img src="./assets/images/ui/ajio-icon.png" alt="Ajio" class="store-icon">'
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentFilter = button.dataset.filter;
                this.renderDeals(this.deals);
            });
        });
        
        this.dealsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-btn')) {
                this.toggleWishlist(e.target.closest('.wishlist-btn'));
            }
            if (e.target.closest('.share-btn')) {
                this.shareDeal(e.target.closest('.share-btn'));
            }
        });
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.setAttribute('aria-label', 'Remove from wishlist');
            if (window.analytics) window.analytics.trackEvent('wishlist_add', { dealId });
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.setAttribute('aria-label', 'Add to wishlist');
        }
        
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
    }

    shareDeal(button) {
        const dealId = button.dataset.dealId;
        const deal = this.deals.find(d => d.id === dealId);
        
        if (deal && navigator.share) {
            navigator.share({
                title: deal.title,
                text: `Check out this amazing deal: ${deal.title} for just ₹${deal.currentPrice} (${deal.discount}% OFF)`,
                url: window.location.origin + `/deals/${deal.category}/${deal.id}/`
            });
        } else {
            const dealUrl = window.location.origin + `/deals/${deal.category}/${deal.id}/`;
            navigator.clipboard.writeText(dealUrl);
            this.showToast('Deal link copied to clipboard!');
        }
        
        if (window.analytics) window.analytics.trackEvent('deal_share', { dealId });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    showNoDealsMessage() {
        const message = document.createElement('div');
        message.className = 'no-deals-message';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No deals found</h3>
            <p>Try changing your filters or check back later for new deals!</p>
        `;
        this.dealsContainer.appendChild(message);
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="retry-btn" id="retryLoading">Retry</button>
            </div>
        `;
        document.getElementById('retryLoading')?.addEventListener('click', () => this.init());
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const dealsLoader = new DealsLoader();
    dealsLoader.init();
});
