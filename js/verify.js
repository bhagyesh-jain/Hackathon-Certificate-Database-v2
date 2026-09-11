/**
 * IKIGAI26 Certificate Verification System
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
 * Parses series and 4-digit number from a Certificate ID string.
 * Example: "IKIGAI26-0004" -> { series: "IKIGAI26", number: "0004" }
 */
function parseCertificateId(idStr) {
    if (!idStr) return { series: '', number: '' };
    const match = String(idStr).trim().toUpperCase().match(/^([A-Z0-9]+)-(\d+)$/);
    if (match) {
        return { series: match[1], number: match[2].padStart(4, '0') };
    }
    return { series: '', number: '' };
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
 * Hides all state views in verify.html card.
 */
function hideAllStates() {
    document.getElementById('state-loading')?.classList.add('hidden');
    document.getElementById('state-success')?.classList.add('hidden');
    document.getElementById('state-error')?.classList.add('hidden');
    document.getElementById('state-multiple')?.classList.add('hidden');
}

/**
 * Displays error state with customized message.
 */
function showError(message) {
    hideAllStates();
    const errorState = document.getElementById('state-error');
    const subtitle = document.getElementById('error-subtitle');
    if (subtitle) {
        subtitle.textContent = message || 'The ID entered does not match any records in our database.';
    }
    errorState?.classList.remove('hidden');
}

/**
 * Displays verified certificate with public-facing rules:
 * Winner/Award -> Name + Award Category
 * Finalist -> Name + Track
 * Other certificates -> Name only
 * Private metadata (ID, team, institute, date) hidden unless explicitly required.
 */
function showCertificate(cert) {
    hideAllStates();
    const successState = document.getElementById('state-success');
    if (!successState) return;

    // Recipient Name
    const nameEl = document.getElementById('cert-name');
    if (nameEl) nameEl.textContent = cert.name || '---';

    // Category / Track logic
    const categoryItem = document.getElementById('cert-category-item');
    const categoryLabel = document.getElementById('cert-category-label');
    const categoryVal = document.getElementById('cert-category');

    const awardCategoryStr = (cert.awardCategory || '').trim();
    const domainStr = (cert.domain || '').trim();
    const typeStr = (cert.type || '').trim();

    let isWinner = false;
    let isFinalist = false;
    let categoryText = '';

    if (awardCategoryStr.includes('Track')) {
        isFinalist = true;
        categoryText = awardCategoryStr;
    } else if (awardCategoryStr) {
        isWinner = true;
        categoryText = awardCategoryStr;
    } else if (typeStr === 'Award Certificate' || domainStr.includes('Winner') || domainStr.includes('Award')) {
        isWinner = true;
        categoryText = domainStr || typeStr || 'Excellence Award';
    }

    if (isWinner && categoryItem && categoryLabel && categoryVal) {
        categoryLabel.textContent = 'Award Category';
        categoryVal.textContent = categoryText;
        categoryItem.classList.remove('hidden');
    } else if (isFinalist && categoryItem && categoryLabel && categoryVal) {
        categoryLabel.textContent = 'Track';
        categoryVal.textContent = categoryText;
        categoryItem.classList.remove('hidden');
    } else if (categoryItem) {
        categoryItem.classList.add('hidden');
    }

    // Hide private metadata fields
    ['cert-id-item', 'cert-series-item', 'cert-type-item', 'cert-institute-item', 'cert-date-item', 'cert-team-item'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });

    // Handle View Certificate and Download Certificate actions
    const viewBtn = document.getElementById('view-pdf-btn');
    const downloadBtn = document.getElementById('download-pdf-btn');
    const pdfUrl = cert.pdfUrl || '';

    if (pdfUrl && viewBtn) {
        viewBtn.href = pdfUrl;
        viewBtn.style.display = 'inline-flex';
        viewBtn.onclick = (e) => {
            e.preventDefault();
            window.open(pdfUrl, '_blank', 'noopener');
        };
    } else if (viewBtn) {
        viewBtn.style.display = 'none';
    }

    if (pdfUrl && downloadBtn) {
        const downloadUrl = getDownloadUrl(pdfUrl);
        downloadBtn.href = downloadUrl;
        downloadBtn.style.display = 'inline-flex';
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            window.open(downloadUrl, '_blank', 'noopener');
        };
    } else if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }

    successState.classList.remove('hidden');
}

/**
 * Displays selectable results for multiple name matches.
 */
function showMultipleMatches(matches, query) {
    hideAllStates();
    const multipleState = document.getElementById('state-multiple');
    const subtitle = document.getElementById('multiple-subtitle');
    const listEl = document.getElementById('multiple-matches-list');

    if (!multipleState || !listEl) return;

    if (subtitle) {
        subtitle.textContent = `Found ${matches.length} matching participants for "${query}". Select a participant to verify.`;
    }

    listEl.innerHTML = matches.map((cert, index) => {
        let categoryOrRole = '';
        if (cert.awardCategory) categoryOrRole = cert.awardCategory;
        else if (cert.type && cert.type !== 'Participation') categoryOrRole = cert.type;
        else if (cert.role) categoryOrRole = cert.role;

        return `
            <button type="button" class="name-match-card" data-match-index="${index}">
                <div class="name-match-info">
                    <span class="name-match-name">${escapeHtml(cert.name)}</span>
                    ${categoryOrRole ? `<span class="name-match-category">${escapeHtml(categoryOrRole)}</span>` : ''}
                </div>
                <div class="name-match-action">
                    <span>Verify</span>
                    <i class="ph-bold ph-arrow-right"></i>
                </div>
            </button>
        `;
    }).join('');

    listEl.querySelectorAll('[data-match-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.matchIndex, 10);
            if (matches[idx]) {
                const selected = matches[idx];
                showCertificate(selected);
                if (history.pushState) {
                    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(selected.certificateId)}`;
                    window.history.pushState({ id: selected.certificateId }, '', newUrl);
                }
            }
        });
    });

    multipleState.classList.remove('hidden');
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
            const queryNorm = normalizeText(nameQuery);

            const exactMatches = certificates.filter(c => normalizeText(c.name) === queryNorm);
            const startsWithMatches = certificates.filter(c => normalizeText(c.name).startsWith(queryNorm));
            const partialMatches = certificates.filter(c => normalizeText(c.name).includes(queryNorm));

            const matches = exactMatches.length ? exactMatches : (startsWithMatches.length ? startsWithMatches : partialMatches);

            if (!matches.length) {
                showError(`No certificate was found for "${nameQuery}".`);
                return;
            }

            if (matches.length === 1) {
                showCertificate(matches[0]);
                return;
            }

            showMultipleMatches(matches, nameQuery);
            return;
        }

        // --------------------------------------------------
        // 2. DIRECT CERTIFICATE ID
        // --------------------------------------------------
        if (directId) {
            const cert = certificates.find(item => {
                const itemPrimaryId = String(item.certificateId || '').toUpperCase();
                const itemLegacyId = String(item.legacyCertificateId || '').toUpperCase();

                if (itemPrimaryId === directId || itemLegacyId === directId) return true;

                // Fallback ID parsing
                const parsed = parseCertificateId(itemPrimaryId);
                const queryParsed = parseCertificateId(directId);
                if (queryParsed.series && queryParsed.number && parsed.series && parsed.number) {
                    return parsed.series === queryParsed.series && parsed.number === queryParsed.number;
                }

                return false;
            });

            if (!cert) {
                showError('The ID entered does not match any records in our database.');
                return;
            }

            showCertificate(cert);
            return;
        }

        // --------------------------------------------------
        // 3. SERIES + CERTIFICATE NUMBER SEARCH
        // --------------------------------------------------
        if (series && number) {
            const paddedTargetNumber = number.padStart(4, '0');
            const targetInt = parseInt(number, 10);

            const cert = certificates.find(item => {
                let itemSeries = (item.certificateSeries || '').toUpperCase();
                let itemNumber = (item.certificateNumber || '').toString();

                if (!itemSeries || !itemNumber) {
                    const parsed = parseCertificateId(item.certificateId);
                    if (!itemSeries) itemSeries = parsed.series;
                    if (!itemNumber) itemNumber = parsed.number;
                }

                if (itemSeries === series) {
                    if (itemNumber.padStart(4, '0') === paddedTargetNumber || parseInt(itemNumber, 10) === targetInt) {
                        return true;
                    }
                }

                // Check legacyCertificateId fallback
                if (item.legacyCertificateId) {
                    const parsedLegacy = parseCertificateId(item.legacyCertificateId);
                    if (parsedLegacy.series === series && (parsedLegacy.number === paddedTargetNumber || parseInt(parsedLegacy.number, 10) === targetInt)) {
                        return true;
                    }
                }

                return false;
            });

            if (!cert) {
                showError('The ID entered does not match any records in our database.');
                return;
            }

            showCertificate(cert);
            return;
        }

        showError('Please enter a valid certificate number or participant name.');
    } catch (err) {
        console.error('Verification error:', err);
        showError('Unable to load the certificate database. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', initializeVerification);