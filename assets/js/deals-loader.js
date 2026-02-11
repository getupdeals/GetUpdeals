// deals-loader.js - Dynamically loads deals into your homepage
class DealsLoader {
    constructor() {
        this.dealsContainer = document.getElementById('dealsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.deals = [];
        this.isLoading = false;
    }

    async init() {
        try {
            // Show loading skeletons
            this.showLoadingSkeletons();
            
            // Load deals data
            await this.loadDealsData();
            
            // Render initial deals
            this.renderDeals(this.deals);
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing DealsLoader:', error);
            this.showErrorState();
        }
    }

    showLoadingSkeletons() {
        // Skeleton loaders are already in your HTML
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
            // First try to load from local JSON file
            const response = await fetch('./assets/data/deals.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.deals = data.deals || [];
            
        } catch (error) {
            console.warn('Could not load deals.json, using sample data:', error);
            // Fallback to sample data
            this.deals = this.getSampleDeals();
        }
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
                expiry: "2024-12-31",
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
                expiry: "2024-12-25",
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
                expiry: "2024-12-28",
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
                expiry: "2024-12-30",
                isFeatured: true,
                tags: ["kitchen", "appliance", "bestseller"]
            }
        ];
    }

    renderDeals(deals) {
        // Clear existing content including skeletons
        this.dealsContainer.innerHTML = '';
        
        // Filter deals based on current filter
        const filteredDeals = this.currentFilter === 'all' 
            ? deals 
            : deals.filter(deal => deal.store === this.currentFilter);
        
        // Render each deal
        filteredDeals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            this.dealsContainer.appendChild(dealCard);
        });
        
        // Hide loading overlay
        this.hideLoadingSkeletons();
        
        // If no deals found
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
        
        // Format price with Indian Rupee symbol
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
                    <span>Deal ends: ${this.formatDate(deal.expiry)}</span>
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
        // Filter button clicks
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.currentFilter = button.dataset.filter;
                this.renderDeals(this.deals);
            });
        });
        
        // Wishlist button clicks
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
            
            // Track wishlist add
            if (window.analytics) {
                window.analytics.trackEvent('wishlist_add', { dealId });
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.setAttribute('aria-label', 'Add to wishlist');
        }
        
        // Add animation
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
            // Fallback: Copy to clipboard
            const dealUrl = window.location.origin + `/deals/${deal.category}/${deal.id}/`;
            navigator.clipboard.writeText(dealUrl);
            
            // Show toast notification
            this.showToast('Deal link copied to clipboard!');
        }
        
        // Track share
        if (window.analytics) {
            window.analytics.trackEvent('deal_share', { dealId });
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
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
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.init();
        });
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const dealsLoader = new DealsLoader();
    dealsLoader.init();
});