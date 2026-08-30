/**
 * IKIGAI 2026 Certificate Verification System
 *
 * Public display rules:
 *
 * WINNER:
 *   Name
 *   Award Category
 *
 * FINALIST:
 *   Name
 *   Track
 *
 * MENTOR / JURY / FACULTY / VOLUNTEER / OTHER:
 *   Name only
 *
 * Never publicly display:
 *   Certificate ID
 *   Certificate Number
 *   Institute / Organization
 *   Team
 */

const DATA_URL = 'data/certificates.json';

const params = new URLSearchParams(window.location.search);


/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
}


function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));
}


function getDownloadUrl(url) {
    if (!url) return '';

    const match = String(url).match(/\/d\/([^/]+)/);

    if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    return url;
}


/* =========================================================
   LOAD DATABASE
========================================================= */

async function loadCertificates() {

    const response = await fetch(DATA_URL, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(
            `Certificate database could not be loaded. HTTP ${response.status}`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Certificate database format is invalid.');
    }

    return data;
}


/* =========================================================
   PAGE STATES
========================================================= */

function showLoading() {

    const loading = document.getElementById('state-loading');
    const success = document.getElementById('state-success');
    const error = document.getElementById('state-error');

    if (loading) loading.classList.remove('hidden');
    if (success) success.classList.add('hidden');
    if (error) error.classList.add('hidden');
}


function showSuccessState() {

    const loading = document.getElementById('state-loading');
    const success = document.getElementById('state-success');
    const error = document.getElementById('state-error');

    if (loading) loading.classList.add('hidden');
    if (success) success.classList.remove('hidden');
    if (error) error.classList.add('hidden');
}


function showErrorState(message) {

    const loading = document.getElementById('state-loading');
    const success = document.getElementById('state-success');
    const error = document.getElementById('state-error');

    if (loading) loading.classList.add('hidden');
    if (success) success.classList.add('hidden');
    if (error) error.classList.remove('hidden');

    const subtitle =
        error?.querySelector('.status-subtitle');

    if (subtitle) {
        subtitle.textContent = message;
    }
}


/* =========================================================
   CERTIFICATE CATEGORY
========================================================= */

function getCertificateCategory(certificate) {

    const domain = normalizeText(certificate.domain);
    const type = normalizeText(certificate.type);
    const category = normalizeText(certificate.category);
    const sourceGroup = normalizeText(certificate.sourceGroup);

    /*
     * Winner
     */
    if (
        domain === 'WINNER' ||
        category === 'WINNER' ||
        sourceGroup === 'WINNERS'
    ) {
        return 'winner';
    }

    /*
     * Finalist
     */
    if (
        domain === 'FINALIST' ||
        category === 'FINALIST' ||
        sourceGroup === 'FINALISTS' ||
        type === 'FINALIST CERTIFICATE'
    ) {
        return 'finalist';
    }

    /*
     * Everything else
     */
    return 'other';
}


/* =========================================================
   PUBLIC DETAILS
========================================================= */

function hideDetail(elementId) {

    const element = document.getElementById(elementId);

    if (!element) return;

    const item = element.closest('.detail-item');

    if (item) {
        item.style.display = 'none';
    }
}


function showDetail(
    elementId,
    labelText,
    value
) {

    const element = document.getElementById(elementId);

    if (!element) return;

    const item = element.closest('.detail-item');

    if (!item) return;

    item.style.display = '';

    const label = item.querySelector('label');

    if (label) {
        label.textContent = labelText;
    }

    element.textContent = value || '---';
}


function updatePublicDetails(certificate) {

    const nameElement =
        document.getElementById('cert-name');

    /*
     * Name is ALWAYS public.
     */
    if (nameElement) {
        nameElement.textContent =
            certificate.name || '---';
    }


    /*
     * Hide all fields that should NOT be public.
     */
    hideDetail('cert-id-display');
    hideDetail('cert-series');
    hideDetail('cert-institute');
    hideDetail('cert-date');
    hideDetail('cert-team');


    /*
     * Also hide certificate type by default.
     */
    hideDetail('cert-type');


    const category =
        getCertificateCategory(certificate);


    /* -----------------------------------------------------
       WINNER
    ----------------------------------------------------- */

    if (category === 'winner') {

        const award =
            certificate.awardCategory ||
            certificate.awardTrack ||
            certificate.track ||
            certificate.domain ||
            'Winner';

        showDetail(
            'cert-type',
            'Award Category',
            award
        );

        return;
    }


    /* -----------------------------------------------------
       FINALIST
    ----------------------------------------------------- */

    if (category === 'finalist') {

        const track =
            certificate.track ||
            certificate.awardTrack ||
            certificate.awardCategory ||
            certificate.domain ||
            'Finalist';

        showDetail(
            'cert-type',
            'Track',
            track
        );

        return;
    }


    /*
     * Mentor / Jury / Faculty / Volunteer / Other
     *
     * Name only.
     */
}


/* =========================================================
   PDF BUTTONS
========================================================= */

function setupPdfButtons(certificate) {

    const viewButton =
        document.getElementById('view-pdf-btn');

    const downloadButton =
        document.getElementById('download-pdf-btn');

    const pdfUrl =
        certificate.pdfUrl || '';

    const downloadUrl =
        getDownloadUrl(pdfUrl);


    /*
     * VIEW CERTIFICATE
     */
    if (viewButton) {

        if (pdfUrl) {

            viewButton.href = pdfUrl;
            viewButton.target = '_blank';
            viewButton.rel = 'noopener noreferrer';

            viewButton.style.display = 'inline-flex';

        } else {

            viewButton.style.display = 'none';
        }
    }


    /*
     * DOWNLOAD CERTIFICATE
     */
    if (downloadButton) {

        if (downloadUrl) {

            downloadButton.href = downloadUrl;
            downloadButton.target = '_blank';
            downloadButton.rel = 'noopener noreferrer';

            downloadButton.style.display = 'inline-flex';

        } else {

            downloadButton.style.display = 'none';
        }
    }
}


/* =========================================================
   SHOW VERIFIED CERTIFICATE
========================================================= */

function showCertificate(certificate) {

    /*
     * IMPORTANT:
     *
     * We DO NOT replace the HTML.
     *
     * verify.html already contains the complete
     * designed verification interface.
     */

    updatePublicDetails(certificate);

    setupPdfButtons(certificate);


    /*
     * Verification trace
     */
    const timeline =
        document.getElementById('timeline-issued');

    if (timeline) {

        timeline.textContent =
            'Officially recorded in the IKIGAI 2026 certificate database.';
    }


    /*
     * Show existing UI.
     */
    showSuccessState();
}


/* =========================================================
   NAME SEARCH
========================================================= */

function showNameMatches(matches, query) {

    /*
     * For multiple matches, use the existing success
     * container only for the selection list.
     */

    const success =
        document.getElementById('state-success');

    if (!success) return;


    success.innerHTML = `

        <div class="status-banner success">

            <div class="status-icon">
                <i class="ph-bold ph-check"></i>
            </div>

            <h1 class="status-title">
                Matching Participants
            </h1>

            <p class="status-subtitle">
                ${matches.length}
                matching participant${matches.length === 1 ? '' : 's'}
                found for "${escapeHtml(query)}".
            </p>

        </div>


        <div class="certificate-details">

            <div class="name-match-list">

                ${matches.map(cert => `

                    <button
                        type="button"
                        class="name-match-card"
                        data-certificate-id="${escapeHtml(cert.certificateId)}"
                    >

                        <span class="name-match-name">
                            ${escapeHtml(cert.name)}
                        </span>

                    </button>

                `).join('')}

            </div>

        </div>


        <div class="action-area">

            <a
                href="index.html"
                class="btn btn-outline"
            >
                <i class="ph-bold ph-arrow-left"></i>
                <span>Back to Home</span>
            </a>

        </div>
    `;


    /*
     * Attach selection handlers.
     */

    success
        .querySelectorAll('[data-certificate-id]')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const id =
                        button.dataset.certificateId;

                    window.location.href =
                        `verify.html?id=${encodeURIComponent(id)}`;
                }
            );
        });


    showSuccessState();
}


/* =========================================================
   FIND CERTIFICATE
========================================================= */

async function initializeVerification() {

    showLoading();

    try {

        const certificates =
            await loadCertificates();


        const directId =
            (params.get('id') || '')
                .trim()
                .toUpperCase();


        const nameQuery =
            (params.get('name') || '')
                .trim();


        const series =
            (params.get('series') || '')
                .trim()
                .toUpperCase();


        const number =
            (params.get('number') || '')
                .trim();


        /* -------------------------------------------------
           1. CERTIFICATE ID
        ------------------------------------------------- */

        if (directId) {

            const certificate =
                certificates.find(item =>
                    normalizeText(item.certificateId) ===
                    directId
                );


            if (!certificate) {

                showErrorState(
                    'The ID entered does not match any records in our database.'
                );

                return;
            }


            showCertificate(certificate);

            return;
        }


        /* -------------------------------------------------
           2. NAME SEARCH
        ------------------------------------------------- */

        if (nameQuery) {

            const query =
                normalizeText(nameQuery);


            const exactMatches =
                certificates.filter(certificate =>
                    normalizeText(certificate.name) === query
                );


            const startsWithMatches =
                certificates.filter(certificate =>
                    normalizeText(certificate.name)
                        .startsWith(query)
                );


            const containsMatches =
                certificates.filter(certificate =>
                    normalizeText(certificate.name)
                        .includes(query)
                );


            const matches =
                exactMatches.length
                    ? exactMatches
                    : startsWithMatches.length
                        ? startsWithMatches
                        : containsMatches;


            if (!matches.length) {

                showErrorState(
                    `No certificate was found for "${nameQuery}".`
                );

                return;
            }


            if (matches.length === 1) {

                showCertificate(matches[0]);

                return;
            }


            showNameMatches(
                matches,
                nameQuery
            );

            return;
        }


        /* -------------------------------------------------
           3. SERIES + NUMBER
        ------------------------------------------------- */

        if (series && number) {

            const certificate =
                certificates.find(item => {

                    const itemSeries =
                        normalizeText(
                            item.certificateSeries
                        );


                    const itemNumber =
                        String(
                            item.certificateNumber || ''
                        ).padStart(4, '0');


                    return (
                        itemSeries === series &&
                        itemNumber ===
                            number.padStart(4, '0')
                    );
                });


            if (!certificate) {

                showErrorState(
                    'The certificate number does not match any records in our database.'
                );

                return;
            }


            showCertificate(certificate);

            return;
        }


        /* -------------------------------------------------
           4. NOTHING PROVIDED
        ------------------------------------------------- */

        showErrorState(
            'Please enter a valid certificate ID or participant name.'
        );

    }

    catch (error) {

        console.error(
            'Certificate verification error:',
            error
        );


        showErrorState(
            'Unable to load the certificate database. Please try again.'
        );
    }
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    initializeVerification
);