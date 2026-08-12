/**
 * IKIGAI 2026 - Verification Logic
 * Verifies certificates using a series + short certificate number.
 */

const VerificationEngine = (() => {
    const API_ENDPOINT = 'data/certificates.json';

    const states = {
        loading: document.getElementById('state-loading'),
        success: document.getElementById('state-success'),
        error: document.getElementById('state-error')
    };

    const fields = {
        name: document.getElementById('cert-name'),
        id: document.getElementById('cert-id-display'),
        series: document.getElementById('cert-series'),
        type: document.getElementById('cert-type'),
        institute: document.getElementById('cert-institute'),
        team: document.getElementById('cert-team'),
        date: document.getElementById('cert-date'),
        timelineDate: document.getElementById('timeline-issued'),
        pdfBtn: document.getElementById('view-pdf-btn')
    };

    const init = async () => {
        const { series, number, legacyId } = getVerificationParams();

        if (!series || !number) {
            // Backward compatibility for direct old-style URLs during transition.
            if (!legacyId) {
                showState('error');
                return;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 900));
        performLookup(series, number, legacyId);
    };

    const getVerificationParams = () => {
        const params = new URLSearchParams(window.location.search);
        const series = (params.get('series') || '').trim().toUpperCase();
        const number = (params.get('number') || '').replace(/\D/g, '').padStart(4, '0').slice(-6);
        const legacyId = (params.get('id') || '').trim().toUpperCase().replace(/\s/g, '').replace(/-/g, '');
        return { series, number, legacyId };
    };

    const normalize = (value) => String(value || '').toUpperCase().replace(/\s/g, '').replace(/-/g, '');

    const performLookup = async (series, number, legacyId) => {
        try {
            const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
            if (!response.ok) throw new Error('Database connection failed');

            const data = await response.json();
            const targetId = series && number ? normalize(`${series}-${number}`) : legacyId;

            const record = data.find(item => normalize(item.certificateId) === targetId);

            if (record) {
                renderCertificate(record);
                showState('success');
            } else {
                showState('error');
            }
        } catch (error) {
            console.error('Verification Error:', error);
            showState('error');
            if (window.UIManager) UIManager.showToast('Unable to connect to verification server', 'error');
        }
    };

    const renderCertificate = (data) => {
        fields.name.textContent = data.name || '---';
        fields.id.textContent = data.certificateId || '---';
        fields.series.textContent = data.certificateSeries || '---';
        fields.type.textContent = data.type || 'Participation';
        fields.institute.textContent = data.institute || '---';
        fields.team.textContent = data.team || '---';
        fields.date.textContent = data.issueDate || '21 August 2026';
        fields.timelineDate.textContent = `Officially recorded on ${data.issueDate || '21 August 2026'}`;

        if (data.pdfUrl) {
            fields.pdfBtn.href = data.pdfUrl;
            fields.pdfBtn.style.display = 'inline-flex';
        } else {
            fields.pdfBtn.style.display = 'none';
        }
    };

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

        if (activeState === 'success') {
            document.title = `Verified: ${fields.name.textContent} | IKIGAI 2026`;
        } else if (activeState === 'error') {
            document.title = 'Verification Failed | IKIGAI 2026';
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', VerificationEngine.init);
