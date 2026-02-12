// categories/home-appliances.js - Home appliances category page functionality
class HomeAppliancesCategory {
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
        this.applianceCards = document.querySelectorAll('.appliance-category-card');
        this.emiModal = document.getElementById('emiModal');
        this.emiModalClose = document.getElementById('emiModalClose');
        this.calculateEMI = document.getElementById('calculateEMI');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        this.currentPage = 1;
        this.dealsPerPage = 24;
        this.totalDeals = 398;
        this.isLoading = false;
        this.currentFilters = this.getDefaultFilters();
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        this.loadAppliancesDeals();
        this.setupEventListeners();
        this.setupApplianceCategoryFilters();
        this.initializeFilters();
        this.setupEMICalculator();
        this.setupGuideTabs();
        
        // Track page view
        if (window.analytics) {
            window.analytics.trackEvent('category_view', {
                category: 'home-appliances',
                page: this.currentPage
            });
        }
    }

    getDefaultFilters() {
        return {
            price: { min: 0, max: 50000 },
            applianceType: [],
            brands: [],
            energyRating: null,
            features: [],
            fridgeCapacity: '',
            acCapacity: '',
            sort: 'newest',
            applianceCategory: null
        };
    }

    async loadAppliancesDeals() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            // Load appliances-specific deals
            const deals = await this.fetchAppliancesDeals();
            
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
            console.error('Error loading appliances deals:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async fetchAppliancesDeals() {
        try {
            // Try to load from deals.json
            const response = await fetch('../assets/data/deals.json');
            if (!response.ok) throw new Error('Failed to load deals');
            
            const data = await response.json();
            
            // Filter only appliances deals
            return data.deals.filter(deal => 
                deal.category === 'home-appliances' || 
                ['refrigerators', 'ac', 'washing-machines', 'microwaves', 'water-purifiers', 'kitchen'].includes(deal.subcategory)
            );
            
        } catch (error) {
            console.warn('Using sample appliances deals:', error);
            return this.getSampleAppliancesDeals();
        }
    }

    getSampleAppliancesDeals() {
        return [
            {
                id: "APP001",
                title: "LG 260L Double Door Refrigerator",
                description: "Smart Inverter Compressor, Door Cooling+, Multi Air Flow, Convertible Freezer",
                currentPrice: 28999,
                originalPrice: 39999,
                discount: 28,
                category: "home-appliances",
                subcategory: "refrigerators",
                brand: "lg",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/lg-fridge",
                image: "https://images.unsplash.com/photo-1571175443880-49e1d1b5d30b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.2,
                reviews: 1345,
                expiry: "2024-12-20",
                features: ["inverter", "frost-free", "smart"],
                energyRating: 3,
                capacity: "260L",
                tags: ["refrigerator", "double-door", "inverter"]
            },
            {
                id: "APP002",
                title: "Voltas 1.5 Ton 5-Star Split AC",
                description: "Copper Condenser, 4-in-1 Adjustable Mode, Anti-Dust Filter, Self Diagnosis",
                currentPrice: 34999,
                originalPrice: 49999,
                discount: 30,
                category: "home-appliances",
                subcategory: "ac",
                brand: "voltas",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/voltas-ac",
                image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.4,
                reviews: 2890,
                expiry: "2024-12-31",
                features: ["inverter", "smart", "auto-clean"],
                energyRating: 5,
                capacity: "1.5 Ton",
                tags: ["ac", "split-ac", "5-star"]
            },
            {
                id: "APP003",
                title: "Samsung 7 kg Fully Automatic Washing Machine",
                description: "Diamond Drum, Digital Inverter, Eco Bubble Technology, 15 Wash Programs",
                currentPrice: 19999,
                originalPrice: 29999,
                discount: 33,
                category: "home-appliances",
                subcategory: "washing-machines",
                brand: "samsung",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/samsung-wm",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.3,
                reviews: 2345,
                expiry: "2024-12-25",
                features: ["inverter", "auto-clean", "child-lock"],
                energyRating: 4,
                capacity: "7 kg",
                tags: ["washing-machine", "fully-automatic", "front-load"]
            },
            {
                id: "APP004",
                title: "Prestige 20L Convection Microwave Oven",
                description: "1100W, 21 Auto Cook Menus, Child Lock, 10 Power Levels, Ceramic Enamel Interior",
                currentPrice: 6999,
                originalPrice: 9999,
                discount: 30,
                category: "home-appliances",
                subcategory: "microwaves",
                brand: "prestige",
                store: "flipkart",
                affiliateLink: "https://dl.flipkart.com/s/prestige-microwave",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                reviews: 4567,
                expiry: "2024-12-28",
                features: ["convection", "child-lock", "auto-cook"],
                energyRating: 3,
                capacity: "20L",
                tags: ["microwave", "oven", "kitchen"]
            },
            {
                id: "APP005",
                title: "Kent Grand Plus RO Water Purifier",
                description: "8L Storage, TDS Controller, UV LED, Smart Alert, Mineral Retention Technology",
                currentPrice: 16999,
                originalPrice: 22999,
                discount: 26,
                category: "home-appliances",
                subcategory: "water-purifiers",
                brand: "kent",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/kent-ro",
                image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                reviews: 1890,
                expiry: "2024-12-30",
                features: ["uv", "mineral-retention", "smart-alert"],
                energyRating: 4,
                capacity: "8L",
                tags: ["water-purifier", "ro", "storage"]
            },
            {
                id: "APP006",
                title: "Prestige Iris 750W Mixer Grinder",
                description: "3 Jars, 3 Speed Control, Unbreakable Polycarbonate Dome, 2 Years Warranty",
                currentPrice: 2499,
                originalPrice: 3999,
                discount: 38,
                category: "home-appliances",
                subcategory: "kitchen",
                brand: "prestige",
                store: "amazon",
                affiliateLink: "https://amazon.in/dp/prestige-mixer",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                rating: 4.4,
                reviews: 1345,
                expiry: "2024-12-30",
                features: ["3-jars", "unbreakable"],
                energyRating: 3,
                capacity: "750W",
                tags: ["mixer", "grinder", "kitchen"]
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
            
            // Appliance type filter
            if (this.currentFilters.applianceType.length > 0 && deal.subcategory) {
                if (!this.currentFilters.applianceType.includes(deal.subcategory)) {
                    return false;
                }
            }
            
            // Brand filter
            if (this.currentFilters.brands.length > 0 && deal.brand) {
                if (!this.currentFilters.brands.includes(deal.brand)) {
                    return false;
                }
            }
            
            // Energy rating filter
            if (this.currentFilters.energyRating && deal.energyRating) {
                if (deal.energyRating < parseInt(this.currentFilters.energyRating)) {
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
            
            // Fridge capacity filter
            if (this.currentFilters.fridgeCapacity && deal.subcategory === 'refrigerators' && deal.capacity) {
                const capacityNum = parseInt(deal.capacity);
                const filterNum = parseInt(this.currentFilters.fridgeCapacity);
                if (filterNum === 200 && capacityNum > 200) return false;
                if (filterNum === 300 && (capacityNum <= 200 || capacityNum > 300)) return false;
                if (filterNum === 400 && (capacityNum <= 300 || capacityNum > 400)) return false;
                if (filterNum === 500 && capacityNum <= 400) return false;
            }
            
            // AC capacity filter
            if (this.currentFilters.acCapacity && deal.subcategory === 'ac' && deal.capacity) {
                if (!deal.capacity.includes(this.currentFilters.acCapacity)) {
                    return false;
                }
            }
            
            // Appliance category filter
            if (this.currentFilters.applianceCategory && deal.subcategory) {
                if (deal.subcategory !== this.currentFilters.applianceCategory) {
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
            case 'energy':
                return [...deals].sort((a, b) => b.energyRating - a.energyRating);
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
        
        // Generate energy rating badge
        const energyBadge = deal.energyRating ? 
            `<span class="deal-badge energy">${deal.energyRating} Star</span>` : '';
        
        // Generate feature badges
        const featureBadges = deal.features ? deal.features.map(feature => 
            `<span class="deal-badge feature">${this.getFeatureLabel(feature)}</span>`
        ).slice(0, 2).join('') : '';
        
        card.innerHTML = `
            <div class="deal-badges">
                <span class="deal-badge discount">${deal.discount}% OFF</span>
                <span class="deal-badge store ${deal.store}">
                    ${this.getStoreIcon(deal.store)}
                </span>
                ${energyBadge}
                ${featureBadges}
            </div>
            
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" loading="lazy">
                <button class="wishlist-btn" data-deal-id="${deal.id}">
                    <i class="far fa-heart"></i>
                </button>
                <button class="emi-calc-btn" data-deal-price="${deal.currentPrice}" data-deal-title="${deal.title}">
                    <i class="fas fa-calculator"></i> EMI
                </button>
            </div>
            
            <div class="deal-content">
                <div class="deal-header">
                    <h3 class="deal-title">${deal.title}</h3>
                    <span class="deal-brand">${deal.brand?.toUpperCase() || ''}</span>
                </div>
                
                <p class="deal-description">${deal.description}</p>
                
                <div class="appliance-specs">
                    <div class="capacity-info">
                        ${deal.capacity ? `<span><i class="fas fa-weight"></i> ${deal.capacity}</span>` : ''}
                        ${deal.energyRating ? `<span><i class="fas fa-star"></i> ${deal.energyRating} Star Energy</span>` : ''}
                        <span><i class="fas fa-clock"></i> ${this.getWarrantyPeriod(deal.subcategory)}</span>
                    </div>
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
                    <span class="deal-features">
                        <i class="fas fa-bolt"></i> ${deal.features?.slice(0, 2).join(', ') || 'Standard'}
                    </span>
                </div>
                
                <div class="deal-actions">
                    <a href="${deal.affiliateLink}" 
                       class="deal-btn primary" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       data-affiliate="true"
                       data-deal-id="${deal.id}"
                       data-track="appliances_deal_click">
                        View Deal <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="deal-btn secondary install-btn" data-deal-id="${deal.id}">
                        <i class="fas fa-tools"></i> Install
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
            'reliance': '<i class="fas fa-store"></i>'
        };
        return icons[store] || '<i class="fas fa-store"></i>';
    }

    getFeatureLabel(feature) {
        const labels = {
            'inverter': 'Inverter',
            'frost-free': 'Frost Free',
            'smart': 'Smart',
            'auto-clean': 'Auto Clean',
            'child-lock': 'Child Lock',
            'convection': 'Convection',
            'auto-cook': 'Auto Cook',
            'uv': 'UV',
            'mineral-retention': 'Mineral',
            'smart-alert': 'Smart Alert',
            '3-jars': '3 Jars',
            'unbreakable': 'Unbreakable'
        };
        return labels[feature] || feature;
    }

    getWarrantyPeriod(category) {
        const warranties = {
            'refrigerators': '10 Years Compressor',
            'ac': '5 Years Compressor',
            'washing-machines': '2 Years Motor',
            'microwaves': '2 Years',
            'water-purifiers': '1 Year',
            'kitchen': '2 Years'
        };
        return warranties[category] || '1 Year Warranty';
    }

    getCategoryLabel(category) {
        const labels = {
            'refrigerators': 'Refrigerator',
            'ac': 'Air Conditioner',
            'washing-machines': 'Washing Machine',
            'microwaves': 'Microwave',
            'water-purifiers': 'Water Purifier',
            'kitchen': 'Kitchen Appliance'
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
        
        // Setup EMI buttons for new cards
        this.setupEMIButtons();
    }

    setupEventListeners() {
        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadAppliancesDeals();
                
                // Track load more
                if (window.analytics) {
                    window.analytics.trackEvent('load_more_appliances', {
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
                this.loadAppliancesDeals();
                this.filterPanel.classList.remove('active');
                
                // Track filter apply
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_filters_applied', this.currentFilters);
                }
            });
        }
        
        // Clear filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
                this.loadAppliancesDeals();
                
                // Track filter clear
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_filters_cleared');
                }
            });
        }
        
        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.currentPage = 1;
                this.loadAppliancesDeals();
                
                // Track sort change
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_sort_changed', {
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
                    window.analytics.trackEvent('appliances_view_changed', {
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
            
            if (e.target.closest('.emi-calc-btn')) {
                this.calculateProductEMI(e.target.closest('.emi-calc-btn'));
            }
            
            if (e.target.closest('.install-btn')) {
                this.showInstallationModal(e.target.closest('.install-btn'));
            }
        });
        
        // Modal close
        if (this.emiModalClose) {
            this.emiModalClose.addEventListener('click', () => {
                this.emiModal.classList.remove('active');
            });
        }
        
        // Close modal on outside click
        this.emiModal.addEventListener('click', (e) => {
            if (e.target === this.emiModal) {
                this.emiModal.classList.remove('active');
            }
        });
    }

    setupApplianceCategoryFilters() {
        this.applianceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const applianceCategory = card.dataset.category;
                this.currentFilters.applianceCategory = applianceCategory;
                this.currentPage = 1;
                this.loadAppliancesDeals();
                
                // Highlight active card
                this.applianceCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Track appliance category click
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_category_click', {
                        category: applianceCategory
                    });
                }
            });
        });
    }

    setupEMICalculator() {
        if (this.calculateEMI) {
            this.calculateEMI.addEventListener('click', () => {
                this.calculateEMIFromInputs();
            });
        }
        
        // Setup initial calculation
        this.calculateEMIFromInputs();
    }

    setupEMIButtons() {
        const emiButtons = document.querySelectorAll('.emi-calc-btn');
        emiButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const price = button.dataset.dealPrice;
                const title = button.dataset.dealTitle;
                
                // Set the price in calculator
                document.getElementById('productPrice').value = price;
                
                // Update EMI calculation
                this.calculateEMIFromInputs();
                
                // Scroll to calculator
                document.querySelector('.emi-calculator-section').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Track EMI button click
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_emi_calc', {
                        product: title,
                        price: price
                    });
                }
            });
        });
    }

    setupGuideTabs() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Remove active class from all tabs
                this.tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab
                button.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
                
                // Track tab switch
                if (window.analytics) {
                    window.analytics.trackEvent('appliances_guide_tab', {
                        tab: tabId
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
        
        // Energy rating stars
        const starRatings = document.querySelectorAll('.star-rating');
        starRatings.forEach(rating => {
            rating.addEventListener('click', () => {
                starRatings.forEach(r => r.classList.remove('active'));
                rating.classList.add('active');
            });
        });
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
        
        // Appliance type
        const typeCheckboxes = document.querySelectorAll('input[name="appliance-type"]:checked');
        this.currentFilters.applianceType = Array.from(typeCheckboxes).map(cb => cb.value);
        
        // Brands
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        this.currentFilters.brands = Array.from(brandCheckboxes).map(cb => cb.value);
        
        // Energy rating
        const activeStarRating = document.querySelector('.star-rating.active');
        if (activeStarRating) {
            this.currentFilters.energyRating = activeStarRating.dataset.rating;
        }
        
        // Features
        const featureCheckboxes = document.querySelectorAll('input[name="feature"]:checked');
        this.currentFilters.features = Array.from(featureCheckboxes).map(cb => cb.value);
        
        // Fridge capacity
        const fridgeCapacity = document.getElementById('fridgeCapacity');
        if (fridgeCapacity) {
            this.currentFilters.fridgeCapacity = fridgeCapacity.value;
        }
        
        // AC capacity
        const acCapacity = document.getElementById('acCapacity');
        if (acCapacity) {
            this.currentFilters.acCapacity = acCapacity.value;
        }
        
        // Clear appliance category filter when using other filters
        this.currentFilters.applianceCategory = null;
        this.applianceCards.forEach(c => c.classList.remove('active'));
    }

    resetFilters() {
        this.currentFilters = this.getDefaultFilters();
        
        // Reset UI elements
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.querySelectorAll('select').forEach(select => {
            select.value = '';
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
        
        // Reset energy rating stars
        document.querySelectorAll('.star-rating').forEach(rating => {
            rating.classList.remove('active');
        });
        
        this.sortSelect.value = 'newest';
        this.applianceCards.forEach(c => c.classList.remove('active'));
    }

    toggleWishlist(button) {
        const dealId = button.dataset.dealId;
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Track wishlist add
            if (window.analytics) {
                window.analytics.trackEvent('appliances_wishlist_add', { dealId });
            }
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        this.showToast(icon.classList.contains('fas') ? 'Added to wishlist' : 'Removed from wishlist');
    }

    calculateProductEMI(button) {
        const price = button.dataset.dealPrice;
        const title = button.dataset.dealTitle;
        
        // Show detailed EMI modal
        this.showDetailedEMI(price, title);
        
        // Track EMI calculation
        if (window.analytics) {
            window.analytics.trackEvent('appliances_emi_detail', {
                product: title,
                price: price
            });
        }
    }

    showInstallationModal(button) {
        const dealId = button.dataset.dealId;
        
        this.showToast('Installation service available. Contact our partner for details.');
        
        // Track installation inquiry
        if (window.analytics) {
            window.analytics.trackEvent('appliances_install_inquiry', { dealId });
        }
    }

    calculateEMIFromInputs() {
        const price = parseInt(document.getElementById('productPrice').value) || 30000;
        const downPayment = parseInt(document.getElementById('downPayment').value) || 5000;
        const tenure = parseInt(document.getElementById('tenure').value) || 6;
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 14;
        
        // Calculate EMI
        const principal = price - downPayment;
        const monthlyInterest = interestRate / 12 / 100;
        const emi = principal * monthlyInterest * Math.pow(1 + monthlyInterest, tenure) / 
                   (Math.pow(1 + monthlyInterest, tenure) - 1);
        
        const totalInterest = (emi * tenure) - principal;
        const totalAmount = principal + totalInterest;
        const savings = totalInterest;
        
        // Update display
        document.getElementById('emiAmount').textContent = `₹${Math.round(emi).toLocaleString('en-IN')}/month`;
        document.getElementById('principalAmount').textContent = `₹${principal.toLocaleString('en-IN')}`;
        document.getElementById('interestAmount').textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
        document.getElementById('totalAmount').textContent = `₹${Math.round(totalAmount).toLocaleString('en-IN')}`;
        document.getElementById('savingsAmount').textContent = `₹${Math.round(savings).toLocaleString('en-IN')}`;
    }

    showDetailedEMI(price, title) {
        const modalBody = document.getElementById('emiModalBody');
        
        modalBody.innerHTML = `
            <div class="detailed-emi">
                <h4>EMI Options for ${title}</h4>
                <p class="product-price">Price: ₹${parseInt(price).toLocaleString('en-IN')}</p>
                
                <div class="emi-options">
                    <div class="emi-option">
                        <span class="tenure">3 Months</span>
                        <span class="emi-amount">₹${Math.round(price/3).toLocaleString('en-IN')}/month</span>
                        <span class="interest">Interest: 12%</span>
                    </div>
                    <div class="emi-option">
                        <span class="tenure">6 Months</span>
                        <span class="emi-amount">₹${Math.round((price*1.14)/6).toLocaleString('en-IN')}/month</span>
                        <span class="interest">Interest: 14%</span>
                    </div>
                    <div class="emi-option">
                        <span class="tenure">9 Months</span>
                        <span class="emi-amount">₹${Math.round((price*1.16)/9).toLocaleString('en-IN')}/month</span>
                        <span class="interest">Interest: 16%</span>
                    </div>
                    <div class="emi-option">
                        <span class="tenure">12 Months</span>
                        <span class="emi-amount">₹${Math.round((price*1.18)/12).toLocaleString('en-IN')}/month</span>
                        <span class="interest">Interest: 18%</span>
                    </div>
                </div>
                
                <div class="emi-tips">
                    <h5>EMI Tips:</h5>
                    <ul>
                        <li>Down payment reduces EMI amount significantly</li>
                        <li>Shorter tenure = Less interest paid</li>
                        <li>Check bank offers for 0% EMI</li>
                        <li>Compare across multiple banks</li>
                    </ul>
                </div>
                
                <button class="btn-primary" onclick="window.homeAppliancesCategory.emiModal.classList.remove('active')">
                    Close
                </button>
            </div>
        `;
        
        this.emiModal.classList.add('active');
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
            loadMoreInfo.textContent = `Showing ${Math.min(count, this.currentPage * this.dealsPerPage)} of ${count} appliance deals`;
        }
    }

    updateLoadMoreButton(totalFiltered) {
        if (!this.loadMoreBtn) return;
        
        const loadedCount = this.currentPage * this.dealsPerPage;
        
        if (loadedCount >= totalFiltered) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
            this.loadMoreBtn.innerHTML = `<i class="fas fa-spinner"></i> Load More Appliances (${totalFiltered - loadedCount} more)`;
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
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner"></i> Load More Appliances';
            this.loadMoreBtn.disabled = false;
        }
    }

    showNoDealsMessage() {
        this.dealsContainer.innerHTML = `
            <div class="no-deals-message">
                <i class="fas fa-search"></i>
                <h3>No appliance deals found</h3>
                <p>Try adjusting your filters or check back later for new deals!</p>
                <button class="btn-primary" id="resetFiltersBtn">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
            this.resetFilters();
            this.loadAppliancesDeals();
        });
    }

    showErrorState() {
        this.dealsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load appliance deals</h3>
                <p>Please check your internet connection and try again.</p>
                <button class="btn-primary" id="retryLoading">Retry</button>
            </div>
        `;
        
        document.getElementById('retryLoading')?.addEventListener('click', () => {
            this.loadAppliancesDeals();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const homeAppliancesCategory = new HomeAppliancesCategory();
    window.homeAppliancesCategory = homeAppliancesCategory;
});