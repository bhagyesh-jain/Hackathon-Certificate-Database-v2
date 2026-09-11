/**
 * IKIGAI 2026 Homepage Search
 * Certificate ID search + uppercase name search with live suggestions.
 */
const App = (() => {
    const DATA_URL = 'data/certificates.json';

    const series = document.getElementById('cert-series-input');
    const number = document.getElementById('cert-number-input');
    const verify = document.getElementById('verify-btn');

    const nameInput = document.getElementById('participant-name-input');
    const nameBtn = document.getElementById('name-search-btn');
    const suggestions = document.getElementById('name-suggestions');

    const idPanel = document.getElementById('id-search-panel');
    const namePanel = document.getElementById('name-search-panel');

    let certificateNames = [];
    let activeSuggestion = -1;

    const toast = (message) => {
        if (window.UIManager) UIManager.showToast(message, 'error');
        else alert(message);
    };

    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));

    async function loadNames() {
        if (certificateNames.length) return certificateNames;

        try {
            const response = await fetch(DATA_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error('Could not load certificates');

            const data = await response.json();

            // Unique names only, sorted alphabetically.
            certificateNames = [...new Set(
                data
                    .map(item => String(item.name || '').trim())
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b));

            return certificateNames;
        } catch (error) {
            console.error('Name search database error:', error);
            toast('Unable to load participant names. Please try again.');
            return [];
        }
    }

    function hideSuggestions() {
        suggestions.innerHTML = '';
        suggestions.hidden = true;
        nameInput.setAttribute('aria-expanded', 'false');
        activeSuggestion = -1;
    }

    function renderSuggestions(query) {
        const value = query.trim().toUpperCase();

        if (!value) {
            hideSuggestions();
            return;
        }

        // Starts-with matching first, then contains matching as a fallback.
        const startsWithMatches = certificateNames.filter(name =>
            name.toUpperCase().startsWith(value)
        );

        const matches = startsWithMatches.length
            ? startsWithMatches
            : certificateNames.filter(name =>
                name.toUpperCase().includes(value)
            );

        if (!matches.length) {
            suggestions.innerHTML = '<div class="name-suggestion-empty">NO MATCHING PARTICIPANT FOUND</div>';
            suggestions.hidden = false;
            nameInput.setAttribute('aria-expanded', 'true');
            activeSuggestion = -1;
            return;
        }

        suggestions.innerHTML = matches.map((name, index) => `
            <button
                type="button"
                class="name-suggestion"
                role="option"
                data-name="${escapeHtml(name.toUpperCase())}"
                data-index="${index}"
                aria-selected="false"
            >${escapeHtml(name.toUpperCase())}</button>
        `).join('');

        suggestions.hidden = false;
        nameInput.setAttribute('aria-expanded', 'true');
        activeSuggestion = -1;

        suggestions.querySelectorAll('.name-suggestion').forEach(button => {
            button.addEventListener('mousedown', event => {
                event.preventDefault();
                nameInput.value = button.dataset.name;
                hideSuggestions();
                nameInput.focus();
            });
        });
    }

    function updateActiveSuggestion() {
        const items = [...suggestions.querySelectorAll('.name-suggestion')];

        items.forEach((item, index) => {
            const active = index === activeSuggestion;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', active ? 'true' : 'false');
            if (active) item.scrollIntoView({ block: 'nearest' });
        });
    }

    function idSearch() {
        const selectedSeries = series.value.trim().toUpperCase();
        const rawInput = number.value.trim().toUpperCase();

        if (!rawInput) {
            return toast('Enter a certificate number or ID');
        }

        // If user typed or pasted full certificate ID (e.g. IKIGAI26-0004 or HACK26-0001)
        if (/^[A-Z0-9]+-\d+$/i.test(rawInput)) {
            window.location.href = `verify.html?id=${encodeURIComponent(rawInput)}`;
            return;
        }

        const digits = rawInput.replace(/\D/g, '');
        if (!digits || digits.length > 6) {
            return toast('Enter a valid certificate number (e.g., 0004)');
        }

        window.location.href =
            `verify.html?series=${encodeURIComponent(selectedSeries)}&number=${encodeURIComponent(digits.padStart(4, '0'))}`;
    }

    function nameSearch() {
        const query = nameInput.value.trim().toUpperCase();

        if (!query) {
            nameInput.focus();
            return toast('Enter the participant name');
        }

        hideSuggestions();
        window.location.href = `verify.html?name=${encodeURIComponent(query)}`;
    }

    function setSearchMode(mode) {
        const isName = mode === 'name';

        document.querySelectorAll('[data-search-mode]').forEach(button => {
            button.classList.toggle('active', button.dataset.searchMode === mode);
        });

        idPanel.hidden = isName;
        namePanel.hidden = !isName;

        if (isName) {
            loadNames();
            nameInput.focus();
        } else {
            hideSuggestions();
            number.focus();
        }
    }

    function init() {
        number.addEventListener('input', event => {
            // Allow uppercase letters, digits, and hyphens up to 15 chars
            event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15);
        });

        verify.addEventListener('click', idSearch);
        number.addEventListener('keydown', event => {
            if (event.key === 'Enter') idSearch();
        });

        nameBtn.addEventListener('click', nameSearch);

        // Force every typed character to uppercase and filter suggestions live.
        nameInput.addEventListener('input', event => {
            const cursor = event.target.selectionStart;
            event.target.value = event.target.value.toUpperCase();
            event.target.setSelectionRange(cursor, cursor);

            loadNames().then(() => renderSuggestions(event.target.value));
        });

        nameInput.addEventListener('keydown', event => {
            const items = [...suggestions.querySelectorAll('.name-suggestion')];

            if (event.key === 'ArrowDown' && items.length) {
                event.preventDefault();
                activeSuggestion = Math.min(activeSuggestion + 1, items.length - 1);
                updateActiveSuggestion();
                return;
            }

            if (event.key === 'ArrowUp' && items.length) {
                event.preventDefault();
                activeSuggestion = Math.max(activeSuggestion - 1, 0);
                updateActiveSuggestion();
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                if (activeSuggestion >= 0 && items[activeSuggestion]) {
                    nameInput.value = items[activeSuggestion].dataset.name;
                    hideSuggestions();
                    return;
                }

                nameSearch();
                return;
            }

            if (event.key === 'Escape') hideSuggestions();
        });

        nameInput.addEventListener('blur', () => {
            // Allow suggestion mousedown to complete before hiding.
            setTimeout(hideSuggestions, 150);
        });

        document.querySelectorAll('[data-search-mode]').forEach(button => {
            button.addEventListener('click', () => setSearchMode(button.dataset.searchMode));
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);