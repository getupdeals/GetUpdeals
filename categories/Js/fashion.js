// categories/fashion.js - Fashion category page functionality
class FashionCategory {
    constructor() {
        this.dealsContainer = document.getElementById('dealsContainer');
        this.loadMoreBtn = document.getElementById('loadMore');
        this.filterPanel = document.getElementById('filterPanel');
        this.filterToggle = document.getElementById('filterToggle');
        this.filterClose = document.getElementById('filterClose');
        this.applyFiltersBtn = document.getElementById('applyFilters');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.sortSelect = document.getElementById('sortSelect');
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.subcategoryCards = document.querySelectorAll('.subcategory-card');
        
        this.currentPage = 1;
        this.dealsPerPage = 24;
        this.totalDeals = 1245;
        this.isLoading = false;
        this.currentFilters = this.getDefaultFilters();
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        this.loadFashionDeals();
        this.setupEventListeners();
        this.setupSubcategoryFilters();
        this.initializeFilters();
        
        // Track page view
        if (window.analytics) {
            window.analytics.trackEvent('category_view', {
                category: 'fashion',
                page: this.currentPage
            });
        }
    }

    getDefaultFilters() {
        return {
            price: { min: 0, max: 10000 },
            discount: ['70'],
            brands: [],
            stores: ['amazon', 'flipkart', 'myntra'],
            gender: 'all',
            rating: null,
            sort: 'newest',
            subcategory: null
        };
    }

    async loadFashionDeals() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // Load fashion-specific deals from JSON or API
            const deals = await this.fetchFashionDeals();
            
            // Apply current filters
            const filteredDeals = this.applyFilters(deals);
            
            // Apply current sort
            const sortedDeals = this.sortDeals(filteredDeals);
            
            // Paginate
            const paginatedDeals = this.paginateDeals(sortedDeals);
            
            // Render deals
            this.renderDeals(paginatedDeals);
            
            // Update results count
            this.updateResultsCount(filteredDeals.length);
            
            // Update load more button
            this.updateLoadMoreButton(filteredDeals.length);
            
        } catch (error) {
            console.error('Error loading fashion deals:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async fetchFashionDeals() {
        try {
            // Try to load from deals.json
            const response = await fetch('../assets/data/deals.json');
            if (!response.ok) throw new Error('Failed to load deals');
            
            const data = await response.json();
            
            // Filter only fashion deals
            return data.deals.filter(deal => 
                deal.category === 'fashion' || 
                ['clothing', 'footwear', 'accessories', 'watches'].includes(deal.subcategory)
            );
            
        } catch (error) {
            console.warn('Using sample fashion deals:', error);
            return this.getSampleFashionDeals();
        }
    }

    getSampleFashionDeals() {
        return [
            {
                id: "FASH001",
                title: "Men's Slim Fit Jeans - Levi's",
                description: "Premium denim jeans with stretch comfort and modern fit",
                currentPrice: 1999,
                originalPrice: 4999,
                discount: 60,
                category: "fashion",
                subcategory: "clothing",
                brand: "levis",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/jeans123",
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                reviews: 2345,
                expiry: "2024-12-31",
                gender: "men",
                tags: ["jeans", "denim", "bestseller"]
            },
            {
                id: "FASH002",
                title: "Women's Winter Jacket - H&M",
                description: "Quilted puffer jacket with hood, water resistant",
                currentPrice: 2499,
                originalPrice: 5999,
                discount: 58,
                category: "fashion",
                subcategory: "clothing",
                brand: "h&m",
                store: "myntra",
                affiliateLink: "https://myntra.com/jacket123",
                image: "https://images.unsplash.com/photo-1515434126000-961d90ff09db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.3,
                reviews: 1567,
                expiry: "2024-12-25",
                gender: "women",
                tags: ["winter", "jacket", "women"]
            },
            {
                id: "FASH003",
                title: "Running Shoes - Nike Air Max",
                description: "Cushioned running shoes with air technology",
                currentPrice: 4999,
                originalPrice: 8999,
                discount: 44,
                category: "fashion",
                subcategory: "footwear",
                brand: "nike",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/nike123",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                reviews: 3892,
                expiry: "2024-12-28",
                gender: "unisex",
                tags: ["shoes", "sports", "running"]
            },
            {
                id: "FASH004",
                title: "Leather Wallet - Tommy Hilfiger",
                description: "Genuine leather wallet with multiple card slots",
                currentPrice: 899,
                originalPrice: 1999,
                discount: 55,
                category: "fashion",
                subcategory: "accessories",
                brand: "tommy",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/wallet123",
                image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.2,
                reviews: 892,
                expiry: "2024-12-30",
                gender: "men",
                tags: ["wallet", "leather", "accessory"]
            }
        ];
    }

    applyFilters(deals) {
        return deals.filter(deal => {
            // Price filter
            if (deal.currentPrice < this.currentFilters.price.min || 
                deal.currentPrice > this.currentFilters.price.max) {
                return false;
            }
            
            // Discount filter
            if (this.currentFilters.discount.length > 0) {
                const discountMatch = this.currentFilters.discount.some(range => {
                    if (range === '70') return deal.discount >= 70;
                    if (range === '50') return deal.discount >= 50 && deal.discount < 70;
                    if (range === '30') return deal.discount >= 30 && deal.discount < 50;
                    if (range === '0') return deal.discount < 30;
                    return false;
                });
                if (!discountMatch) return false;
            }
            
            // Brand filter
            if (this.currentFilters.brands.length > 0 && deal.brand) {
                if (!this.currentFilters.brands.includes(deal.brand)) {
                    return false;
                }
            }
            
            // Store filter
            if (this.currentFilters.stores.length > 0) {
                if (!this.currentFilters.stores.includes(deal.store)) {
                    return false;
                }
            }
            
            // Gender filter
            if (this.currentFilters.gender !== 'all' && deal.gender) {
                if (this.currentFilters.gender !== deal.gender && 
                    !(this.currentFilters.gender === 'unisex' && ['men', 'women'].includes(deal.gender))) {
                    return false;
                }
            }
            
            // Rating filter
            if (this.currentFilters.rating && deal.rating) {
                if (deal.rating < parseFloat(this.currentFilters.rating)) {
                    return false;
                }
            }
            
            // Subcategory filter
            if (this.currentFilters.subcategory && deal.subcategory) {
                if (deal.subcategory !== this.currentFilters.subcategory) {
                    return false;
                }
            }
            
            return true;
        });
    }

    sortDeals(deals) {
        switch(this.currentFilters.sort) {
            case 'discount':
                return [...deals].sort((a, b) => b.discount - a.discount);
            case 'price-low':
                return [...deals].sort((a, b) => a.currentPrice - b.currentPrice);
            case 'price-high':
                return [...deals].sort((a, b) => b.currentPrice - a.currentPrice);
            case 'rating':
                return [...deals].sort((a, b) => b.rating - a.rating);
            case 'popular':
                return [...deals].sort((a, b) => b.reviews - a.reviews);
            case 'newest':
            default:
                return deals; // Already sorted by newest in data
        }
    }

    paginateDeals(deals) {
        const startIndex = (this.currentPage - 1) * this.dealsPerPage;
        const endIndex = startIndex + this.dealsPerPage;
        return deals.slice(0, endIndex);
    }

    renderDeals(deals) {
        if (this.currentPage === 1) {
            this.dealsContainer.innerHTML = '';
        }
        
        if (deals.length === 0) {
            this.showNoDealsMessage();
            return;
        }
        
        deals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            this.dealsContainer.appendChild(dealCard);
        });
        
        // Apply current view
        this.applyViewMode();
    }

    createDealCard(deal) {
        const card = document.createElement('div');
        card.className = `deal-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        card.dataset.id = deal.id;
        card.dataset.category = deal.subcategory;
        card.dataset.brand = deal.brand;
        card.dataset.gender = deal.gender;
        
        const formattedCurrentPrice = `₹${deal.currentPrice.toLocaleString('en-IN')}`;
        const formattedOriginalPrice = `₹${deal.originalPrice.toLocaleString('en-IN')}`;
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)}
                </span>
                ${deal.gender ? `<span class="deal-badge gender ${deal.gender}">${deal.gender}</span>` : ''}
            </div>
            
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy">
                <button class="wishlist-btn" data-deal-id="${deal.id}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            
            <div class="deal-content">
                <div class="deal-header">
                    <h3 class="deal-title">${deal.title}</h3>
                    <span class="deal-brand">${deal.brand || ''}</span>
                </div>
                
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
                    <div class="you-save">Save ₹${(deal.originalPrice - deal.currentPrice).toLocaleString('en-IN')}</div>
                </div>
                
                <div class="deal-meta">
                    <span class="deal-category">
                        <i class="fas fa-tag"></i> ${deal.subcategory || 'Fashion'}
                    </span>
                    <span class="deal-expiry">
                        <i class="far fa-clock"></i> Ends: ${this.formatDate(deal.expiry)}
                    </span>
                </div>
                
                <div class="deal-actions">
                    <a href="${deal.affiliateLink}" 
                       class="deal-btn primary" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       data-affiliate="true"
                       data-deal-id="${deal.id}"
                       data-track="fashion_deal_click">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary compare-btn" data-deal-id="${deal.id}">
                        <i class="fas fa-balance-scale"></i>
                    </button>
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
            'flipkart': '<img src="../assets/images/ui/flipkart-icon.png" alt="Flipkart" class="store-icon">',
            'myntra': '<img src="../assets/images/ui/myntra-icon.png" alt="Myntra" class="store-icon">',
            'ajio': '<img src="../assets/images/ui/ajio-icon.png" alt="Ajio" class="store-icon">'
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
            month: 'short'
        });
    }

    applyViewMode() {
        const dealCards = document.querySelectorAll('.deal-card');
        dealCards.forEach(card => {
            if (this.currentView === 'list') {
                card.classList.add('list-view');
            } else {
                card.classList.remove('list-view');
            }
        });
    }

    setupEventListeners() {
        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadFashionDeals();
                
                // Track load more
                if (window.analytics) {
                    window.analytics.trackEvent('load_more_fashion', {
                        page: this.currentPage
                    });
                }
            });
        }
        
        // Filter toggle
        if (this.filterToggle) {
            this.filterToggle.addEventListener('click', () => {
                this.filterPanel.classList.toggle('active');
            });
        }
        
        // Filter close
        if (this.filterClose) {
            this.filterClose.addEventListener('click', () => {
                this.filterPanel.classList.remove('active');
            });
        }
        
        // Apply filters
        if (this.applyFiltersBtn) {
            this.applyFiltersBtn.addEventListener('click', () => {
                this.updateFiltersFromUI();
                this.currentPage = 1;
                this.loadFashionDeals();
                this.filterPanel.classList.remove('active');
                
                // Track filter apply
                if (window.analytics) {
                    window.analytics.trackEvent('fashion_filters_applied', this.currentFilters);
                }
            });
        }
        
        // Clear filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
                this.loadFashionDeals();
                
                // Track filter clear
                if (window.analytics) {
                    window.analytics.trackEvent('fashion_filters_cleared');
                }
            });
        }
        
        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.currentPage = 1;
                this.loadFashionDeals();
                
                // Track sort change
                if (window.analytics) {
                    window.analytics.trackEvent('fashion_sort_changed', {
                        sort: e.target.value
                    });
                }
            });
        }
        
        // View buttons
        this.viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentView = button.dataset.view;
                this.applyViewMode();
                
                // Track view change
                if (window.analytics) {
                    window.analytics.trackEvent('fashion_view_changed', {
                        view: this.currentView
                    });
                }
            });
        });
        
        // Wishlist button clicks (delegated)
        this.dealsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-btn')) {
                this.toggleWishlist(e.target.closest('.wishlist-btn'));
            }
            
            if (e.target.closest('.compare-btn')) {
                this.addToCompare(e.target.closest('.compare-btn'));
            }
            
            if (e.target.closest('.share-btn')) {
                this.shareDeal(e.target.closest('.share-btn'));
            }
        });
    }

    setupSubcategoryFilters() {
        this.subcategoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const subcategory = card.dataset.category;
                this.currentFilters.subcategory = subcategory;
                this.currentPage = 1;
                this.loadFashionDeals();
                
                // Highlight active subcategory
                this.subcategoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Track subcategory click
                if (window.analytics) {
                    window.analytics.trackEvent('fashion_subcategory_click', {
                        subcategory: subcategory
                    });
                }
            });
        });
    }

    initializeFilters() {
        // Price range slider
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceSliderMin = document.getElementById('priceSliderMin');
        const priceSliderMax = document.getElementById('priceSliderMax');
        const priceDisplay = document.getElementById('priceDisplay');
        
        if (priceMin && priceMax && priceSliderMin && priceSliderMax) {
            const updatePriceDisplay = () => {
                const min = parseInt(priceSliderMin.value);
                const max = parseInt(priceSliderMax.value);
                priceMin.value = min;
                priceMax.value = max;
                priceDisplay.textContent = `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
            };
            
            priceSliderMin.addEventListener('input', updatePriceDisplay);
            priceSliderMax.addEventListener('input', updatePriceDisplay);
            
            priceMin.addEventListener('change', () => {
                priceSliderMin.value = priceMin.value;
                updatePriceDisplay();
            });
            
            priceMax.addEventListener('change', () => {
                priceSliderMax.value = priceMax.value;
                updatePriceDisplay();
            });
        }
    }

    updateFiltersFromUI() {
        // Price
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        if (priceMin && priceMax) {
            this.currentFilters.price = {
                min: parseInt(priceMin.value) || 0,
                max: parseInt(priceMax.value) || 10000
            };
        }
        
        // Discount
        const discountCheckboxes = document.querySelectorAll('input[name="discount"]:checked');
        this.currentFilters.discount = Array.from(discountCheckboxes).map(cb => cb.value);
        
        // Brands
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        this.currentFilters.brands = Array.from(brandCheckboxes).map(cb => cb.value);
        
        // Stores
        const storeCheckboxes = document.querySelectorAll('input[name="store"]:checked');
        this.currentFilters.stores = Array.from(storeCheckboxes).map(cb => cb.value);
        
        // Gender
        const genderRadio = document.querySelector('input[name="gender"]:checked');
        if (genderRadio) {
            this.currentFilters.gender = genderRadio.value;
        }
        
        // Rating
        const ratingRadio = document.querySelector('input[name="rating"]:checked');
        if (ratingRadio) {
            this.currentFilters.rating = ratingRadio.value;
        }
    }

    resetFilters() {
        this.currentFilters = this.getDefaultFilters();
        this.currentFilters.subcategory = null;
        
        // Reset UI elements
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (['amazon', 'flipkart', 'myntra'].includes(cb.value) && cb.name === 'store') {
                cb.checked = true;
            } else if (cb.value === '70' && cb.name === 'discount') {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === 'all' && radio.name === 'gender';
        });
        
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceSliderMin = document.getElementById('priceSliderMin');
        const priceSliderMax = document.getElementById('priceSliderMax');
        
        if (priceMin && priceMax && priceSliderMin && priceSliderMax) {
            priceMin.value = 0;
            priceMax.value = 10000;
            priceSliderMin.value = 0;
            priceSliderMax.value = 10000;
            document.getElementById('priceDisplay').textContent = '₹0 - ₹10,000';
        }
        
        this.sortSelect.value = 'newest';
        this.subcategoryCards.forEach(c => c.classList.remove('active'));
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Track wishlist add
            if (window.analytics) {
                window.analytics.trackEvent('fashion_wishlist_add', { dealId });
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    }

    addToCompare(button) {
        const dealId = button.dataset.dealId;
        
        // Show comparison modal or add to comparison list
        this.showToast('Added to comparison');
        
        // Track compare
        if (window.analytics) {
            window.analytics.trackEvent('fashion_compare_add', { dealId });
        }
    }

    shareDeal(button) {
        const dealId = button.dataset.dealId;
        
        if (navigator.share) {
            navigator.share({
                title: 'Amazing Fashion Deal!',
                text: 'Check out this fashion deal on GetUpDeals',
                url: window.location.origin + `/deals/fashion/${dealId}/`
            });
        } else {
            navigator.clipboard.writeText(window.location.origin + `/deals/fashion/${dealId}/`);
            this.showToast('Deal link copied!');
        }
        
        // Track share
        if (window.analytics) {
            window.analytics.trackEvent('fashion_deal_share', { dealId });
        }
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

    updateResultsCount(count) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = Math.min(count, this.currentPage * this.dealsPerPage);
        }
        
        const loadMoreInfo = document.querySelector('.load-more-info');
        if (loadMoreInfo) {
            loadMoreInfo.textContent = `Showing ${Math.min(count, this.currentPage * this.dealsPerPage)} of ${count} fashion deals`;
        }
    }

    updateLoadMoreButton(totalFiltered) {
        if (!this.loadMoreBtn) return;
        
        const loadedCount = this.currentPage * this.dealsPerPage;
        
        if (loadedCount >= totalFiltered) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.innerHTML = `<i class="fas fa-spinner"></i> Load More Deals (${totalFiltered - loadedCount} more)`;
        }
    }

    showLoadingState() {
        if (this.currentPage === 1) {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
        } else {
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.loadMoreBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner"></i> Load More Deals';
            this.loadMoreBtn.disabled = false;
        }
    }

    showNoDealsMessage() {
        this.dealsContainer.innerHTML = `
            <div class="no-deals-message">
                <i class="fas fa-search"></i>
                <h3>No fashion deals found</h3>
                <p>Try adjusting your filters or check back later for new deals!</p>
                <button class="btn-primary" id="resetFiltersBtn">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
            this.resetFilters();
            this.loadFashionDeals();
        });
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load fashion deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="btn-primary" id="retryLoading">Retry</button>
            </div>
        `;
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.loadFashionDeals();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const fashionCategory = new FashionCategory();
    window.fashionCategory = fashionCategory;
});