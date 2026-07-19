/**
 * IKIGAI 2026 - Homepage Application Logic
 * Handles Certificate ID input, validation, and redirection.
 */

const App = (() => {
    // DOM Elements
    const certInput = document.getElementById('cert-id-input');
    const verifyBtn = document.getElementById('verify-btn');

    /**
     * Initialize Homepage logic
     */
    const init = () => {
        if (!certInput || !verifyBtn) return;

        // 1. Auto-format input as user types
        certInput.addEventListener('input', handleInputFormatting);

        // 2. Handle 'Enter' key press
        certInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processVerification();
            }
        });

        // 3. Handle Click event
        verifyBtn.addEventListener('click', processVerification);
    };

    /**
     * Sanitizes input in real-time
     * - Forces Uppercase
     * - Removes spaces
     * @param {Event} e 
     */
    const handleInputFormatting = (e) => {
        let value = e.target.value;
        
        // Convert to uppercase
        value = value.toUpperCase();
        
        // Remove all whitespace
        value = value.replace(/\s/g, '');
        
        // Update input value
        e.target.value = value;
    };

    /**
     * Validates ID and redirects to the verification page
     */
    const processVerification = () => {
        const rawValue = certInput.value.trim();

        // Basic validation: Check if empty
        if (!rawValue) {
            UIManager.showToast('Please enter a Certificate ID', 'error');
            shakeInput();
            return;
        }

        // Advanced formatting for the URL
        // Requirement: "Ignore hyphens" - we strip them for the search logic
        const sanitizedId = rawValue.replace(/-/g, '');

        if (sanitizedId.length < 4) {
            UIManager.showToast('Certificate ID is too short', 'error');
            return;
        }

        // Set UI to loading state
        setLoadingState(true);

        // Simulate a small delay for enterprise "processing" feel
        setTimeout(() => {
            // Redirect to verify.html with the sanitized ID as a query parameter
            window.location.href = `verify.html?id=${encodeURIComponent(sanitizedId)}`;
        }, 800);
    };

    /**
     * Toggles the button loading state
     * @param {boolean} isLoading 
     */
    const setLoadingState = (isLoading) => {
        if (isLoading) {
            verifyBtn.disabled = true;
            verifyBtn.classList.add('loading');
            verifyBtn.innerHTML = `
                <i class="ph-bold ph-circle-notch spinner-anim"></i>
                <span>Verifying...</span>
            `;
        } else {
            verifyBtn.disabled = false;
            verifyBtn.classList.remove('loading');
            verifyBtn.innerHTML = `
                <span>Verify</span>
                <i class="ph-bold ph-arrow-right"></i>
            `;
        }
    };

    /**
     * Visual feedback for empty input
     */
    const shakeInput = () => {
        const wrapper = document.querySelector('.search-wrapper');
        wrapper.style.animation = 'none';
        wrapper.offsetHeight; // trigger reflow
        wrapper.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        certInput.focus();
    };

    return {
        init
    };
})();

// Initialize when content is loaded
document.addEventListener('DOMContentLoaded', App.init);

/**
 * Add unique animations for this script if not in CSS files
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes spinner-anim {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spinner-anim {
        animation: spinner-anim 1s linear infinite;
    }
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);