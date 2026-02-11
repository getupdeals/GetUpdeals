/**
 * Blog Filter & Search Functionality
 * File: assets/js/blog-filter.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
    const postCards = document.querySelectorAll('.post-card');
    const featuredPostCards = document.querySelectorAll('.featured-post-card');
    const sortSelect = document.getElementById('sortSelect');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const blogSearch = document.getElementById('blogSearch');
    const searchBtn = blogSearch ? blogSearch.nextElementSibling : null;
    
    // State variables
    let visiblePosts = 8;
    const totalPosts = postCards.length;
    let currentCategory = 'all';
    let currentSort = 'newest';
    let currentSearchTerm = '';
    
    // Initialize blog functionality
    initBlog();
    
    /**
     * Initialize blog features
     */
    function initBlog() {
        // Initialize load more button
        initLoadMore();
        
        // Initialize search functionality
        initSearch();
        
        // Initialize category filtering
        initCategoryFilter();
        
        // Initialize sort functionality
        initSort();
        
        // Add keyboard shortcuts
        initKeyboardShortcuts();
        
        // Add URL parameter handling
        initURLParams();
    }
    
    /**
     * Initialize load more functionality
     */
    function initLoadMore() {
        if (!loadMoreBtn) return;
        
        // Hide extra posts initially
        postCards.forEach((card, index) => {
            if (index >= visiblePosts) {
                card.style.display = 'none';
            }
        });
        
        // Update load more button visibility
        updateLoadMoreButton();
        
        // Load more button click event
        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadMorePosts();
        });
    }
    
    /**
     * Load more posts when button is clicked
     */
    function loadMorePosts() {
        visiblePosts += 4;
        
        // Show next set of posts
        postCards.forEach((card, index) => {
            if (index < visiblePosts && isPostVisible(card)) {
                card.style.display = 'block';
                
                // Add animation for newly shown posts
                if (index >= visiblePosts - 4) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                }
            }
        });
        
        // Update load more button
        updateLoadMoreButton();
        
        // Scroll to newly loaded posts
        scrollToNewPosts();
    }
    
    /**
     * Update load more button visibility
     */
    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;
        
        const visiblePostCount = Array.from(postCards).filter(card => 
            card.style.display !== 'none' && isPostVisible(card)
        ).length;
        
        if (visiblePostCount >= getTotalVisiblePosts()) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'flex';
        }
    }
    
    /**
     * Get total number of visible posts based on filters
     */
    function getTotalVisiblePosts() {
        return Array.from(postCards).filter(card => 
            isPostVisible(card, true)
        ).length;
    }
    
    /**
     * Initialize search functionality
     */
    function initSearch() {
        if (!blogSearch || !searchBtn) return;
        
        // Search button click event
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performSearch();
        });
        
        // Enter key in search input
        blogSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Clear search on escape key
        blogSearch.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && blogSearch.value.trim()) {
                e.preventDefault();
                clearSearch();
            }
        });
        
        // Live search as user types (with debounce)
        let searchTimeout;
        blogSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            // Only perform live search after user stops typing for 500ms
            if (blogSearch.value.length >= 3 || blogSearch.value.length === 0) {
                searchTimeout = setTimeout(() => {
                    performSearch();
                }, 500);
            }
        });
    }
    
    /**
     * Perform search based on input
     */
    function performSearch() {
        currentSearchTerm = blogSearch.value.toLowerCase().trim();
        
        if (!currentSearchTerm) {
            clearSearch();
            return;
        }
        
        // Store current state for URL
        updateURLParams();
        
        let foundPosts = 0;
        
        // Search in post cards
        postCards.forEach(card => {
            const title = card.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.post-category').textContent.toLowerCase();
            
            if (title.includes(currentSearchTerm) || 
                excerpt.includes(currentSearchTerm) || 
                category.includes(currentSearchTerm)) {
                card.style.display = 'block';
                foundPosts++;
                
                // Highlight search term
                highlightSearchTerm(card, currentSearchTerm);
            } else {
                card.style.display = 'none';
                removeHighlight(card);
            }
        });
        
        // Search in featured posts
        featuredPostCards.forEach(card => {
            const title = card.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.post-category').textContent.toLowerCase();
            
            if (title.includes(currentSearchTerm) || 
                excerpt.includes(currentSearchTerm) || 
                category.includes(currentSearchTerm)) {
                card.style.display = 'block';
                foundPosts++;
                
                // Highlight search term
                highlightSearchTerm(card, currentSearchTerm);
            } else {
                card.style.display = 'none';
                removeHighlight(card);
            }
        });
        
        // Show/hide no results message
        showNoResultsMessage(foundPosts === 0);
        
        // Update load more button
        updateLoadMoreButton();
        
        // Scroll to top of results
        if (foundPosts > 0) {
            window.scrollTo({
                top: document.querySelector('.all-posts-section').offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Highlight search terms in post content
     */
    function highlightSearchTerm(card, searchTerm) {
        const titleElement = card.querySelector('.post-title');
        const excerptElement = card.querySelector('.post-excerpt');
        
        const titleHtml = titleElement.textContent;
        const excerptHtml = excerptElement.textContent;
        
        const highlightedTitle = titleHtml.replace(
            new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'),
            '<mark class="search-highlight">$1</mark>'
        );
        
        const highlightedExcerpt = excerptHtml.replace(
            new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'),
            '<mark class="search-highlight">$1</mark>'
        );
        
        titleElement.innerHTML = highlightedTitle;
        excerptElement.innerHTML = highlightedExcerpt;
    }
    
    /**
     * Remove highlight from posts
     */
    function removeHighlight(card) {
        const titleElement = card.querySelector('.post-title');
        const excerptElement = card.querySelector('.post-excerpt');
        
        if (titleElement.querySelector('mark')) {
            titleElement.innerHTML = titleElement.textContent;
        }
        
        if (excerptElement.querySelector('mark')) {
            excerptElement.innerHTML = excerptElement.textContent;
        }
    }
    
    /**
     * Escape special characters for regex
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Clear search results
     */
    function clearSearch() {
        blogSearch.value = '';
        currentSearchTerm = '';
        
        // Reset all posts visibility
        applyFilters();
        
        // Remove highlights
        postCards.forEach(removeHighlight);
        featuredPostCards.forEach(removeHighlight);
        
        // Hide no results message
        showNoResultsMessage(false);
        
        // Update URL
        updateURLParams();
    }
    
    /**
     * Show/hide no results message
     */
    function showNoResultsMessage(show) {
        const postsGrid = document.querySelector('.posts-grid');
        let noResultsMsg = postsGrid.querySelector('.no-results');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>No articles found for "${currentSearchTerm}"</h3>
                    <p>Try searching with different keywords or browse by category</p>
                    <button class="clear-search-btn">Clear Search</button>
                </div>
            `;
            postsGrid.appendChild(noResultsMsg);
            
            // Clear search button event
            const clearBtn = noResultsMsg.querySelector('.clear-search-btn');
            clearBtn.addEventListener('click', function() {
                clearSearch();
            });
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }
    
    /**
     * Initialize category filtering
     */
    function initCategoryFilter() {
        categoryFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryFilterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                currentCategory = this.dataset.category;
                
                // Apply filters
                applyFilters();
                
                // Update URL
                updateURLParams();
                
                // Scroll to top of posts
                scrollToPostsSection();
            });
        });
    }
    
    /**
     * Initialize sort functionality
     */
    function initSort() {
        if (!sortSelect) return;
        
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            
            // Apply sort
            sortPosts();
            
            // Update URL
            updateURLParams();
        });
    }
    
    /**
     * Apply all active filters (category + search)
     */
    function applyFilters() {
        let visibleCount = 0;
        
        postCards.forEach(card => {
            const shouldShow = isPostVisible(card);
            
            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
                
                // Show featured posts if they match filters
                const featuredCard = findFeaturedCard(card);
                if (featuredCard) {
                    featuredCard.style.display = 'block';
                }
            } else {
                card.style.display = 'none';
                
                // Hide corresponding featured post
                const featuredCard = findFeaturedCard(card);
                if (featuredCard) {
                    featuredCard.style.display = 'none';
                }
            }
        });
        
        // Show/hide no results message
        if (currentSearchTerm && visibleCount === 0) {
            showNoResultsMessage(true);
        } else {
            showNoResultsMessage(false);
        }
        
        // Reset visible posts count for load more
        visiblePosts = Math.min(8, visibleCount);
        
        // Update load more button
        updateLoadMoreButton();
        
        // Apply sort if needed
        if (currentSort !== 'newest') {
            sortPosts();
        }
    }
    
    /**
     * Check if a post should be visible based on filters
     */
    function isPostVisible(card, ignoreDisplay = false) {
        const isDisplayed = ignoreDisplay || card.style.display !== 'none';
        const matchesCategory = currentCategory === 'all' || 
                              card.dataset.category === currentCategory;
        
        let matchesSearch = true;
        if (currentSearchTerm) {
            const title = card.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.post-category').textContent.toLowerCase();
            
            matchesSearch = title.includes(currentSearchTerm) || 
                           excerpt.includes(currentSearchTerm) || 
                           category.includes(currentSearchTerm);
        }
        
        return isDisplayed && matchesCategory && matchesSearch;
    }
    
    /**
     * Find featured card corresponding to a regular post
     */
    function findFeaturedCard(regularCard) {
        const postTitle = regularCard.querySelector('.post-title').textContent;
        return Array.from(featuredPostCards).find(card => 
            card.querySelector('.post-title').textContent === postTitle
        );
    }
    
    /**
     * Sort posts based on current sort option
     */
    function sortPosts() {
        const postsContainer = document.querySelector('.posts-grid');
        const postsArray = Array.from(postCards).filter(card => 
            card.style.display !== 'none'
        );
        
        postsArray.sort((a, b) => {
            switch(currentSort) {
                case 'popular':
                    // Sort by popularity (using data-popularity attribute)
                    const popularityA = parseInt(a.dataset.popularity || 0);
                    const popularityB = parseInt(b.dataset.popularity || 0);
                    return popularityB - popularityA;
                    
                case 'oldest':
                    // Sort by date (oldest first)
                    const dateA = new Date(a.dataset.date || a.querySelector('.post-date').textContent);
                    const dateB = new Date(b.dataset.date || b.querySelector('.post-date').textContent);
                    return dateA - dateB;
                    
                case 'newest':
                default:
                    // Sort by date (newest first)
                    const dateNewA = new Date(a.dataset.date || a.querySelector('.post-date').textContent);
                    const dateNewB = new Date(b.dataset.date || b.querySelector('.post-date').textContent);
                    return dateNewB - dateNewA;
            }
        });
        
        // Re-append sorted posts with animation
        postsArray.forEach((post, index) => {
            setTimeout(() => {
                postsContainer.appendChild(post);
                post.style.opacity = '0';
                post.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    post.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    post.style.opacity = '1';
                    post.style.transform = 'translateY(0)';
                }, 10);
            }, index * 50); // Staggered animation
        });
    }
    
    /**
     * Scroll to posts section
     */
    function scrollToPostsSection() {
        const postsSection = document.querySelector('.all-posts-section');
        if (postsSection) {
            window.scrollTo({
                top: postsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Scroll to newly loaded posts
     */
    function scrollToNewPosts() {
        const lastVisiblePost = Array.from(postCards)
            .filter(card => card.style.display === 'block')
            .slice(-1)[0];
            
        if (lastVisiblePost) {
            lastVisiblePost.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }
    
    /**
     * Initialize URL parameter handling
     */
    function initURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Get category from URL
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const categoryBtn = Array.from(categoryFilterBtns).find(
                btn => btn.dataset.category === categoryParam
            );
            if (categoryBtn) {
                categoryBtn.click();
            }
        }
        
        // Get sort from URL
        const sortParam = urlParams.get('sort');
        if (sortParam && sortSelect) {
            sortSelect.value = sortParam;
            currentSort = sortParam;
            sortPosts();
        }
        
        // Get search from URL
        const searchParam = urlParams.get('search');
        if (searchParam && blogSearch) {
            blogSearch.value = searchParam;
            currentSearchTerm = searchParam;
            performSearch();
        }
    }
    
    /**
     * Update URL parameters based on current state
     */
    function updateURLParams() {
        const urlParams = new URLSearchParams();
        
        if (currentCategory !== 'all') {
            urlParams.set('category', currentCategory);
        }
        
        if (currentSort !== 'newest') {
            urlParams.set('sort', currentSort);
        }
        
        if (currentSearchTerm) {
            urlParams.set('search', currentSearchTerm);
        }
        
        const newUrl = urlParams.toString() ? 
            `${window.location.pathname}?${urlParams.toString()}` : 
            window.location.pathname;
            
        window.history.replaceState({}, '', newUrl);
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (blogSearch) {
                    blogSearch.focus();
                }
            }
            
            // Escape to clear search if focused
            if (e.key === 'Escape' && document.activeElement === blogSearch) {
                if (blogSearch.value.trim()) {
                    e.preventDefault();
                    clearSearch();
                }
            }
            
            // Number keys 1-6 for category filtering
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                const key = parseInt(e.key);
                if (key >= 1 && key <= 6 && categoryFilterBtns.length >= key) {
                    e.preventDefault();
                    categoryFilterBtns[key - 1].click();
                }
            }
        });
    }
    
    /**
     * Analytics tracking for blog interactions
     */
    function trackBlogInteraction(action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Blog',
                'event_label': label
            });
        }
        
        // Custom event for internal tracking
        const event = new CustomEvent('blogInteraction', {
            detail: { action, label }
        });
        document.dispatchEvent(event);
    }
    
    // Add CSS for search highlighting
    const style = document.createElement('style');
    style.textContent = `
        .search-highlight {
            background-color: #ffd700;
            color: #1e293b;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 600;
        }
        
        [data-theme="dark"] .search-highlight {
            background-color: #fbbf24;
            color: #1e293b;
        }
        
        .post-card, .featured-post-card {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Track initial page view
    trackBlogInteraction('page_view', 'blog_listing');
});