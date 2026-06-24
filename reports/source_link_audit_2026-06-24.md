# Source Link Audit - 2026-06-24

Checked **280 unique URLs** across **381 source contexts** after applying the first round of link fixes.

## Summary
- BLOCKED_OR_RESTRICTED: 22
- ERROR: 1
- OK: 241
- SERVER_ERROR: 2
- SSL_ERROR: 2
- TIMEOUT: 12

## Remaining Broken / High-Priority Fixes
- `ERROR` : https://seb-news.sanlam.co.za/wp-content/uploads/2025/03/Sanlam-Umbrella-Fund-Trustee-Report-2024_FINAL.pdf
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 218 | Sanlam Umbrella Fund | Sanlam Umbrella Fund Annual Trustee Report 2024 | S217
  - Error: ('Connection aborted.', ConnectionResetError(10054, 'An existing connection was forcibly closed by the remote host', None, 10054, None))
- `SERVER_ERROR` 500: https://impactalpha.com/pension-fund-in-uganda-readies-a-100-million-fund-of-funds-to-create-jobs-and-savers/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 174 | NSSF Uganda FoF | ImpactAlpha — Pension fund in Uganda readies a $100m fund of funds (Apr 2026) | S173
- `SERVER_ERROR` 500: https://impactalpha.com/ugandas-pension-fund-is-creating-new-savers-with-investments-in-small-business-and-agriculture-video/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 16 | NSSF Uganda | ImpactAlpha — Uganda's pension fund creates new savers via investments in small business and agriculture | S015
- `SSL_ERROR` : https://mediadr.sis.gov.eg/handle/123456789/51009
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 211 | NOSI / NSSA Egypt | Egypt SIS Arabic - NOSI annual report and final accounts FY2022/23 reviewed by Cabinet | S210
  - Error: HTTPSConnectionPool(host='mediadr.sis.gov.eg', port=443): Max retries exceeded with url: /handle/123456789/51009 (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1077)')))
- `SSL_ERROR` : https://sis.gov.eg/en/media-center/news/pm-reviews-social-insurance-finances-and-investment-growth/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 210 | NOSI / NSSA Egypt | Egypt Cabinet / SIS - NOSI annual report and final accounts FY2023/24 reviewed | S209
  - Error: HTTPSConnectionPool(host='sis.gov.eg', port=443): Max retries exceeded with url: /en/media-center/news/pm-reviews-social-insurance-finances-and-investment-growth/ (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer c

## Blocked / Manual Browser Check
These returned access restrictions or rate-limit style responses. They may still work for a human browser, but should be checked manually or replaced with archive/official alternatives if possible.
- `403` https://amcham.co.ke/node/876
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 149 | KEPFIC | AmCham Kenya — US announces new Kenyan pension consortium | S148
- `403` https://aujourdhui.ma/societe/amo-les-chiffres-de-la-cnss-en-2023
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 226 | CNSS Morocco | CNSS AMO statistical report 2023 coverage | S225
- `403` https://aujourdhui.ma/societe/cmr-la-pension-moyenne-mensuelle-des-nouveaux-retraites-etablie-a-10-966-dh
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 215 | CMR Morocco | CMR published 2023 activity report; portfolio value and asset mix coverage | S214
- `403` https://infracredit.ng/kfw-development-bank-invests-e31-million-surbordinated-capital-in-infracredit/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 190 | InfraCredit | KfW Development Bank invests EUR31m subordinated capital in InfraCredit | S189
- `403` https://infracredit.ng/nsia-invests-ngn10-billion-into-an-innovative-construction-finance-warehouse-facility-in-collaboration-with-infracredit-to-support-bankable-greenfield-infrastructure-project-finance-in-nigeria/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Inclusion Audit!Source URLs row 64 | 
- `403` https://www.amcham.co.ke/news/ascent-capital-seeks-120-million-east-africa-businesses
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 118 | Ascent Capital | Ascent Capital Seeks $120 Million for East Africa Businesses (AmCham Kenya) | S117
- `403` https://www.bii.co.uk/en/news-insight/news/bii-and-pic-announce-first-investment-under-new-partnership-to-drive-growth-for-african-businesses/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Inclusion Audit!Source URLs row 66 | 
- `403` https://www.bii.co.uk/en/news-insight/news/bii-napsa-and-swedfund-launch-growth-investment-partners-zambia-with-a-us-70-million-anchor-commitment-to-transform-sme-financing-in-zambia/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 97 | GIP Zambia | BII — BII, NAPSA and Swedfund launch Growth Investment Partners Zambia with $70m anchor (2025) | S096
- `403` https://www.bii.co.uk/en/news-insight/news/growth-investment-partners-welcomes-norfund-and-axis-pension-trustees-as-new-investors-strengthening-capital-base-to-scale-support-for-ghanaian-smes/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 76 | Axis Pension Trust | BII — GIP welcomes Norfund and Axis Pension Trustees as new investors (April 2026) | S075
- `403` https://www.bii.co.uk/en/our-impact/fund/africa-food-security-fund-i-investment-01/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Omission Candidates!Secondary source URL row 2 | Africa Food Security Fund (AFSF)
- `403` https://www.bii.co.uk/en/our-impact/fund/capital-alliance-private-equity-iv-cape-iv/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 148 | CAPE IV | BII — Capital Alliance Private Equity IV profile | S147
- `403` https://www.bii.co.uk/en/our-impact/fund/catalyst-fund-ii-lp-investment-01/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 102 | BII Catalyst Fund II | BII — Catalyst Fund II LP investment profile | S101
- `403` https://www.bii.co.uk/en/our-impact/fund/helios-clear-fund-scsp-investment-01/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 120 | Helios CLEAR Fund | BII — Helios CLEAR Fund SCSp investment profile | S119
- `403` https://www.bii.co.uk/en/our-impact/fund/vantage-mezzanine-iv-pan-african-sub-fund-investment-01/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 129 | Vantage Mezzanine IV | BII — Vantage Mezzanine IV Pan-African Sub-Fund profile | S128
- `403` https://www.bii.co.uk/our-impact/fund/sahel-capital-fafin/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 142 | Sahel Capital FAFIN | BII — Sahel Capital FAFIN profile | S141
- `403` https://www.graphic.com.gh/news/general-news/ghana-news-venture-capital-fund-invests-over-ghc359m-in-local-businesses.html
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 193 | VCTF Ghana / Oasis Capital | Graphic Online - Venture Capital Fund invests over GHc359m in local businesses | S192
- `403` https://www.moneyweb.co.za/news/south-africa/retirement-funds-set-up-forum-to-boost-infrastructure-investment/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 160 | AOFSA | Moneyweb — Retirement funds set up forum to boost infrastructure investment (2021) | S159
- `403` https://www.oecd.org/en/publications/africa-capital-markets-report-2025_7d26e1d3-en/full-report/the-role-of-insurance-companies-and-pension-funds-as-institutional-investors-in-african-capital-markets_4889d177.html
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 110 | Africa pension aggregate | OECD Africa Capital Markets Report 2025 — Insurance companies and pension funds as institutional investors | S109
- `403` https://www.oecd.org/en/publications/blended-finance-case-studies_2fb90b9a-en/infracredit-making-infrastructure-projects-in-nigeria-more-bankable-through-credit-enhancement_bdb679c6-en.html
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 191 | InfraCredit | InfraCredit: Making infrastructure projects in Nigeria more bankable through credit enhancement | S190
- `429` https://thebftonline.com/2023/08/02/mirepa-investment-advisors-announces-initial-close-of-mirepa-capital-sme-fund-i-2/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 168 | Mirepa Capital SME Fund I | B&FT — Mirepa Capital SME Fund I initial close | S167
- `429` https://thebftonline.com/2024/07/04/ssnit-shifts-investment-strategy/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 36 | SSNIT | SSNIT shifts investment strategy (B&FT) | S035
- `429` https://thebftonline.com/2026/04/08/gip-welcomes-norfund-axis-pension-trustees-as-new-investors/
  - Context: african_pf and swf_dataset_5.13.26.xlsx | Source Library!URL row 79 | Axis Pension Trust | B&FT — GIP welcomes Norfund, Axis Pension Trustees as new investors (8 April 2026) | S078

## Fixed In This Pass
- Replaced dead archived ARM-Harith/FSD Africa URL with live FSD Africa article.
- Replaced broken Savannah Impact Advisory URL with the Ci-Gaba fund page.
- Replaced dead old AVCA AfricInvest FIVE URLs with live AfricInvest pages.
- Replaced dead Prosper Africa `.gov` URL with Africa PSA mirror.
- Replaced dead PSSSF direct PDF URL with the live PSSSF official website.

Full CSV: `reports/source_link_audit_2026-06-24.csv`