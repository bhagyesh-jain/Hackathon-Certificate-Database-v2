/**
 * IKIGAI 2026 - UI Interaction Engine
 * Handles FAQ, Scroll Animations, Toast System, and Navigation effects.
 */

const UIManager = (() => {
    
    /**
     * Initialize all UI components
     */
    const init = () => {
        handleNavbarScroll();
        handleFAQAccordion();
        handleBackToTop();
        handleSmoothScrolling();
        initScrollAnimations();
        initCounters();
    };

    /**
     * Add shadow/blur to navbar when scrolling down
     */
    const handleNavbarScroll = () => {
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    };

    /**
     * FAQ Accordion logic
     */
    const handleFAQAccordion = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(i => i.classList.remove('active'));
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    };

    /**
     * Back to Top button visibility and logic
     */
    const handleBackToTop = () => {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    /**
     * Smooth scrolling for anchor links
     */
    const handleSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    /**
     * Reveal animations on scroll using Intersection Observer
     */
    const initScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Targeted elements for animation
        const animatedElements = document.querySelectorAll('.step-card, .type-card, .stat-item, .section-header');
        animatedElements.forEach(el => {
            el.classList.add('reveal-hidden'); // CSS for this is in style.css logic
            observer.observe(el);
        });
    };

    /**
     * Animated counters for statistics section
     */
    const initCounters = () => {
        const stats = document.querySelectorAll('.stat-number');
        
        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;
            
            const timer = setInterval(() => {
                current += Math.ceil(target / 100);
                if (current >= target) {
                    el.innerText = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    el.innerText = current.toLocaleString();
                }
            }, 20);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    };

    /**
     * Global Toast Notification System
     * @param {string} message - Text to display
     * @param {string} type - 'success', 'error', or 'info'
     */
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : (type === 'error' ? 'ph-warning-circle' : 'ph-info');
        
        toast.innerHTML = `
            <i class="ph-bold ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    return {
        init,
        showToast
    };
})();

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', UIManager.init);