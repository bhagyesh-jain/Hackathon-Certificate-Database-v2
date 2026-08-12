/**
 * IKIGAI 2026 - Homepage Application Logic
 * Handles certificate series/number input and verification redirection.
 */

const App = (() => {
    const seriesInput = document.getElementById('cert-series-input');
    const numberInput = document.getElementById('cert-number-input');
    const verifyBtn = document.getElementById('verify-btn');

    const init = () => {
        if (!seriesInput || !numberInput || !verifyBtn) return;

        numberInput.addEventListener('input', handleNumberFormatting);
        numberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processVerification();
        });
        verifyBtn.addEventListener('click', processVerification);
    };

    const handleNumberFormatting = (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    };

    const processVerification = () => {
        const series = seriesInput.value.trim().toUpperCase();
        const number = numberInput.value.trim();

        if (!series) {
            UIManager.showToast('Please select a certificate series', 'error');
            return;
        }

        if (!/^\d{4,6}$/.test(number)) {
            UIManager.showToast('Enter a 4 to 6 digit certificate number', 'error');
            shakeInput();
            return;
        }

        setLoadingState(true);

        setTimeout(() => {
            window.location.href = `verify.html?series=${encodeURIComponent(series)}&number=${encodeURIComponent(number.padStart(4, '0'))}`;
        }, 500);
    };

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

    const shakeInput = () => {
        const wrapper = document.querySelector('.verification-inputs');
        if (!wrapper) return;
        wrapper.style.animation = 'none';
        wrapper.offsetHeight;
        wrapper.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        numberInput.focus();
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);

const style = document.createElement('style');
style.textContent = `
    @keyframes spinner-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spinner-anim { animation: spinner-anim 1s linear infinite; }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
`;
document.head.appendChild(style);
