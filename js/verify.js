/**
 * IKIGAI 2026 - Verification Logic
 * Handles URL parsing, data fetching, and state rendering.
 */

const VerificationEngine = (() => {
    
    // CONFIGURATION: 
    // To switch to production, replace LOCAL_DATA_PATH with your Google Apps Script Web App URL
    const API_ENDPOINT = 'data/certificates.json'; 
    const USE_MOCK_FOR_DEMO = false; // Set to true only for local testing without a server

    // DOM Elements
    const states = {
        loading: document.getElementById('state-loading'),
        success: document.getElementById('state-success'),
        error: document.getElementById('state-error')
    };

    const fields = {
        name: document.getElementById('cert-name'),
        id: document.getElementById('cert-id-display'),
        type: document.getElementById('cert-type'),
        date: document.getElementById('cert-date'),
        skills: document.getElementById('cert-skills'),
        timelineDate: document.getElementById('timeline-issued'),
        pdfBtn: document.getElementById('view-pdf-btn')
    };

    /**
     * Entry point for verification
     */
    const init = async () => {
        const certId = getCertIdFromUrl();

        if (!certId) {
            showState('error');
            return;
        }

        // Artificial delay for enterprise "Security Scanning" feel (1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500));

        performLookup(certId);
    };

    /**
     * Extracts 'id' parameter from URL
     */
    const getCertIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return id ? id.toUpperCase().replace(/\s/g, '').replace(/-/g, '') : null;
    };

    /**
     * Fetches certificate data from the source
     * @param {string} targetId - The sanitized ID to look for
     */
    const performLookup = async (targetId) => {
        try {
            const response = await fetch(API_ENDPOINT);
            
            if (!response.ok) {
                throw new Error('Database connection failed');
            }

            const data = await response.json();
            
            // Logic for JSON-based lookup (Array of objects)
            // If using Google Apps Script API, the filtering happens server-side
            const record = data.find(item => {
                const normalizedItem = item.id.toUpperCase().replace(/-/g, '');
                return normalizedItem === targetId;
            });

            if (record) {
                renderCertificate(record);
                showState('success');
            } else {
                showState('error');
            }

        } catch (error) {
            console.error('Verification Error:', error);
            showState('error');
            UIManager.showToast('Unable to connect to verification server', 'error');
        }
    };

    /**
     * Populates the Success UI with record data
     * @param {Object} data 
     */
    const renderCertificate = (data) => {
        fields.name.textContent = data.name;
        fields.id.textContent = data.id; // Original formatted ID (e.g., IKI-2026-...)
        fields.type.textContent = data.type;
        fields.date.textContent = formatDate(data.issueDate);
        fields.skills.textContent = data.skills || 'General Certification';
        fields.timelineDate.textContent = `Officially recorded on ${formatDate(data.issueDate)}`;
        
        if (data.pdfUrl) {
            fields.pdfBtn.href = data.pdfUrl;
        } else {
            fields.pdfBtn.style.display = 'none';
        }
    };

    /**
     * Switches between different UI containers
     * @param {string} activeState - 'loading', 'success', or 'error'
     */
    const showState = (activeState) => {
        Object.keys(states).forEach(key => {
            if (key === activeState) {
                states[key].classList.remove('hidden');
                states[key].style.display = 'block';
            } else {
                states[key].classList.add('hidden');
                states[key].style.display = 'none';
            }
        });

        // Update page title based on status
        if (activeState === 'success') {
            document.title = `Verified: ${fields.name.textContent} | IKIGAI 2026`;
        } else if (activeState === 'error') {
            document.title = `Verification Failed | IKIGAI 2026`;
        }
    };

    /**
     * Formats ISO dates to professional display format
     * @param {string} dateString 
     */
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return {
        init
    };
})();

// Start verification on load
document.addEventListener('DOMContentLoaded', VerificationEngine.init);