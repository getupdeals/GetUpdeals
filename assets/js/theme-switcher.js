/**
 * theme-switcher.js - SIMPLIFIED for GetUpDeals
 */

class ThemeSwitcher {
    constructor() {
        this.themes = ['light', 'dark'];
        this.currentTheme = 'light';
        this.themeStorageKey = 'getupdeals-theme';
        this.prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemThemeListener = null;
        
        this.init();
    }
    
    init() {
        // Load saved theme or use system preference
        const savedTheme = localStorage.getItem(this.themeStorageKey);
        const systemTheme = this.prefersColorScheme.matches ? 'dark' : 'light';
        
        // Set theme (don't save to localStorage if using system preference)
        this.setTheme(savedTheme || systemTheme, !savedTheme);
        
        // Bind events
        this.bindEvents();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
    }
    
    bindEvents() {
        // Desktop toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Mobile toggle
        const themeSwitchMobile = document.getElementById('themeSwitchMobile');
        if (themeSwitchMobile) {
            themeSwitchMobile.addEventListener('click', () => this.toggleTheme());
        }
        
        // Log if no toggle elements found (for debugging)
        if (!themeToggle && !themeSwitchMobile) {
            console.warn('ThemeSwitcher: No toggle elements found. Elements with IDs "themeToggle" and/or "themeSwitchMobile" are required.');
        }
    }
    
    setTheme(theme, save = true) {
        // Validate theme
        if (!this.themes.includes(theme)) {
            console.error(`ThemeSwitcher: Invalid theme "${theme}". Must be one of: ${this.themes.join(', ')}`);
            return;
        }
        
        if (theme === this.currentTheme) return;
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Save preference if requested
        if (save) {
            localStorage.setItem(this.themeStorageKey, theme);
        } else {
            // Clear saved preference if using system theme
            localStorage.removeItem(this.themeStorageKey);
        }
        
        // Update UI controls
        this.updateToggleButtons();
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme }
        }));
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
    
    updateToggleButtons() {
        const isDark = this.currentTheme === 'dark';
        const iconClass = isDark ? 'fa-sun' : 'fa-moon';
        const text = isDark ? 'Light Mode' : 'Dark Mode';
        const ariaLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';
        
        // Update desktop toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icons = themeToggle.querySelectorAll('i');
            icons.forEach(icon => {
                icon.style.opacity = icon.classList.contains(iconClass) ? '1' : '0';
            });
            themeToggle.setAttribute('aria-label', ariaLabel);
            themeToggle.setAttribute('title', text);
        }
        
        // Update mobile toggle
        const mobileToggle = document.getElementById('themeSwitchMobile');
        if (mobileToggle) {
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = `fas ${iconClass}`;
            }
            // Update text if it exists in the button
            const textSpan = mobileToggle.querySelector('span');
            if (textSpan) {
                textSpan.textContent = text;
            } else {
                mobileToggle.innerHTML = `<i class="fas ${iconClass}"></i> ${text}`;
            }
            mobileToggle.setAttribute('aria-label', ariaLabel);
        }
    }
    
    setupSystemThemeListener() {
        // Clean up previous listener if exists
        if (this.systemThemeListener) {
            this.prefersColorScheme.removeListener(this.systemThemeListener);
        }
        
        this.systemThemeListener = (e) => {
            // Only auto-switch if user hasn't set a preference
            if (!localStorage.getItem(this.themeStorageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        };
        
        this.prefersColorScheme.addListener(this.systemThemeListener);
    }
    
    // Cleanup method (optional, for single-page apps)
    destroy() {
        if (this.systemThemeListener) {
            this.prefersColorScheme.removeListener(this.systemThemeListener);
        }
        
        // Remove event listeners
        const themeToggle = document.getElementById('themeToggle');
        const themeSwitchMobile = document.getElementById('themeSwitchMobile');
        
        if (themeToggle) {
            themeToggle.replaceWith(themeToggle.cloneNode(true));
        }
        if (themeSwitchMobile) {
            themeSwitchMobile.replaceWith(themeSwitchMobile.cloneNode(true));
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeSwitcher = new ThemeSwitcher();
    });
} else {
    // DOM already loaded
    window.themeSwitcher = new ThemeSwitcher();
}