# IKIGAI 2026 Certificate Verification System

Public certificate verification portal for IKIGAI 2026.

## Current certificate series

- **Series:** `IKIGAI26`
- **Certificate IDs:** `IKIGAI26-0001` through `IKIGAI26-0198`
- **Certificates:** 198 individual participant certificates
- **Verification URL:** `https://ijaitr.in/Hackathon-Certificate/`
- **QR:** one shared QR code on every certificate
- **PDF links:** populated from the generated Google Drive certificate records

## Verification flow

1. Scan the shared QR code or open the verification website.
2. Select the certificate series (`IKIGAI26`).
3. Enter the 4-digit certificate number, for example `0042`.
4. The site constructs `IKIGAI26-0042` internally and looks it up in `data/certificates.json`.
5. If verified, the generated Google Drive PDF link is available from the result.

## Data

The previous test dataset has been replaced with the Round 2 production dataset. The JSON contains 198 participants; the three records from `Test Team (Don't Verify)` are excluded.

## Deployment

This is a static HTML/CSS/JavaScript site and can be deployed to GitHub Pages, Netlify, or another static host.


## Final IKIGAI26 data normalization
- 199 participant certificates: IKIGAI26-0001 through IKIGAI26-0199.
- 157 special certificates: IKIGAI26-0200 through IKIGAI26-0356.
- Original special IDs are preserved in `legacyCertificateId` for direct-ID compatibility.
- HACK26 records are retained.
