/**
 * IKIGAI 2026 - Theme Management System
 * Handles Dark/Light mode, localStorage persistence, and system preferences.
 */

const ThemeManager = (() => {
    const STORAGE_KEY = 'ikigai-theme';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const root = document.documentElement;

    /**
     * Initialize theme based on:
     * 1. Saved preference in localStorage
     * 2. System preference (prefers-color-scheme)
     */
    const init = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
        }

        // Add event listener to toggle button
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    };

    /**
     * Toggles between light and dark
     */
    const toggleTheme = () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setTheme(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    };

    /**
     * Applies the theme to the DOM and updates icons
     * @param {string} theme - 'light' or 'dark'
     */
    const setTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        updateIcon(theme);
    };

    /**
     * Updates the toggle button icon based on the theme
     * @param {string} theme 
     */
    const updateIcon = (theme) => {
        if (!themeIcon) return;

        if (theme === THEMES.DARK) {
            // Switch to Moon icon for Dark Mode
            themeIcon.classList.remove('ph-sun-dim');
            themeIcon.classList.add('ph-moon');
        } else {
            // Switch to Sun icon for Light Mode
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun-dim');
        }
    };

    return {
        init
    };
})();

// Execute on load
document.addEventListener('DOMContentLoaded', ThemeManager.init);