/**
 * navigation.js - FIXED for GetUpDeals
 * Simple, reliable navigation with mobile menu and smooth scrolling
 */

class Navigation {
    constructor() {
        this.isMobileMenuOpen = false;
        this.isScrolled = false;
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;
        
        // Elements - FIXED: Use correct selectors
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        this.mobileNavClose = document.getElementById('mobileNavClose');
        this.mainNav = document.getElementById('mainNav');
        this.backToTopBtn = document.getElementById('backToTop');
        
        // Search forms - FIXED: Get correct forms
        this.searchForm = document.querySelector('.search-form');
        this.mobileSearchForm = document.querySelector('.mobile-search-form');
        
        // Navigation dropdowns
        this.navDropdowns = document.querySelectorAll('.nav-dropdown');
        this.mobileNavDropdowns = document.querySelectorAll('.mobile-nav-dropdown');
        
        this.init();
    }
    
    /**
     * Initialize navigation
     */
    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupSmoothScroll();
        this.setupDropdowns();
        
        // Initial state
        this.updateHeaderState();
        this.checkScrollPosition();
        this.updateActiveNavLink();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => this.toggleMobileMenu(e));
        }
        
        // Mobile menu close
        if (this.mobileNavClose) {
            this.mobileNavClose.addEventListener('click', (e) => this.closeMobileMenu(e));
        }
        
        // Close mobile menu when clicking outside - FIXED with delay
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                this.mobileNav && 
                !this.mobileNav.contains(e.target) && 
                e.target !== this.mobileMenuToggle) {
                setTimeout(() => {
                    this.closeMobileMenu();
                }, 10);
            }
        });
        
        // Scroll events
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Resize events
        window.addEventListener('resize', () => this.handleResize());
        
        // Back to top button - FIXED
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', (e) => this.scrollToTop(e));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Search forms - FIXED
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => this.handleSearch(e, false));
        }
        
        if (this.mobileSearchForm) {
            this.mobileSearchForm.addEventListener('submit', (e) => this.handleSearch(e, true));
        }
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            this.mobileMenuToggle.setAttribute('aria-controls', 'mobileNav');
        }
        
        // Skip to content link behavior
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = skipLink.getAttribute('href');
                if (targetId) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.setAttribute('tabindex', '-1');
                        target.focus();
                        setTimeout(() => target.removeAttribute('tabindex'), 1000);
                    }
                }
            });
        }
    }
    
    /**
     * Setup smooth scroll behavior - FIXED: Only handles anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if it's just "#" or external link
                if (href === '#' || href.includes('://')) return;
                
                // Get target element
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    this.smoothScrollTo(target);
                    
                    // Close mobile menu if open
                    if (this.isMobileMenuOpen) {
                        this.closeMobileMenu();
                    }
                    
                    // Update URL without page reload
                    if (history.pushState && href.startsWith('#')) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }
    
    /**
     * Setup dropdown menus
     */
    setupDropdowns() {
        // Desktop dropdowns
        this.navDropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Mouse events
                dropdown.addEventListener('mouseenter', () => this.openDropdown(dropdown));
                dropdown.addEventListener('mouseleave', () => this.closeDropdown(dropdown));
                
                // Keyboard events
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    } else if (e.key === 'Escape') {
                        this.closeDropdown(dropdown);
                    }
                });
            }
        });
        
        // Mobile dropdowns
        this.mobileNavDropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.mobile-nav-link');
            const menu = dropdown.querySelector('.mobile-dropdown-menu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMobileDropdown(dropdown);
                });
            }
        });
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header show/hide on scroll
        const header = document.querySelector('.main-header');
        if (header) {
            if (scrollTop > this.scrollThreshold) {
                if (!this.isScrolled) {
                    header.classList.add('scrolled');
                    this.isScrolled = true;
                }
                
                // Hide header on scroll down, show on scroll up
                if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                    header.classList.add('header-hidden');
                } else {
                    header.classList.remove('header-hidden');
                }
            } else {
                if (this.isScrolled) {
                    header.classList.remove('scrolled');
                    this.isScrolled = false;
                }
                header.classList.remove('header-hidden');
            }
        }
        
        this.lastScrollTop = scrollTop;
        
        // Back to top button
        this.updateBackToTopButton(scrollTop);
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Close mobile menu if resizing to desktop
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        this.updateHeaderState();
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Skip to content with keyboard shortcut
        if (e.key === 's' && e.altKey) {
            e.preventDefault();
            const skipLink = document.querySelector('.skip-to-content');
            if (skipLink) skipLink.focus();
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(e) {
        if (e) e.preventDefault();
        
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.isMobileMenuOpen = true;
        if (this.mobileNav) {
            this.mobileNav.classList.add('active');
        }
        
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
            this.mobileMenuToggle.classList.add('active');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        if (this.mobileNav) {
            this.mobileNav.classList.remove('active');
        }
        
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            this.mobileMenuToggle.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Close all mobile dropdowns
        this.mobileNavDropdowns.forEach(dropdown => {
            this.closeMobileDropdown(dropdown);
        });
        
        // Return focus to menu toggle
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.focus();
        }
    }
    
    /**
     * Update header state
     */
    updateHeaderState() {
        const header = document.querySelector('.main-header');
        if (!header) return;
        
        if (window.innerWidth < 768) {
            header.classList.add('mobile-header');
        } else {
            header.classList.remove('mobile-header');
        }
    }
    
    /**
     * Check scroll position on load
     */
    checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.main-header');
        
        if (scrollTop > this.scrollThreshold && header) {
            header.classList.add('scrolled');
            this.isScrolled = true;
        }
        
        this.updateBackToTopButton(scrollTop);
    }
    
    /**
     * Update back to top button visibility - FIXED
     */
    updateBackToTopButton(scrollTop) {
        if (!this.backToTopBtn) return;
        
        if (scrollTop > 300) {
            this.backToTopBtn.classList.add('visible');
        } else {
            this.backToTopBtn.classList.remove('visible');
        }
    }
    
    /**
     * Scroll to top smoothly - FIXED
     */
    scrollToTop(e) {
        if (e) e.preventDefault();
        
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const duration = 600;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
            const scrollY = startPosition * (1 - easeOutCubic(progress));
            
            window.scrollTo(0, scrollY);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                window.scrollTo(0, 0);
                
                // Focus management for accessibility
                const mainContent = document.querySelector('main, #main-content');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                    setTimeout(() => mainContent.removeAttribute('tabindex'), 1000);
                }
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    /**
     * Smooth scroll to element
     */
    smoothScrollTo(element, duration = 600) {
        const start = window.pageYOffset || document.documentElement.scrollTop;
        const target = element.getBoundingClientRect().top + start;
        const distance = target - start;
        const startTime = performance.now();
        
        const animation = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const scrollY = start + distance * easeInOutQuad(progress);
            
            window.scrollTo(0, scrollY);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    /**
     * Handle search form submission
     */
    handleSearch(e, isMobile = false) {
        e.preventDefault();
        
        const form = isMobile ? this.mobileSearchForm : this.searchForm;
        if (!form) return;
        
        const input = form.querySelector('input[type="search"]');
        if (!input) return;
        
        const query = input.value.trim();
        
        if (!query) {
            // Show error
            input.focus();
            return;
        }
        
        // Redirect to search results page
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
    
    /**
     * Open dropdown
     */
    openDropdown(dropdown) {
        dropdown.classList.add('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', 'false');
        }
    }
    
    /**
     * Close dropdown
     */
    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', 'true');
        }
    }
    
    /**
     * Toggle dropdown
     */
    toggleDropdown(dropdown) {
        if (dropdown.classList.contains('open')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }
    
    /**
     * Toggle mobile dropdown
     */
    toggleMobileDropdown(dropdown) {
        const menu = dropdown.querySelector('.mobile-dropdown-menu');
        const toggle = dropdown.querySelector('.mobile-nav-link');
        
        if (menu) {
            menu.classList.toggle('active');
            const isExpanded = menu.classList.contains('active');
            
            if (toggle) {
                toggle.setAttribute('aria-expanded', isExpanded.toString());
            }
            
            // Animate height
            if (isExpanded) {
                menu.style.maxHeight = `${menu.scrollHeight}px`;
            } else {
                menu.style.maxHeight = '0';
            }
        }
    }
    
    /**
     * Close mobile dropdown
     */
    closeMobileDropdown(dropdown) {
        const menu = dropdown.querySelector('.mobile-dropdown-menu');
        const toggle = dropdown.querySelector('.mobile-nav-link');
        
        if (menu) {
            menu.classList.remove('active');
            menu.style.maxHeight = '0';
            
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    }
    
    /**
     * Update active nav link based on current page - FIXED
     */
    updateActiveNavLink() {
        const currentPath = window.location.pathname;
        
        // Desktop navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Clean href
            let cleanHref = href;
            if (cleanHref.startsWith('./')) {
                cleanHref = cleanHref.substring(1);
            }
            
            // Remove trailing slash for comparison
            const cleanPath = currentPath.replace(/\/$/, '');
            const cleanHrefPath = cleanHref.replace(/\/$/, '');
            
            // Check if current path matches
            if (cleanPath === cleanHrefPath || 
                (cleanPath === '' && cleanHrefPath === '') ||
                (cleanHrefPath && cleanPath.startsWith(cleanHrefPath))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mobile navigation
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Clean href
            let cleanHref = href;
            if (cleanHref.startsWith('./')) {
                cleanHref = cleanHref.substring(1);
            }
            
            // Remove trailing slash for comparison
            const cleanPath = currentPath.replace(/\/$/, '');
            const cleanHrefPath = cleanHref.replace(/\/$/, '');
            
            // Check if current path matches
            if (cleanPath === cleanHrefPath || 
                (cleanPath === '' && cleanHrefPath === '') ||
                (cleanHrefPath && cleanPath.startsWith(cleanHrefPath))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Reset navigation to initial state
     */
    reset() {
        this.closeMobileMenu();
        
        // Close all dropdowns
        this.navDropdowns.forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
        
        this.mobileNavDropdowns.forEach(dropdown => {
            this.closeMobileDropdown(dropdown);
        });
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// REMOVED: The problematic global click handler that was breaking navigation
// Keep only smooth scroll for anchor links

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}