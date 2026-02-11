/**
 * Blog Post Functionality
 * File: assets/js/blog-post.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all blog post features
    initBlogPost();
    
    /**
     * Initialize all blog post functionality
     */
    function initBlogPost() {
        initTableOfContents();
        initFAQAccordion();
        initSaveArticle();
        initShareButtons();
        initCommentSystem();
        initProductComparison();
        initAffiliateTracking();
        initReadingProgress();
        initScrollToTop();
        initPrintFunctionality();
        initNewsletterSubscription();
        initRelatedPosts();
    }
    
    /**
     * Initialize Table of Contents with smooth scrolling
     */
    function initTableOfContents() {
        const tocLinks = document.querySelectorAll('.toc-link');
        const sections = document.querySelectorAll('.article-section');
        
        if (!tocLinks.length || !sections.length) return;
        
        // Create intersection observer for TOC highlighting
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -50% 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all TOC links
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active class to current section link
                    const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                        
                        // Scroll TOC container if needed
                        scrollTOCToActive(activeLink);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all sections
        sections.forEach(section => observer.observe(section));
        
        // Add smooth scrolling to TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Add smooth scroll
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, targetId);
                    
                    // Track TOC click
                    trackInteraction('toc_click', targetId.substring(1));
                }
            });
        });
        
        // Scroll TOC to keep active link visible
        function scrollTOCToActive(activeLink) {
            const tocContainer = document.querySelector('.table-of-contents');
            if (!tocContainer) return;
            
            const containerTop = tocContainer.getBoundingClientRect().top;
            const linkTop = activeLink.getBoundingClientRect().top;
            const containerHeight = tocContainer.clientHeight;
            const linkHeight = activeLink.clientHeight;
            
            // Calculate if link is outside viewport
            if (linkTop < containerTop || linkTop + linkHeight > containerTop + containerHeight) {
                activeLink.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    }
    
    /**
     * Initialize FAQ Accordion functionality
     */
    function initFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (!faqItems.length) return;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            // Set initial height for smooth animation
            answer.style.maxHeight = '0px';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.3s ease';
            
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        otherAnswer.style.maxHeight = '0px';
                    }
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    
                    // Track FAQ open
                    trackInteraction('faq_open', question.textContent.trim());
                } else {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0px';
                }
            });
        });
    }
    
    /**
     * Initialize Save Article functionality
     */
    function initSaveArticle() {
        const saveButtons = document.querySelectorAll('#saveArticle, #saveForLater, .btn-save');
        
        if (!saveButtons.length) return;
        
        // Check if article is already saved
        const articleId = window.location.pathname;
        const isSaved = localStorage.getItem(`saved_article_${articleId}`) === 'true';
        
        // Set initial state
        saveButtons.forEach(button => {
            if (isSaved) {
                button.classList.add('saved');
                button.innerHTML = button.innerHTML.replace('far', 'fas');
            }
            
            button.addEventListener('click', function() {
                const nowSaved = this.classList.contains('saved');
                
                if (nowSaved) {
                    // Remove from saved
                    this.classList.remove('saved');
                    updateSaveButtonIcon(this, false);
                    localStorage.removeItem(`saved_article_${articleId}`);
                    showNotification('Article removed from saved items', 'info');
                    
                    trackInteraction('article_unsave', articleId);
                } else {
                    // Add to saved
                    this.classList.add('saved');
                    updateSaveButtonIcon(this, true);
                    localStorage.setItem(`saved_article_${articleId}`, 'true');
                    showNotification('Article saved for later reading', 'success');
                    
                    trackInteraction('article_save', articleId);
                }
            });
        });
        
        function updateSaveButtonIcon(button, isSaved) {
            const icon = button.querySelector('i');
            if (icon) {
                if (isSaved) {
                    icon.className = icon.className.replace('far', 'fas');
                } else {
                    icon.className = icon.className.replace('fas', 'far');
                }
            }
        }
    }
    
    /**
     * Initialize Share Buttons functionality
     */
    function initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        if (!shareButtons.length) return;
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = this.classList[1]; // facebook, twitter, etc.
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                const text = encodeURIComponent(document.querySelector('meta[name="description"]')?.content || '');
                
                let shareUrl = '';
                const windowOptions = 'width=600,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes';
                
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
                        break;
                    case 'pinterest':
                        const image = encodeURIComponent(document.querySelector('meta[property="og:image"]')?.content || '');
                        shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'telegram':
                        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                        break;
                    default:
                        return;
                }
                
                // Open share window
                window.open(shareUrl, '_blank', windowOptions);
                
                // Track share
                trackInteraction('share', platform);
            });
        });
        
        // Native Web Share API for mobile
        const nativeShareBtn = document.querySelector('.btn-native-share');
        if (nativeShareBtn && navigator.share) {
            nativeShareBtn.style.display = 'block';
            nativeShareBtn.addEventListener('click', async function() {
                try {
                    await navigator.share({
                        title: document.title,
                        text: document.querySelector('meta[name="description"]')?.content || '',
                        url: window.location.href,
                    });
                    trackInteraction('share', 'native');
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            });
        }
    }
    
    /**
     * Initialize Comment System
     */
    function initCommentSystem() {
        const commentForm = document.getElementById('commentForm');
        const commentTextarea = commentForm?.querySelector('textarea');
        const commentsList = document.querySelector('.comments-list');
        
        if (!commentForm || !commentsList) return;
        
        // Load existing comments from localStorage
        loadComments();
        
        // Comment form submission
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]').value.trim();
            const email = this.querySelector('input[type="email"]').value.trim();
            const comment = commentTextarea.value.trim();
            
            if (!name || !email || !comment) {
                showNotification('Please fill all fields', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email', 'error');
                return;
            }
            
            // Create new comment object
            const newComment = {
                id: Date.now(),
                name: name,
                email: email,
                comment: comment,
                date: new Date().toISOString(),
                likes: 0,
                replies: []
            };
            
            // Save comment
            saveComment(newComment);
            
            // Add to DOM
            addCommentToDOM(newComment);
            
            // Reset form
            this.reset();
            
            // Show success message
            showNotification('Comment posted successfully!', 'success');
            
            // Track comment
            trackInteraction('comment_post', 'new_comment');
        });
        
        // Comment liking functionality
        commentsList.addEventListener('click', function(e) {
            if (e.target.closest('.btn-like')) {
                const btn = e.target.closest('.btn-like');
                const commentId = parseInt(btn.dataset.commentId);
                
                if (commentId) {
                    toggleLike(commentId, btn);
                }
            }
            
            // Reply functionality
            if (e.target.closest('.btn-reply')) {
                const btn = e.target.closest('.btn-reply');
                const commentId = parseInt(btn.dataset.commentId);
                
                if (commentId) {
                    showReplyForm(commentId, btn);
                }
            }
        });
        
        // Load comments from localStorage
        function loadComments() {
            const savedComments = localStorage.getItem('blog_comments');
            if (savedComments) {
                try {
                    const comments = JSON.parse(savedComments);
                    comments.forEach(comment => {
                        addCommentToDOM(comment);
                    });
                } catch (e) {
                    console.error('Error loading comments:', e);
                }
            }
        }
        
        // Save comment to localStorage
        function saveComment(comment) {
            let comments = [];
            const savedComments = localStorage.getItem('blog_comments');
            
            if (savedComments) {
                try {
                    comments = JSON.parse(savedComments);
                } catch (e) {
                    console.error('Error parsing saved comments:', e);
                }
            }
            
            comments.unshift(comment); // Add to beginning
            localStorage.setItem('blog_comments', JSON.stringify(comments));
        }
        
        // Add comment to DOM
        function addCommentToDOM(comment) {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.dataset.commentId = comment.id;
            
            const timeAgo = getTimeAgo(comment.date);
            
            commentElement.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=4f46e5&color=fff" 
                     alt="${comment.name}" 
                     class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHTML(comment.name)}</span>
                        <span class="comment-date">${timeAgo}</span>
                    </div>
                    <p class="comment-text">${escapeHTML(comment.comment)}</p>
                    <div class="comment-actions">
                        <button class="btn-reply" data-comment-id="${comment.id}">Reply</button>
                        <button class="btn-like" data-comment-id="${comment.id}">
                            <i class="far fa-thumbs-up"></i> <span class="like-count">${comment.likes || 0}</span>
                        </button>
                    </div>
                </div>
            `;
            
            commentsList.prepend(commentElement);
        }
        
        // Toggle like on comment
        function toggleLike(commentId, button) {
            let comments = [];
            const savedComments = localStorage.getItem('blog_comments');
            
            if (savedComments) {
                try {
                    comments = JSON.parse(savedComments);
                } catch (e) {
                    console.error('Error parsing comments:', e);
                    return;
                }
            }
            
            const commentIndex = comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return;
            
            // Check if already liked (simplified - in real app, check user)
            const liked = comments[commentIndex].liked || false;
            
            if (liked) {
                comments[commentIndex].likes = Math.max(0, (comments[commentIndex].likes || 1) - 1);
                comments[commentIndex].liked = false;
                button.querySelector('i').className = 'far fa-thumbs-up';
            } else {
                comments[commentIndex].likes = (comments[commentIndex].likes || 0) + 1;
                comments[commentIndex].liked = true;
                button.querySelector('i').className = 'fas fa-thumbs-up';
            }
            
            // Update like count display
            const likeCount = button.querySelector('.like-count');
            if (likeCount) {
                likeCount.textContent = comments[commentIndex].likes;
            }
            
            // Save updated comments
            localStorage.setItem('blog_comments', JSON.stringify(comments));
            
            trackInteraction('comment_like', commentId);
        }
        
        // Show reply form
        function showReplyForm(commentId, button) {
            // Hide any existing reply forms
            document.querySelectorAll('.reply-form').forEach(form => form.remove());
            
            const commentElement = button.closest('.comment');
            const replyForm = document.createElement('div');
            replyForm.className = 'reply-form';
            replyForm.innerHTML = `
                <form class="reply-form-inner">
                    <textarea placeholder="Write a reply..." required></textarea>
                    <div class="reply-actions">
                        <button type="submit" class="btn-submit-reply">Post Reply</button>
                        <button type="button" class="btn-cancel-reply">Cancel</button>
                    </div>
                </form>
            `;
            
            commentElement.appendChild(replyForm);
            
            // Focus on textarea
            replyForm.querySelector('textarea').focus();
            
            // Handle form submission
            replyForm.querySelector('form').addEventListener('submit', function(e) {
                e.preventDefault();
                const replyText = this.querySelector('textarea').value.trim();
                
                if (replyText) {
                    // In a real app, save reply to server
                    showNotification('Reply posted!', 'success');
                    replyForm.remove();
                }
            });
            
            // Handle cancel
            replyForm.querySelector('.btn-cancel-reply').addEventListener('click', function() {
                replyForm.remove();
            });
        }
    }
    
    /**
     * Initialize Product Comparison functionality
     */
    function initProductComparison() {
        const compareButtons = document.querySelectorAll('.btn-compare');
        const viewAllBtn = document.getElementById('viewAllProducts');
        const productCards = document.querySelectorAll('.product-card');
        
        // View all products button
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function() {
                productCards.forEach(card => {
                    card.style.display = 'flex';
                });
                this.style.display = 'none';
                
                trackInteraction('view_all_products', 'tshirts');
            });
        }
        
        // Compare button functionality
        compareButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                
                // Add to comparison (in real app, this would open comparison modal)
                showNotification(`${productName} added to comparison`, 'info');
                
                trackInteraction('product_compare', productName);
            });
        });
        
        // Buy button affiliate tracking
        const buyButtons = document.querySelectorAll('.btn-buy');
        buyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const productName = this.closest('.product-card').querySelector('h3').textContent;
                
                // Track before navigation
                trackInteraction('product_click', productName);
                
                // In real app, this would have actual affiliate link
                // For demo, prevent default and show message
                e.preventDefault();
                showNotification(`Redirecting to ${productName} product page...`, 'info');
                
                // Simulate redirect after 1 second
                setTimeout(() => {
                    // window.location.href = this.href; // Uncomment for real links
                }, 1000);
            });
        });
    }
    
    /**
     * Initialize Affiliate Link Tracking
     */
    function initAffiliateTracking() {
        const affiliateLinks = document.querySelectorAll('[data-affiliate]');
        
        affiliateLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const product = this.getAttribute('data-affiliate');
                const isExternal = this.target === '_blank' || this.hostname !== window.location.hostname;
                
                // Track affiliate click
                trackInteraction('affiliate_click', product);
                
                // If external link, add loading indicator
                if (isExternal) {
                    e.preventDefault();
                    const originalHref = this.href;
                    
                    // Show loading
                    this.classList.add('loading');
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
                    
                    // Track and redirect
                    setTimeout(() => {
                        window.location.href = originalHref;
                    }, 500);
                }
            });
        });
    }
    
    /**
     * Initialize Reading Progress Bar
     */
    function initReadingProgress() {
        // Create progress bar if not exists
        if (!document.querySelector('.scroll-progress')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--primary-color, #4f46e5), var(--secondary-color, #7c3aed));
                width: 0%;
                z-index: 9999;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        const progressBar = document.querySelector('.scroll-progress');
        
        // Update progress on scroll
        function updateProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            progressBar.style.width = scrolled + '%';
            
            // Show/hide based on scroll position
            if (scrolled > 5) {
                progressBar.style.opacity = '1';
            } else {
                progressBar.style.opacity = '0';
            }
        }
        
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(function() {
                    scrollTimeout = null;
                    updateProgress();
                }, 10);
            }
        });
        
        // Initial update
        updateProgress();
    }
    
    /**
     * Initialize Scroll to Top functionality
     */
    function initScrollToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        if (!backToTopBtn) return;
        
        // Show/hide based on scroll
        function toggleBackToTop() {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        // Scroll to top
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            trackInteraction('scroll_to_top', 'blog_post');
        });
        
        // Listen to scroll
        window.addEventListener('scroll', toggleBackToTop);
        
        // Initial check
        toggleBackToTop();
    }
    
    /**
     * Initialize Print Functionality
     */
    function initPrintFunctionality() {
        const printButtons = document.querySelectorAll('.btn-print, [onclick*="print"]');
        
        printButtons.forEach(button => {
            // Remove inline onclick if exists
            button.removeAttribute('onclick');
            
            button.addEventListener('click', function() {
                // Add print styles
                const printStyle = document.createElement('style');
                printStyle.textContent = `
                    @media print {
                        .main-header, .top-bar, .mobile-nav, .main-footer,
                        .article-actions, .comments-section, .related-articles-section,
                        .back-to-top, .scroll-progress, .table-of-contents {
                            display: none !important;
                        }
                        
                        .article-content {
                            max-width: 100% !important;
                            padding: 0 !important;
                        }
                        
                        body {
                            font-size: 12pt !important;
                            line-height: 1.5 !important;
                        }
                        
                        a[href]:after {
                            content: " (" attr(href) ")";
                        }
                        
                        .product-actions, .share-buttons, .save-section {
                            display: none !important;
                        }
                    }
                `;
                document.head.appendChild(printStyle);
                
                // Print
                window.print();
                
                // Clean up
                setTimeout(() => {
                    printStyle.remove();
                }, 1000);
                
                trackInteraction('print_article', window.location.pathname);
            });
        });
    }
    
    /**
     * Initialize Newsletter Subscription
     */
    function initNewsletterSubscription() {
        const newsletterForms = document.querySelectorAll('.sidebar-newsletter, .newsletter-form');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (!validateEmail(email)) {
                    showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Simulate subscription
                emailInput.value = '';
                showNotification('Successfully subscribed to newsletter!', 'success');
                
                // Track subscription
                trackInteraction('newsletter_subscribe', 'blog_post');
                
                // In real app, send to your backend
                // fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
            });
        });
    }
    
    /**
     * Initialize Related Posts functionality
     */
    function initRelatedPosts() {
        const relatedPosts = document.querySelectorAll('.related-post, .related-article-card');
        
        relatedPosts.forEach(post => {
            post.addEventListener('click', function(e) {
                // Track click on related post
                const postTitle = this.querySelector('h3, h5').textContent;
                trackInteraction('related_post_click', postTitle);
            });
        });
        
        // Lazy load related post images
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.related-post img, .related-article-card img').forEach(img => {
            if (img.dataset.src) {
                observer.observe(img);
            }
        });
    }
    
    /**
     * Utility: Show notification
     */
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.custom-notification').forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.textContent = message;
        
        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .custom-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #4f46e5;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 10000;
                    max-width: 300px;
                }
                .custom-notification.success { background: #10b981; }
                .custom-notification.error { background: #ef4444; }
                .custom-notification.warning { background: #f59e0b; }
                .custom-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Show with delay
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Utility: Track user interactions
     */
    function trackInteraction(action, label) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'Blog_Post',
                'event_label': label,
                'value': 1
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', action, { label: label });
        }
        
        // Custom event for internal tracking
        const event = new CustomEvent('blogPostInteraction', {
            detail: { action, label, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Console log for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Tracked:', action, label);
        }
    }
    
    /**
     * Utility: Validate email
     */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Utility: Escape HTML
     */
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Utility: Get time ago from date string
     */
    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return 'just now';
    }
    
    /**
     * Initialize reading time tracking
     */
    function initReadingTime() {
        const wordsPerMinute = 200;
        const text = document.querySelector('.main-article')?.textContent || '';
        const words = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / wordsPerMinute);
        
        // Update reading time display if exists
        const readingTimeElement = document.querySelector('.article-reading-time');
        if (readingTimeElement) {
            readingTimeElement.innerHTML = `<i class="far fa-clock"></i> ${readingTime} min read`;
        }
        
        // Track reading time
        let startTime = Date.now();
        let maxScroll = 0;
        
        window.addEventListener('scroll', function() {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
        });
        
        // Track when user leaves page
        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const completion = Math.min(maxScroll, 100);
            
            if (timeSpent > 10) { // Only track if spent reasonable time
                trackInteraction('reading_time', `${timeSpent}s_${completion}%`);
            }
        });
    }
    
    // Initialize reading time tracking
    initReadingTime();
    
    // Add CSS for additional styles
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .btn-save.saved {
            background: #10b981 !important;
            color: white !important;
        }
        
        .toc-link.active {
            color: var(--primary-color, #4f46e5) !important;
            font-weight: 600 !important;
            position: relative;
        }
        
        .toc-link.active::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 60%;
            background: var(--primary-color, #4f46e5);
            border-radius: 2px;
        }
        
        .faq-item.active .faq-question {
            color: var(--primary-color, #4f46e5);
        }
        
        .faq-item.active .faq-question i {
            transform: rotate(180deg);
        }
        
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
        
        .back-to-top.visible {
            opacity: 1;
            pointer-events: all;
        }
        
        @media print {
            .custom-notification {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(additionalStyles);
});