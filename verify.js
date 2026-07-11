async function verifyCertificate() {

    const loadingState =
        document.getElementById("loadingState");

    const result =
        document.getElementById("result");


    // READ CERTIFICATE ID FROM URL

    const params =
        new URLSearchParams(window.location.search);

    const certificateId =
        params.get("id");


    // INVALID URL

    if (!certificateId) {

        await delay(1000);

        loadingState.style.display = "none";

        showInvalidRequest();

        return;
    }


    try {

        // LOAD JSON DATABASE

        const response =
            await fetch("certificates.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load certificate database."
            );

        }


        const certificates =
            await response.json();


        // SEARCH CERTIFICATE

        const certificate =
            certificates.find(

                item =>

                    String(item.certificateId)
                        .trim()
                        .toUpperCase()

                    ===

                    String(certificateId)
                        .trim()
                        .toUpperCase()

            );


        // SMALL DELAY FOR VERIFICATION EFFECT

        await delay(1400);


        loadingState.style.display =
            "none";


        // CERTIFICATE FOUND

        if (certificate) {

            showVerifiedCertificate(
                certificate
            );

        }

        // CERTIFICATE NOT FOUND

        else {

            showCertificateNotFound(
                certificateId
            );

        }


    } catch (error) {

        console.error(error);


        await delay(800);


        loadingState.style.display =
            "none";


        showSystemError();

    }

}



/* =========================================
   VERIFIED CERTIFICATE
========================================= */


function showVerifiedCertificate(certificate) {

    const result =
        document.getElementById("result");


    const certificateLink =
        certificate.certificate || "";


    result.innerHTML = `

        <div class="result-card verified-result">

            <div class="success-animation">

                <div class="success-ring">

                    <span>✓</span>

                </div>

            </div>


            <div class="verified-badge">

                <span></span>

                AUTHENTIC CERTIFICATE

            </div>


            <h1>
                Certificate Verified
            </h1>


            <p class="result-description">

                This certificate has been successfully
                verified against the official
                IKIGAI 2026 certificate database.

            </p>


            <div class="participant-section">

                <span class="section-label">
                    CERTIFICATE ISSUED TO
                </span>


                <h2>
                    ${escapeHTML(certificate.name)}
                </h2>


                <p>
                    ${escapeHTML(
                        certificate.team || "Individual Participant"
                    )}
                </p>

            </div>


            <div class="certificate-information">


                <div class="info-item">

                    <span class="info-label">
                        Certificate ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            certificate.certificateId
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Certificate Type
                    </span>

                    <strong>
                        ${escapeHTML(
                            certificate.type ||
                            "Participation"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Team
                    </span>

                    <strong>
                        ${escapeHTML(
                            certificate.team ||
                            "—"
                        )}
                    </strong>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Domain
                    </span>

                    <strong>
                        ${escapeHTML(
                            certificate.domain ||
                            "—"
                        )}
                    </strong>

                </div>


            </div>


            <div class="verification-footer">

                <div class="database-status">

                    <span class="status-dot"></span>

                    Verified in official database

                </div>


                ${
                    certificateLink

                    ?

                    `

                    <a
                        href="${escapeAttribute(certificateLink)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="view-certificate-button"
                    >

                        <span>
                            View Certificate
                        </span>

                        <span>
                            ↗
                        </span>

                    </a>

                    `

                    :

                    `

                    <button
                        class="view-certificate-button disabled-button"
                        disabled
                    >

                        Certificate PDF Unavailable

                    </button>

                    `
                }

            </div>


            <a
                href="index.html"
                class="verify-another"
            >

                ← Verify another certificate

            </a>

        </div>

    `;

}



/* =========================================
   NOT FOUND
========================================= */


function showCertificateNotFound(certificateId) {

    const result =
        document.getElementById("result");


    result.innerHTML = `

        <div class="result-card error-result">


            <div class="error-icon">

                <span>×</span>

            </div>


            <div class="invalid-badge">

                VERIFICATION FAILED

            </div>


            <h1>

                Certificate Not Found

            </h1>


            <p class="result-description">

                We couldn't find a certificate matching
                the provided ID in the official database.

            </p>


            <div class="invalid-id-box">

                <span>
                    CERTIFICATE ID
                </span>


                <strong>

                    ${escapeHTML(certificateId)}

                </strong>

            </div>


            <a
                href="index.html"
                class="return-button"
            >

                Try Another Certificate

            </a>


        </div>

    `;

}



/* =========================================
   INVALID REQUEST
========================================= */


function showInvalidRequest() {

    const result =
        document.getElementById("result");


    result.innerHTML = `

        <div class="result-card error-result">

            <div class="error-icon">

                <span>!</span>

            </div>


            <h1>

                Invalid Verification Request

            </h1>


            <p class="result-description">

                No certificate ID was provided.

            </p>


            <a
                href="index.html"
                class="return-button"
            >

                Return to Verification Portal

            </a>

        </div>

    `;

}



/* =========================================
   SYSTEM ERROR
========================================= */


function showSystemError() {

    const result =
        document.getElementById("result");


    result.innerHTML = `

        <div class="result-card error-result">

            <div class="error-icon">

                <span>!</span>

            </div>


            <h1>

                Verification Unavailable

            </h1>


            <p class="result-description">

                The certificate database could not
                be loaded. Please try again later.

            </p>


            <a
                href="index.html"
                class="return-button"
            >

                Return Home

            </a>

        </div>

    `;

}



/* =========================================
   UTILITIES
========================================= */


function delay(milliseconds) {

    return new Promise(

        resolve =>

            setTimeout(
                resolve,
                milliseconds
            )

    );

}



function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}



function escapeAttribute(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll('"', "&quot;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;");

}



/* =========================================
   START VERIFICATION
========================================= */


verifyCertificate();