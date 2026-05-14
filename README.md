# African PF & SWF Capital Mapping

An interactive visualization tool for exploring disclosed alternative-asset commitments by African pension funds and sovereign wealth funds (SWFs).

**Live tool →** [GitHub Pages link once deployed]

---

## What this shows

The dataset covers **85 disclosed commitments** from African pension funds and SWFs to private equity, infrastructure, venture capital, private credit, and direct equity vehicles — spanning vintages 2014–2026 across 54 countries.

The animating research question: *which African institutional investors have committed to African alternative assets, to which funds, and what role do DFIs play in catalysing those commitments?*

---

## Tool features

| Tab | What you can do |
|---|---|
| **Overview** | Key stats, top allocators, asset class mix, policy archetypes |
| **Institutions** | Search & filter all 255 African pension funds and SWFs by country, type, AUM, confidence |
| **Commitments & Funds** | Browse the 85-row commitment database; explore 32 fund vehicles with full LP composition |
| **Pipeline & Mandates** | Review 12 targeted, expected, planned, MoU, and member-only mandate rows separately from actual commitments |
| **DFI Network** | Force-directed graph: DFIs (amber diamonds) + allocators + funds as nodes; click to highlight co-investor clusters |
| **Charts & Analysis** | DFI frequency bar chart, commitments-over-time, regulatory ceiling vs. actual allocation, disclosure gap summary |

---

## Deploying to GitHub Pages

1. Fork or clone this repo
2. Go to **Settings → Pages**, set source to `main` branch, root folder
3. The site is static HTML/JS — no build step needed

---

## Regenerating the data

The data layer is pre-extracted to `data/data.js`. To update from the source Excel file:

```bash
pip install pandas openpyxl
python extract_data.py
```

This reads `african_pf and swf_dataset_5.13.26.xlsx` and writes `data/data.js` (~340 KB).

---

## Data sources & methodology

See [`pf swf readme.txt`](pf%20swf%20readme.txt) for the full dataset brief, including:
- Schema for all 14 workbook tabs
- Confidence flag definitions (H / M / L)
- Look-through methodology (PIC managing GEPF, CDG managing Moroccan parastatals)
- Inclusion criteria and scope decisions
- Source provenance (177 cited URLs)

**Key caveat:** The dataset is biased toward disclosed public evidence. AVCA aggregate figures suggest ~USD 639m in African LP capital flowed to African alts in 2024; only ~USD 200m is traceable to named allocator-fund pairs. The disclosure gap is itself a finding.

---

## Tech stack

- Vanilla HTML / CSS / JavaScript — no framework, no build step
- [D3.js v7](https://d3js.org/) — force-directed network graph
- [Chart.js v4](https://www.chartjs.org/) — DFI frequency, vintage, and regulatory charts
- Python + pandas + openpyxl — data extraction script

---

## Citing

Dataset compiled May 2026. Sources current as of fetch dates noted in the Source Library tab of the workbook.
