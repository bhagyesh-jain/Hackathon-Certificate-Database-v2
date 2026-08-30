/**
 * IKIGAI26 Certificate Verification
 * Supports Certificate ID and Participant Name search.
 */

const DATA_URL = 'data/certificates.json';

const params = new URLSearchParams(window.location.search);

const escapeHtml = (value) =>
    String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));

/**
 * Normalizes text for case-insensitive name matching.
 */
const normalizeText = (value) =>
    String(value || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');

/**
 * Converts a Google Drive VIEW URL into a direct download URL.
 */
function getDownloadUrl(url) {
    if (!url) return '';

    const match = String(url).match(/\/d\/([^/]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    return url;
}

/**
 * Loads the certificate database.
 */
async function loadCertificates() {
    const response = await fetch(DATA_URL, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Unable to load certificate database.');
    }

    return response.json();
}

/**
 * Uses the existing page elements where possible.
 */
function getResultContainer() {
    return (
        document.getElementById('verification-result') ||
        document.getElementById('result-container') ||
        document.querySelector('.verification-result') ||
        document.querySelector('main')
    );
}

/**
 * Shows a failure message.
 */
function showFailure(message) {
    const container = getResultContainer();

    container.innerHTML = `
        <div class="verification-failed">
            <h2>Verification Failed</h2>
            <p>${escapeHtml(message)}</p>
            <a href="index.html" class="back-home-btn">Back to Home</a>
        </div>
    `;
}

/**
 * Shows multiple name matches.
 */
function showNameMatches(matches, query) {
    const container = getResultContainer();

    container.innerHTML = `
        <div class="name-search-results">
            <h2>Matching Participants</h2>
            <p>${matches.length} matching participant${matches.length === 1 ? '' : 's'} found for <strong>${escapeHtml(query)}</strong>.</p>
            <div class="name-match-list">
                ${matches.map(cert => `
                    <button
                        type="button"
                        class="name-match-card"
                        data-certificate-id="${escapeHtml(cert.certificateId)}"
                    >
                        <span class="name-match-name">${escapeHtml(cert.name)}</span>
                        <span class="name-match-id">${escapeHtml(cert.certificateId)}</span>
                        <span class="name-match-institute">${escapeHtml(cert.institute || '')}</span>
                    </button>
                `).join('')}
            </div>
            <a href="index.html" class="back-home-btn">Back to Home</a>
        </div>
    `;

    container.querySelectorAll('[data-certificate-id]').forEach(button => {
        button.addEventListener('click', () => {
            const certificateId = button.dataset.certificateId;
            window.location.href =
                `verify.html?id=${encodeURIComponent(certificateId)}`;
        });
    });
}

/**
 * Displays the verified certificate.
 * This function creates a complete result view while preserving
 * View Certificate and Download Certificate actions.
 */
function showCertificate(certificate) {
    const container = getResultContainer();

    const pdfUrl = certificate.pdfUrl || '';
    const downloadUrl = getDownloadUrl(pdfUrl);

    container.innerHTML = `
        <div class="verification-success">
            <div class="verified-badge">✓ VERIFIED</div>

            <h2>Certificate Verified</h2>

            <div class="certificate-details">
                <div class="detail-row">
                    <span>Participant</span>
                    <strong>${escapeHtml(certificate.name)}</strong>
                </div>

                <div class="detail-row">
                    <span>Certificate ID</span>
                    <strong>${escapeHtml(certificate.certificateId)}</strong>
                </div>

                <div class="detail-row">
                    <span>Certificate Type</span>
                    <strong>${escapeHtml(certificate.type || 'Participation')}</strong>
                </div>

                ${certificate.team ? `
                <div class="detail-row">
                    <span>Team</span>
                    <strong>${escapeHtml(certificate.team)}</strong>
                </div>` : ''}

                ${certificate.institute ? `
                <div class="detail-row">
                    <span>Institute</span>
                    <strong>${escapeHtml(certificate.institute)}</strong>
                </div>` : ''}
            </div>

            <div class="certificate-actions">
                ${pdfUrl ? `
                    <button type="button" id="view-certificate-btn">
                        View Certificate
                    </button>
                    <button type="button" id="download-certificate-btn">
                        Download Certificate
                    </button>
                ` : ''}
            </div>

            <a href="index.html" class="back-home-btn">Back to Home</a>
        </div>
    `;

    const viewButton = document.getElementById('view-certificate-btn');
    const downloadButton = document.getElementById('download-certificate-btn');

    if (viewButton) {
        viewButton.addEventListener('click', () => {
            window.open(pdfUrl, '_blank', 'noopener');
        });
    }

    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            window.open(downloadUrl, '_blank', 'noopener');
        });
    }
}

/**
 * Main verification controller.
 */
async function initializeVerification() {
    try {
        const certificates = await loadCertificates();

        const nameQuery = (params.get('name') || '').trim();
        const directId = (params.get('id') || '').trim().toUpperCase();
        const series = (params.get('series') || '').trim().toUpperCase();
        const number = (params.get('number') || '').trim();

        // --------------------------------------------------
        // 1. SEARCH BY NAME
        // --------------------------------------------------
        if (nameQuery) {
            const query = normalizeText(nameQuery);

            const startsWithMatches = certificates.filter(certificate =>
                normalizeText(certificate.name).startsWith(query)
            );

            const matches = startsWithMatches.length
                ? startsWithMatches
                : certificates.filter(certificate =>
                    normalizeText(certificate.name).includes(query)
                );

            if (!matches.length) {
                showFailure(`No certificate was found for "${nameQuery}".`);
                return;
            }

            if (matches.length === 1) {
                showCertificate(matches[0]);
                return;
            }

            showNameMatches(matches, nameQuery);
            return;
        }

        // --------------------------------------------------
        // 2. DIRECT CERTIFICATE ID
        // --------------------------------------------------
        if (directId) {
            const certificate = certificates.find(item =>
                String(item.certificateId || '').toUpperCase() === directId
            );

            if (!certificate) {
                showFailure('The ID entered does not match any records in our database.');
                return;
            }

            showCertificate(certificate);
            return;
        }

        // --------------------------------------------------
        // 3. EXISTING SERIES + NUMBER SEARCH
        // --------------------------------------------------
        if (series && number) {
            const certificate = certificates.find(item => {
                const itemSeries = String(item.certificateSeries || '').toUpperCase();
                const itemNumber = String(item.certificateNumber || '').padStart(4, '0');

                return itemSeries === series &&
                    itemNumber === number.padStart(4, '0');
            });

            if (!certificate) {
                showFailure('The ID entered does not match any records in our database.');
                return;
            }

            showCertificate(certificate);
            return;
        }

        showFailure('Please enter a valid certificate number or participant name.');

    } catch (error) {
        console.error('Verification error:', error);
        showFailure('Unable to load the certificate database. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', initializeVerification);