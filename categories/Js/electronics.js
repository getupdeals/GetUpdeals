// categories/electronics.js - Electronics category page functionality
class ElectronicsCategory {
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
        this.totalDeals = 895;
        this.isLoading = false;
        this.currentFilters = this.getDefaultFilters();
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        this.loadElectronicsDeals();
        this.setupEventListeners();
        this.setupSubcategoryFilters();
        this.initializeFilters();
        
        // Track page view
        if (window.analytics) {
            window.analytics.trackEvent('category_view', {
                category: 'electronics',
                page: this.currentPage
            });
        }
    }

    getDefaultFilters() {
        return {
            price: { min: 0, max: 50000 },
            discount: ['70'],
            brands: [],
            stores: ['amazon', 'flipkart'],
            specs: [],
            rating: null,
            sort: 'newest',
            subcategory: null
        };
    }

    async loadElectronicsDeals() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // Load electronics-specific deals
            const deals = await this.fetchElectronicsDeals();
            
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
            console.error('Error loading electronics deals:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async fetchElectronicsDeals() {
        try {
            // Try to load from deals.json
            const response = await fetch('../assets/data/deals.json');
            if (!response.ok) throw new Error('Failed to load deals');
            
            const data = await response.json();
            
            // Filter only electronics deals
            return data.deals.filter(deal => 
                deal.category === 'electronics' || 
                ['smartphones', 'laptops', 'televisions', 'cameras', 'audio', 'appliances'].includes(deal.subcategory)
            );
            
        } catch (error) {
            console.warn('Using sample electronics deals:', error);
            return this.getSampleElectronicsDeals();
        }
    }

    getSampleElectronicsDeals() {
        return [
            {
                id: "ELEC001",
                title: "Samsung Galaxy S23 FE (8GB/128GB)",
                description: "5G smartphone with 50MP camera, Exynos 2200, 120Hz display",
                currentPrice: 44999,
                originalPrice: 59999,
                discount: 25,
                category: "electronics",
                subcategory: "smartphones",
                brand: "samsung",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/galaxys23fe",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.4,
                reviews: 2345,
                expiry: "2024-12-31",
                specs: ["5g", "8gb-ram", "256gb-storage"],
                tags: ["smartphone", "5g", "flagship"]
            },
            {
                id: "ELEC002",
                title: "Dell Inspiron 15 Laptop",
                description: "Intel Core i5, 16GB RAM, 512GB SSD, Windows 11, FHD Display",
                currentPrice: 54999,
                originalPrice: 69999,
                discount: 21,
                category: "electronics",
                subcategory: "laptops",
                brand: "dell",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/dell-inspiron",
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.3,
                reviews: 1567,
                expiry: "2024-12-25",
                specs: ["8gb-ram", "256gb-storage"],
                tags: ["laptop", "business", "student"]
            },
            {
                id: "ELEC003",
                title: "Sony Bravia 55-inch 4K Android TV",
                description: "4K HDR OLED, Google TV, Dolby Vision, Acoustic Surface Audio",
                currentPrice: 79999,
                originalPrice: 119999,
                discount: 33,
                category: "electronics",
                subcategory: "televisions",
                brand: "sony",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/sony-bravia",
                image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                reviews: 892,
                expiry: "2024-12-28",
                specs: ["4k", "smart-tv"],
                tags: ["tv", "4k", "oled", "smart"]
            },
            {
                id: "ELEC004",
                title: "Sony WH-1000XM5 Wireless Headphones",
                description: "Industry-leading noise cancellation, 30hrs battery, multipoint connect",
                currentPrice: 24999,
                originalPrice: 32999,
                discount: 24,
                category: "electronics",
                subcategory: "audio",
                brand: "sony",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/sony-xm5",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.7,
                reviews: 3892,
                expiry: "2024-12-30",
                specs: ["wireless", "noise-cancelling"],
                tags: ["headphones", "audio", "wireless"]
            },
            {
                id: "ELEC005",
                title: "LG 260L Double Door Refrigerator",
                description: "Smart Inverter Compressor, Door Cooling+, Multi Air Flow",
                currentPrice: 28999,
                originalPrice: 39999,
                discount: 28,
                category: "electronics",
                subcategory: "appliances",
                brand: "lg",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/lg-fridge",
                image: "https://images.unsplash.com/photo-1571175443880-49e1d1b5d30b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.2,
                reviews: 1345,
                expiry: "2024-12-20",
                specs: ["smart-inverter", "energy-saving"],
                tags: ["refrigerator", "appliance", "home"]
            },
            {
                id: "ELEC006",
                title: "Canon EOS R50 Mirrorless Camera",
                description: "24.2MP APS-C, 4K Video, Dual Pixel AF, Compact & Lightweight",
                currentPrice: 59999,
                originalPrice: 79999,
                discount: 25,
                category: "electronics",
                subcategory: "cameras",
                brand: "canon",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/canon-r50",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                reviews: 789,
                expiry: "2024-12-31",
                specs: ["4k", "mirrorless"],
                tags: ["camera", "mirrorless", "photography"]
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
            
            // Specifications filter
            if (this.currentFilters.specs.length > 0 && deal.specs) {
                const hasAllSpecs = this.currentFilters.specs.every(spec => 
                    deal.specs.includes(spec)
                );
                if (!hasAllSpecs) return false;
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
        
        const formattedCurrentPrice = `₹${deal.currentPrice.toLocaleString('en-IN')}`;
        const formattedOriginalPrice = `₹${deal.originalPrice.toLocaleString('en-IN')}`;
        
        // Generate specs badges
        const specsBadges = deal.specs ? deal.specs.map(spec => 
            `<span class="spec-badge">${this.getSpecLabel(spec)}</span>`
        ).join('') : '';
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)}
                </span>
                ${specsBadges}
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
                    <span class="deal-brand">${deal.brand?.toUpperCase() || ''}</span>
                </div>
                
                <p class="deal-description">${deal.description}</p>
                
                <div class="deal-specs">
                    ${this.generateSpecsInfo(deal)}
                </div>
                
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
                        <i class="fas fa-tag"></i> ${this.getCategoryLabel(deal.subcategory)}
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
                       data-track="electronics_deal_click">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary compare-btn" data-deal-id="${deal.id}">
                        <i class="fas fa-balance-scale"></i> Compare
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
            'croma': '<i class="fas fa-store"></i>',
            'reliance': '<i class="fas fa-store"></i>',
            'vijaysales': '<i class="fas fa-store"></i>'
        };
        return icons[store] || '<i class="fas fa-store"></i>';
    }

    getSpecLabel(spec) {
        const labels = {
            '5g': '5G',
            '8gb-ram': '8GB RAM',
            '256gb-storage': '256GB',
            '4k': '4K',
            'wireless': 'Wireless',
            'smart-inverter': 'Smart Inverter',
            'energy-saving': 'Energy Saving',
            'noise-cancelling': 'Noise Cancelling',
            'smart-tv': 'Smart TV',
            'mirrorless': 'Mirrorless'
        };
        return labels[spec] || spec;
    }

    generateSpecsInfo(deal) {
        if (!deal.specs || deal.specs.length === 0) return '';
        
        let specsHTML = '<div class="specs-grid">';
        deal.specs.forEach(spec => {
            specsHTML += `<span class="spec-item"><i class="fas fa-check"></i> ${this.getSpecLabel(spec)}</span>`;
        });
        specsHTML += '</div>';
        return specsHTML;
    }

    getCategoryLabel(category) {
        const labels = {
            'smartphones': 'Smartphone',
            'laptops': 'Laptop',
            'televisions': 'TV',
            'cameras': 'Camera',
            'audio': 'Audio Device',
            'appliances': 'Appliance'
        };
        return labels[category] || category;
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
                this.loadElectronicsDeals();
                
                // Track load more
                if (window.analytics) {
                    window.analytics.trackEvent('load_more_electronics', {
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
                this.loadElectronicsDeals();
                this.filterPanel.classList.remove('active');
                
                // Track filter apply
                if (window.analytics) {
                    window.analytics.trackEvent('electronics_filters_applied', this.currentFilters);
                }
            });
        }
        
        // Clear filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
                this.loadElectronicsDeals();
                
                // Track filter clear
                if (window.analytics) {
                    window.analytics.trackEvent('electronics_filters_cleared');
                }
            });
        }
        
        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.currentPage = 1;
                this.loadElectronicsDeals();
                
                // Track sort change
                if (window.analytics) {
                    window.analytics.trackEvent('electronics_sort_changed', {
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
                    window.analytics.trackEvent('electronics_view_changed', {
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
                this.addToComparison(e.target.closest('.compare-btn'));
            }
        });
        
        // Subcategory filters
        this.setupSubcategoryFilters();
    }

    setupSubcategoryFilters() {
        this.subcategoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const subcategory = card.dataset.category;
                this.currentFilters.subcategory = subcategory;
                this.currentPage = 1;
                this.loadElectronicsDeals();
                
                // Highlight active subcategory
                this.subcategoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Track subcategory click
                if (window.analytics) {
                    window.analytics.trackEvent('electronics_subcategory_click', {
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
        
        // Brand search
        const brandSearch = document.getElementById('brandSearch');
        if (brandSearch) {
            brandSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const brandCheckboxes = document.querySelectorAll('.checkbox-group label');
                
                brandCheckboxes.forEach(label => {
                    const brandName = label.textContent.toLowerCase();
                    if (brandName.includes(searchTerm)) {
                        label.style.display = 'flex';
                    } else {
                        label.style.display = 'none';
                    }
                });
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
                max: parseInt(priceMax.value) || 50000
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
        
        // Specifications
        const specCheckboxes = document.querySelectorAll('input[name="spec"]:checked');
        this.currentFilters.specs = Array.from(specCheckboxes).map(cb => cb.value);
        
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
            if (['amazon', 'flipkart'].includes(cb.value) && cb.name === 'store') {
                cb.checked = true;
            } else if (cb.value === '70' && cb.name === 'discount') {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceSliderMin = document.getElementById('priceSliderMin');
        const priceSliderMax = document.getElementById('priceSliderMax');
        
        if (priceMin && priceMax && priceSliderMin && priceSliderMax) {
            priceMin.value = 0;
            priceMax.value = 50000;
            priceSliderMin.value = 0;
            priceSliderMax.value = 50000;
            document.getElementById('priceDisplay').textContent = '₹0 - ₹50,000';
        }
        
        this.sortSelect.value = 'newest';
        this.subcategoryCards.forEach(c => c.classList.remove('active'));
        
        // Reset brand search
        const brandSearch = document.getElementById('brandSearch');
        if (brandSearch) brandSearch.value = '';
        
        const brandCheckboxes = document.querySelectorAll('.checkbox-group label');
        brandCheckboxes.forEach(label => {
            label.style.display = 'flex';
        });
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Track wishlist add
            if (window.analytics) {
                window.analytics.trackEvent('electronics_wishlist_add', { dealId });
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    }

    addToComparison(button) {
        const dealId = button.dataset.dealId;
        
        // Show comparison modal or add to comparison list
        this.showToast('Added to comparison list');
        
        // Track comparison
        if (window.analytics) {
            window.analytics.trackEvent('electronics_compare_add', { dealId });
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
            loadMoreInfo.textContent = `Showing ${Math.min(count, this.currentPage * this.dealsPerPage)} of ${count} electronics deals`;
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
                <h3>No electronics deals found</h3>
                <p>Try adjusting your filters or check back later for new deals!</p>
                <button class="btn-primary" id="resetFiltersBtn">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
            this.resetFilters();
            this.loadElectronicsDeals();
        });
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load electronics deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="btn-primary" id="retryLoading">Retry</button>
            </div>
        `;
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.loadElectronicsDeals();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const electronicsCategory = new ElectronicsCategory();
    window.electronicsCategory = electronicsCategory;
});