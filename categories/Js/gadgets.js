// categories/gadgets.js - Gadgets category page functionality
class GadgetsCategory {
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
        this.quickAccessCards = document.querySelectorAll('.quick-access-card');
        this.comparisonModal = document.getElementById('comparisonModal');
        this.modalClose = document.getElementById('modalClose');
        this.compareButtons = document.querySelectorAll('.compare-btn');
        
        this.currentPage = 1;
        this.dealsPerPage = 24;
        this.totalDeals = 556;
        this.isLoading = false;
        this.currentFilters = this.getDefaultFilters();
        this.currentView = 'grid';
        this.comparisonItems = [];
        
        this.init();
    }

    init() {
        this.loadGadgetsDeals();
        this.setupEventListeners();
        this.setupQuickAccessFilters();
        this.initializeFilters();
        this.setupComparison();
        
        // Track page view
        if (window.analytics) {
            window.analytics.trackEvent('category_view', {
                category: 'gadgets',
                page: this.currentPage
            });
        }
    }

    getDefaultFilters() {
        return {
            price: { min: 0, max: 10000 },
            gadgetType: [],
            brands: [],
            features: [],
            battery: 'all',
            rating: null,
            sort: 'newest',
            quickAccess: null
        };
    }

    async loadGadgetsDeals() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // Load gadgets-specific deals
            const deals = await this.fetchGadgetsDeals();
            
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
            console.error('Error loading gadgets deals:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async fetchGadgetsDeals() {
        try {
            // Try to load from deals.json
            const response = await fetch('../assets/data/deals.json');
            if (!response.ok) throw new Error('Failed to load deals');
            
            const data = await response.json();
            
            // Filter only gadgets deals
            return data.deals.filter(deal => 
                deal.category === 'gadgets' || 
                ['smart-watches', 'earphones', 'power-banks', 'smart-home', 'fitness', 'gaming'].includes(deal.subcategory)
            );
            
        } catch (error) {
            console.warn('Using sample gadgets deals:', error);
            return this.getSampleGadgetsDeals();
        }
    }

    getSampleGadgetsDeals() {
        return [
            {
                id: "GADGET001",
                title: "Noise ColorFit Pro 4 Smart Watch",
                description: "1.78\" AMOLED Display, Bluetooth Calling, 60 Sports Modes, SpO2 Monitor",
                currentPrice: 2999,
                originalPrice: 5999,
                discount: 50,
                category: "gadgets",
                subcategory: "smart-watches",
                brand: "noise",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/noise-pro4",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.3,
                reviews: 4892,
                expiry: "2024-12-31",
                features: ["bluetooth", "heart-rate", "waterproof", "gps"],
                battery: "7 days",
                tags: ["smart-watch", "fitness", "bluetooth-calling"]
            },
            {
                id: "GADGET002",
                title: "boAt Airdopes 141 Wireless Earbuds",
                description: "42H Playtime, ASAP Charge, ENx Tech, IPX4 Water Resistance",
                currentPrice: 1299,
                originalPrice: 2999,
                discount: 57,
                category: "gadgets",
                subcategory: "earphones",
                brand: "boat",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/airdopes141",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                reviews: 89234,
                expiry: "2024-12-28",
                features: ["bluetooth", "fast-charging", "waterproof"],
                battery: "42 hours",
                tags: ["earphones", "wireless", "audio"]
            },
            {
                id: "GADGET003",
                title: "Mi 20000mAh Power Bank",
                description: "18W Fast Charging, Dual Output, Li-polymer, Multiple Protection",
                currentPrice: 1499,
                originalPrice: 2499,
                discount: 40,
                category: "gadgets",
                subcategory: "power-banks",
                brand: "xiaomi",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/mi-powerbank",
                image: "https://images.unsplash.com/photo-1607779092-5275b7d8d9c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.4,
                reviews: 34567,
                expiry: "2024-12-30",
                features: ["fast-charging", "dual-output"],
                battery: "20000mAh",
                tags: ["power-bank", "charging", "mobile-accessory"]
            },
            {
                id: "GADGET004",
                title: "Amazon Echo Dot 5th Gen",
                description: "Smart speaker with Alexa, Better sound, Motion detection, Temperature sensor",
                currentPrice: 4499,
                originalPrice: 5999,
                discount: 25,
                category: "gadgets",
                subcategory: "smart-home",
                brand: "amazon",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/echodot5",
                image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                reviews: 15678,
                expiry: "2024-12-25",
                features: ["voice-assistant", "smart-home"],
                battery: "Plug-in",
                tags: ["smart-speaker", "alexa", "smart-home"]
            },
            {
                id: "GADGET005",
                title: "Fire-Boltt Ninja 3 Smart Watch",
                description: "1.69\" HD Display, Bluetooth Calling, 123 Sports Modes, SpO2 & HR Monitor",
                currentPrice: 2499,
                originalPrice: 4999,
                discount: 50,
                category: "gadgets",
                subcategory: "smart-watches",
                brand: "fire-boltt",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/fireboltt-ninja",
                image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.2,
                reviews: 23456,
                expiry: "2024-12-31",
                features: ["bluetooth", "heart-rate", "waterproof"],
                battery: "8 days",
                tags: ["smart-watch", "fitness", "budget"]
            },
            {
                id: "GADGET006",
                title: "Logitech G102 Gaming Mouse",
                description: "LIGHTSYNC RGB, 8,000 DPI, 6 Programmable Buttons, Mechanical Button Tensioning",
                currentPrice: 1799,
                originalPrice: 2999,
                discount: 40,
                category: "gadgets",
                subcategory: "gaming",
                brand: "logitech",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/logitech-g102",
                image: "https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.7,
                reviews: 12345,
                expiry: "2024-12-28",
                features: ["rgb-lights", "programmable"],
                battery: "Wired",
                tags: ["gaming", "mouse", "pc-accessory"]
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
            
            // Gadget type filter
            if (this.currentFilters.gadgetType.length > 0 && deal.subcategory) {
                if (!this.currentFilters.gadgetType.includes(deal.subcategory)) {
                    return false;
                }
            }
            
            // Brand filter
            if (this.currentFilters.brands.length > 0 && deal.brand) {
                if (!this.currentFilters.brands.includes(deal.brand)) {
                    return false;
                }
            }
            
            // Features filter
            if (this.currentFilters.features.length > 0 && deal.features) {
                const hasAllFeatures = this.currentFilters.features.every(feature => 
                    deal.features.includes(feature)
                );
                if (!hasAllFeatures) return false;
            }
            
            // Battery filter
            if (this.currentFilters.battery !== 'all' && deal.battery) {
                if (this.currentFilters.battery === '10+' && !deal.battery.includes('hours') && !deal.battery.includes('days')) {
                    return false;
                }
                if (this.currentFilters.battery === '20+' && !deal.battery.includes('20')) {
                    return false;
                }
                if (this.currentFilters.battery === '30+' && !deal.battery.includes('30') && !deal.battery.includes('42')) {
                    return false;
                }
            }
            
            // Rating filter
            if (this.currentFilters.rating && deal.rating) {
                if (deal.rating < parseFloat(this.currentFilters.rating)) {
                    return false;
                }
            }
            
            // Quick access filter
            if (this.currentFilters.quickAccess && deal.subcategory) {
                if (deal.subcategory !== this.currentFilters.quickAccess) {
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
            case 'battery':
                return [...deals].sort((a, b) => {
                    const aBattery = this.getBatteryValue(a.battery);
                    const bBattery = this.getBatteryValue(b.battery);
                    return bBattery - aBattery;
                });
            case 'popular':
                return [...deals].sort((a, b) => b.reviews - a.reviews);
            case 'newest':
            default:
                return deals; // Already sorted by newest in data
        }
    }

    getBatteryValue(batteryString) {
        if (!batteryString) return 0;
        
        // Extract numeric value from battery string
        const match = batteryString.match(/(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        
        // Convert days to hours (approx)
        if (batteryString.includes('days')) {
            const days = parseInt(batteryString) || 7;
            return days * 24;
        }
        
        return 0;
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
        
        // Setup comparison buttons for new cards
        this.setupDealComparisonButtons();
    }

    createDealCard(deal) {
        const card = document.createElement('div');
        card.className = `deal-card ${this.currentView === 'list' ? 'list-view' : ''}`;
        card.dataset.id = deal.id;
        card.dataset.category = deal.subcategory;
        card.dataset.brand = deal.brand;
        
        const formattedCurrentPrice = `₹${deal.currentPrice.toLocaleString('en-IN')}`;
        const formattedOriginalPrice = `₹${deal.originalPrice.toLocaleString('en-IN')}`;
        
        // Generate feature badges
        const featureBadges = deal.features ? deal.features.map(feature => 
            `<span class="deal-badge feature"><i class="fas fa-check"></i> ${this.getFeatureLabel(feature)}</span>`
        ).join('') : '';
        
        // Generate specs list
        const specsList = this.generateSpecsList(deal);
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)}
                </span>
                ${featureBadges}
            </div>
            
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy">
                <button class="wishlist-btn" data-deal-id="${deal.id}">
                    <i class="far fa-heart"></i>
                </button>
                <button class="compare-add-btn" data-deal-id="${deal.id}" data-deal-title="${deal.title}">
                    <i class="fas fa-balance-scale"></i> Compare
                </button>
            </div>
            
            <div class="deal-content">
                <div class="deal-header">
                    <h3 class="deal-title">${deal.title}</h3>
                    <span class="deal-brand">${deal.brand?.toUpperCase() || ''}</span>
                </div>
                
                <p class="deal-description">${deal.description}</p>
                
                <div class="gadget-specs">
                    ${specsList}
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
                    <span class="deal-battery">
                        <i class="fas fa-battery-full"></i> ${deal.battery || 'N/A'}
                    </span>
                </div>
                
                <div class="deal-actions">
                    <a href="${deal.affiliateLink}" 
                       class="deal-btn primary" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       data-affiliate="true"
                       data-deal-id="${deal.id}"
                       data-track="gadgets_deal_click">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary quick-view-btn" data-deal-id="${deal.id}">
                        <i class="fas fa-eye"></i> Quick View
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
            'croma': '<i class="fas fa-store"></i>'
        };
        return icons[store] || '<i class="fas fa-store"></i>';
    }

    getFeatureLabel(feature) {
        const labels = {
            'bluetooth': 'Bluetooth',
            'waterproof': 'Waterproof',
            'fast-charging': 'Fast Charging',
            'wireless-charging': 'Wireless Charge',
            'heart-rate': 'Heart Rate',
            'gps': 'GPS',
            'noise-cancellation': 'Noise Cancel',
            'voice-assistant': 'Voice Assist',
            'rgb-lights': 'RGB Lights',
            'programmable': 'Programmable',
            'dual-output': 'Dual Output'
        };
        return labels[feature] || feature;
    }

    generateSpecsList(deal) {
        let specsHTML = '<div class="specs-list">';
        
        // Add battery spec
        if (deal.battery) {
            specsHTML += `<span class="spec-item"><i class="fas fa-battery-full"></i> ${deal.battery}</span>`;
        }
        
        // Add rating spec
        specsHTML += `<span class="spec-item"><i class="fas fa-star"></i> ${deal.rating}/5</span>`;
        
        // Add reviews spec
        if (deal.reviews > 1000) {
            const reviewsInK = (deal.reviews / 1000).toFixed(1) + 'K';
            specsHTML += `<span class="spec-item"><i class="fas fa-comment"></i> ${reviewsInK} reviews</span>`;
        }
        
        specsHTML += '</div>';
        return specsHTML;
    }

    getCategoryLabel(category) {
        const labels = {
            'smart-watches': 'Smart Watch',
            'earphones': 'Earphones',
            'power-banks': 'Power Bank',
            'smart-home': 'Smart Home',
            'fitness': 'Fitness',
            'gaming': 'Gaming'
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
                this.loadGadgetsDeals();
                
                // Track load more
                if (window.analytics) {
                    window.analytics.trackEvent('load_more_gadgets', {
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
                this.loadGadgetsDeals();
                this.filterPanel.classList.remove('active');
                
                // Track filter apply
                if (window.analytics) {
                    window.analytics.trackEvent('gadgets_filters_applied', this.currentFilters);
                }
            });
        }
        
        // Clear filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
                this.loadGadgetsDeals();
                
                // Track filter clear
                if (window.analytics) {
                    window.analytics.trackEvent('gadgets_filters_cleared');
                }
            });
        }
        
        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.currentPage = 1;
                this.loadGadgetsDeals();
                
                // Track sort change
                if (window.analytics) {
                    window.analytics.trackEvent('gadgets_sort_changed', {
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
                    window.analytics.trackEvent('gadgets_view_changed', {
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
            
            if (e.target.closest('.quick-view-btn')) {
                this.quickView(e.target.closest('.quick-view-btn'));
            }
            
            if (e.target.closest('.compare-add-btn')) {
                this.addToComparison(e.target.closest('.compare-add-btn'));
            }
        });
        
        // Modal close
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => {
                this.comparisonModal.classList.remove('active');
            });
        }
        
        // Close modal on outside click
        this.comparisonModal.addEventListener('click', (e) => {
            if (e.target === this.comparisonModal) {
                this.comparisonModal.classList.remove('active');
            }
        });
    }

    setupQuickAccessFilters() {
        this.quickAccessCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const gadgetType = card.dataset.type;
                this.currentFilters.quickAccess = gadgetType;
                this.currentPage = 1;
                this.loadGadgetsDeals();
                
                // Highlight active card
                this.quickAccessCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Track quick access click
                if (window.analytics) {
                    window.analytics.trackEvent('gadgets_quick_access', {
                        type: gadgetType
                    });
                }
            });
        });
    }

    setupComparison() {
        this.compareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const product = button.dataset.product;
                this.showComparisonModal(product);
            });
        });
    }

    setupDealComparisonButtons() {
        const compareButtons = document.querySelectorAll('.compare-add-btn');
        compareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToComparison(button);
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
        
        // Gadget type
        const typeCheckboxes = document.querySelectorAll('input[name="gadget-type"]:checked');
        this.currentFilters.gadgetType = Array.from(typeCheckboxes).map(cb => cb.value);
        
        // Brands
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        this.currentFilters.brands = Array.from(brandCheckboxes).map(cb => cb.value);
        
        // Features
        const featureCheckboxes = document.querySelectorAll('input[name="feature"]:checked');
        this.currentFilters.features = Array.from(featureCheckboxes).map(cb => cb.value);
        
        // Battery
        const batteryRadio = document.querySelector('input[name="battery"]:checked');
        if (batteryRadio) {
            this.currentFilters.battery = batteryRadio.value;
        }
        
        // Rating
        const ratingRadio = document.querySelector('input[name="rating"]:checked');
        if (ratingRadio) {
            this.currentFilters.rating = ratingRadio.value;
        }
        
        // Clear quick access filter when using other filters
        this.currentFilters.quickAccess = null;
        this.quickAccessCards.forEach(c => c.classList.remove('active'));
    }

    resetFilters() {
        this.currentFilters = this.getDefaultFilters();
        
        // Reset UI elements
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = radio.value === 'all' && radio.name === 'battery';
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
        this.quickAccessCards.forEach(c => c.classList.remove('active'));
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Track wishlist add
            if (window.analytics) {
                window.analytics.trackEvent('gadgets_wishlist_add', { dealId });
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        this.showToast(icon.classList.contains('fas') ? 'Added to wishlist' : 'Removed from wishlist');
    }

    quickView(button) {
        const dealId = button.dataset.dealId;
        
        // In a real implementation, this would fetch deal details and show in a modal
        this.showToast('Quick view feature coming soon!');
        
        // Track quick view
        if (window.analytics) {
            window.analytics.trackEvent('gadgets_quick_view', { dealId });
        }
    }

    addToComparison(button) {
        const dealId = button.dataset.dealId;
        const dealTitle = button.dataset.dealTitle;
        
        // Add to comparison array (max 3 items)
        if (this.comparisonItems.length >= 3) {
            this.showToast('Maximum 3 items can be compared. Remove one first.');
            return;
        }
        
        if (!this.comparisonItems.some(item => item.id === dealId)) {
            this.comparisonItems.push({ id: dealId, title: dealTitle });
            button.innerHTML = '<i class="fas fa-check"></i> Added';
            button.classList.add('added');
            
            this.showToast('Added to comparison');
            
            // Track comparison add
            if (window.analytics) {
                window.analytics.trackEvent('gadgets_comparison_add', { dealId });
            }
        } else {
            // Remove from comparison
            this.comparisonItems = this.comparisonItems.filter(item => item.id !== dealId);
            button.innerHTML = '<i class="fas fa-balance-scale"></i> Compare';
            button.classList.remove('added');
            
            this.showToast('Removed from comparison');
        }
        
        // Show comparison button if items added
        this.updateComparisonButton();
    }

    updateComparisonButton() {
        let comparisonBtn = document.querySelector('.comparison-view-btn');
        
        if (this.comparisonItems.length > 0 && !comparisonBtn) {
            comparisonBtn = document.createElement('button');
            comparisonBtn.className = 'comparison-view-btn';
            comparisonBtn.innerHTML = `<i class="fas fa-balance-scale"></i> Compare (${this.comparisonItems.length})`;
            comparisonBtn.addEventListener('click', () => this.showComparisonModal());
            
            document.querySelector('.filter-bar').appendChild(comparisonBtn);
        } else if (comparisonBtn) {
            if (this.comparisonItems.length > 0) {
                comparisonBtn.innerHTML = `<i class="fas fa-balance-scale"></i> Compare (${this.comparisonItems.length})`;
            } else {
                comparisonBtn.remove();
            }
        }
    }

    showComparisonModal(product = null) {
        const modalBody = document.getElementById('comparisonModalBody');
        
        if (product) {
            // Show pre-defined comparison
            modalBody.innerHTML = `
                <div class="predefined-comparison">
                    <h4>Compare ${product ? product + ' deals' : 'Selected Gadgets'}</h4>
                    <p>View detailed specifications, features, and prices side by side.</p>
                    <div class="comparison-products">
                        <div class="comparison-product">
                            <img src="https://m.media-amazon.com/images/I/61f6fLzXJ+L._SL1500_.jpg" alt="Product">
                            <h5>Noise ColorFit Pro 4</h5>
                            <span class="price">₹2,999</span>
                            <a href="#" class="btn-primary">View Deal</a>
                        </div>
                        <!-- Add more products here -->
                    </div>
                </div>
            `;
        } else if (this.comparisonItems.length > 0) {
            // Show user's selected comparison
            modalBody.innerHTML = `
                <div class="user-comparison">
                    <h4>Compare Your Selection (${this.comparisonItems.length} items)</h4>
                    <div class="comparison-items">
                        ${this.comparisonItems.map(item => `
                            <div class="comparison-item">
                                <h5>${item.title}</h5>
                                <button class="btn-remove" data-id="${item.id}">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-compare-now">Compare Now</button>
                </div>
            `;
            
            // Setup remove buttons
            modalBody.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.comparisonItems = this.comparisonItems.filter(item => item.id !== id);
                    this.showComparisonModal();
                    this.updateComparisonButton();
                });
            });
            
            // Setup compare now button
            modalBody.querySelector('.btn-compare-now').addEventListener('click', () => {
                this.showToast('Comparison feature coming soon!');
                this.comparisonModal.classList.remove('active');
            });
        } else {
            modalBody.innerHTML = `
                <div class="empty-comparison">
                    <i class="fas fa-balance-scale"></i>
                    <h4>No Items to Compare</h4>
                    <p>Add gadgets to comparison by clicking the "Compare" button on product cards.</p>
                    <button class="btn-primary" onclick="window.gadgetsCategory.comparisonModal.classList.remove('active')">
                        Continue Shopping
                    </button>
                </div>
            `;
        }
        
        this.comparisonModal.classList.add('active');
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
            loadMoreInfo.textContent = `Showing ${Math.min(count, this.currentPage * this.dealsPerPage)} of ${count} gadget deals`;
        }
    }

    updateLoadMoreButton(totalFiltered) {
        if (!this.loadMoreBtn) return;
        
        const loadedCount = this.currentPage * this.dealsPerPage;
        
        if (loadedCount >= totalFiltered) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.innerHTML = `<i class="fas fa-spinner"></i> Load More Gadgets (${totalFiltered - loadedCount} more)`;
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
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner"></i> Load More Gadgets';
            this.loadMoreBtn.disabled = false;
        }
    }

    showNoDealsMessage() {
        this.dealsContainer.innerHTML = `
            <div class="no-deals-message">
                <i class="fas fa-search"></i>
                <h3>No gadget deals found</h3>
                <p>Try adjusting your filters or check back later for new deals!</p>
                <button class="btn-primary" id="resetFiltersBtn">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
            this.resetFilters();
            this.loadGadgetsDeals();
        });
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load gadget deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="btn-primary" id="retryLoading">Retry</button>
            </div>
        `;
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.loadGadgetsDeals();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gadgetsCategory = new GadgetsCategory();
    window.gadgetsCategory = gadgetsCategory;
});