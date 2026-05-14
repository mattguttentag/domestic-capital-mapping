# African Pension Funds & SWFs → Alternative Assets: Dataset Brief

This document describes the workbook (`african_pf and swf_dataset_5.13.26.xlsx` or similar), a research dataset on African pension funds and sovereign wealth funds (SWFs) that have made commitments to alternative assets — defined as private equity / venture capital funds, private credit and infrastructure funds, and direct private-company equity / co-investments — as distinct from passive holdings in government bonds, treasuries, or listed equities.

The dataset was assembled across multiple research phases in May 2026 and is intended for academic policy research. This README briefs an engineer or AI agent building **data visualization tools** on top of the workbook.

---

## 1. What the dataset is for

The animating research question is: **which African pension funds and SWFs have made disclosed commitments to African alternative assets, and what does the resulting pattern tell us about institutional capital flows and policy levers?**

The dataset answers three layered sub-questions:

1. **Universe**: How many African pension funds and SWFs exist, where, and how large?
2. **Evidence**: Of that universe, which have made disclosed commitments to alts, to which funds/deals, and how much?
3. **Structure**: What are the institutional, regulatory, and DFI-anchored patterns that produce these commitments?

The dataset is biased toward **disclosed public evidence**. Aggregate AVCA / OECD figures show a much larger flow of African pension capital into alts than is individually traceable — the disclosure gap is itself a finding documented in the AVCA Aggregate vs Disclosed tab.

---

## 2. Workbook structure (14 tabs)

The tabs are ordered for analytical flow: universe first, then core fact tables, then aggregates, then reference, then analysis.

| # | Tab | Rows | Role | Visualization priority |
|---|---|---:|---|---|
| 1 | Sovereign Wealth Funds | 26 | Universe of African SWFs (operational + planned) | Medium |
| 2 | Pension Funds | 229 | Universe of African pension funds across all 54 countries | Medium |
| 3 | Tier 1 Candidates | 48 | Institutions with AUM ≥ ~USD 2bn (deep-dive priority list) | Medium |
| 4 | **Commitments Database** | **85** | **Core fact table: one row per disclosed allocator-to-fund/deal commitment** | **Highest** |
| 5 | **Pipeline & Mandates** | **12** | **Forward-looking targeted/expected/planned, MoU, and member-only mandate evidence separated from actual commitments** | High |
| 6 | **Funds & LP Co-Investors** | **32** | **Fund-level view: one row per fund with full LP composition** | **Highest** |
| 7 | **DFI Co-Investor Patterns** | **28** | **Frequency analysis: which DFIs / TA providers most often co-invest** | **Highest** |
| 8 | Country Summary | 54 | Formula-driven roll-up of #SWFs, #PFs, AUM per country | High |
| 9 | Methodology & Caveats | — | Inclusion criteria, confidence flags, look-through rule, scope decisions | (Reference) |
| 10 | Inclusion Audit | 55 | May 2026 include/exclude judgments for weak-evidence fund rows and mandate-like commitments | (Reference) |
| 11 | Source Library | 177 | Every URL cited, organized by allocator and source type | (Reference) |
| 12 | Absentees Investigation | 10 | Tier 1 allocators with NO disclosed commitments — regulatory vs. behavioural absence | High |
| 13 | Regulatory vs Behaviour | 20 | Permitted alts ceiling vs. actual allocation, per regulator | High |
| 14 | AVCA Aggregate vs Disclosed | — | Quantified disclosure gap (~30-40% of 2024 AVCA aggregate traceable) | High |

The three **Highest priority** tabs (4, 6, 7) are the central fact tables for any visualization. Tab 5 is the separate non-commitment pipeline category. Tabs 8, 12, 13, 14 carry the analytical findings. Tabs 1–3 give the universe denominator. Tabs 9–11 are reference material.

---

## 3. Detailed schemas for the core fact tables

### 3.1 Commitments Database (tab 4 — central fact table)

One row = one disclosed commitment from an African pension fund or SWF to a specific fund, deal, or platform. 85 commitments across vintages 2014–2026 from African pension/SWF allocators.

| Col | Field | Type | Notes |
|---|---|---|---|
| A | Allocator (institution) | string | Pension fund or SWF name; consortium members may appear as separate rows |
| B | Allocator country | string | One of 54 African countries, or "Multiple" for cross-border cohorts |
| C | Allocator type | string | `Public PF`, `Public PF (via mgr)`, `Parastatal PF`, `Civil-service PF`, `Corporate occupational PF`, `Tier 2/3 corporate trustee`, `PFA`, `PFA cohort`, `Pension fund cohort`, `SWF`, `SWF (strategic)`, `SWF (infra)`, `SWF (3 sub-funds)`, `SWF (sector-strategic)`, `SWF (NIF sub-fund)`, `Sovereign + pension manager`, `Sovereign`, `Sovereign (subsidiary of CDG)`, `Civil-service PF / Sovereign`, `Occupational PF (parastatal)`, `Occupational PF (central bank)`, `Public PF (mandatory)`, `Pension consortium (24 funds)`, `Pension consortium (12-15 funds)`, `Multi-employer PF (local gov't)`, `Multi-employer PF (motor industry)`, `Pension scheme cohort (via mgr)`, `Mixed institutional (incl. PFAs)` |
| D | Commitment type | string | `Fund LP`, `Fund LP (anchor)`, `Fund LP (via mgr)`, `Direct equity`, `Direct equity (shareholder)`, `Co-investment`, `Platform`, `Consortium member`, `Fund LP (eligible)`, `Fund LP (anchor of FoF)`, etc. |
| E | GP or counterparty | string | Fund manager or co-investing entity |
| F | Fund / Vehicle / Deal name | string | Specific vehicle name |
| G | Asset class | string | `PE`, `VC`, `Infrastructure`, `Private credit`, `Direct`, `PE / SME growth`, `FoF (PE/VC/Private credit)`, `Mixed`, etc. |
| H | Geographic focus | string | `Domestic`, `Pan-Africa`, regional, country names |
| I | Vintage / Year | string or int | Year of commitment; sometimes a range or `historical` |
| J | Commitment size (reported) | string | Money amount or `Not disclosed publicly` |
| K | Currency | string | `USD`, `ZAR`, `NGN`, `EUR`, `GBP`, `RWF`, `XOF`, `KES`, `MAD`, etc. |
| L | Disclosure type | string | `Press release`, `Trade press`, `Annual report`, `DFI co-disclosure`, `Allocator disclosure`, `GP disclosure` |
| M | Source (short) | string | Brief citation; full URLs in Source Library tab |
| N | Confidence | string | `H` / `M` / `L` (color-coded green / yellow / red) |
| O | Notes | string | Context, look-through attribution, structural significance |

**Important data-quality notes**:
- Allocator and fund names are **not normalized** — the same entity may appear under slightly different name strings. Build a canonicalization map before entity-level analytics.
- Commitment sizes are heterogeneous: explicit USD, local currency, "share of $X total close", or "not disclosed". For aggregations, parse with regex and reconcile using the reporting-year context in column O.
- Some allocators appear multiple times for different funds (e.g., PIC SA appears ~10 times, NSIA ~5 times). Don't dedupe naively.
- `Confidence = L` rows are estimated and should be excluded from headline aggregates by default.

### 3.2 Pipeline & Mandates (tab 5 — non-commitment pipeline table)

One row = one targeted, expected, planned, MoU/mandate, or member-only mandate evidence point. These rows are intentionally excluded from the Commitments Database until public evidence shows an actual allocator-to-vehicle commitment. Use this table for pipeline analysis, not closed-commitment counts.

### 3.3 Funds & LP Co-Investors (tab 6 — fund-level fact table)

One row = one fund/vehicle with at least one African PF/SWF LP, with the full LP composition. 32 vehicles.

| Col | Field | Type | Notes |
|---|---|---|---|
| A | Fund / Vehicle | string | Vehicle name |
| B | Manager / GP | string | GP firm |
| C | Vintage | string or int | Year or year range |
| D | Fund size (USD m) | string | Numeric or descriptive (e.g. "200 first close (target 400)") |
| E | Asset class | string | (Same vocabulary as Commitments Database col G) |
| F | Geographic focus | string | (Same vocabulary as Commitments Database col H) |
| G | African PF/SWF LPs (count) | string or int | Count or "multiple" / "cohort" / "n named PFs + categorical" |
| H | Named African PF/SWF LPs | string | Semicolon-separated list of named allocators |
| I | DFI LPs (count) | int or string | Numeric count |
| J | Named DFI LPs | string | Semicolon-separated list of named DFIs |
| K | Other named LPs | string | Family offices, foundations, endowments |
| L | Co-investor pattern note | string | Structural commentary |

**This is the right table for co-investor network and Sankey visualizations.** The Commitments Database has more rows but only one allocator per row; this tab gives you the full LP composition per fund.

### 3.4 DFI Co-Investor Patterns (tab 7 — frequency table)

One row = one DFI or technical-assistance provider, ranked by how many funds-with-African-PF-LPs they appear in. 28 entities after the May 2026 inclusion audit.

| Col | Field | Type | Notes |
|---|---|---|---|
| A | DFI / Catalytic capital provider | string | Entity name |
| B | Co-investments in funds with African PF/SWF LP | int | Frequency count — primary metric for visualization |
| C | Notable vehicles | string | Semicolon-separated list of vehicles |
| D | Strategic role | string | Qualitative role description |
| E | Frequency tier | string | `1 (Top tier)` / `2 (Active)` / `3 (Selective)` / variants |

Color-coded with a ColorScaleRule on column B.

The frequency table was refreshed after removing DFI-only, planned, expected, targeted, generic LP-base, and MoU-only rows. It now counts only retained vehicles with African PF/SWF involvement, plus separately labelled TA providers for KEPFIC and AOFSA.

A `MiDA Advisors / USAID / World Bank / CrossBoundary` category (count = 2 each) is tracked separately as **technical-assistance providers** rather than DFIs — they catalyse consortium structures (KEPFIC, AOFSA) rather than individual fund commitments. This is a meaningful distinction for the policy story.

---

## 4. Other tabs (supporting context)

### Sovereign Wealth Funds (tab 1) and Pension Funds (tab 2)

The universe of African allocators. Schema:

| Column | Notes |
|---|---|
| Country, Institution, Type, Established, AUM (USD m, approx), As-of year, Currency basis, Owner/Regulator, Public reporting, Confidence, Notes |

229 pension fund rows + 26 SWF rows = ~255 institutions across 54 countries.

### Tier 1 Candidates (tab 3)

48 institutions filtered to AUM ≥ ~USD 2bn — the deep-dive priority list. Useful for sizing visualizations and for filtering noise.

### Country Summary (tab 8)

Formula-driven roll-up by country. Six columns: Country, # SWFs, # PFs, SWF AUM, PF AUM, Combined. **South Africa, Egypt, Morocco, and Libya hold ~73% of catalogued institutional AUM (~USD 643bn total).**

### Methodology & Caveats (tab 9)

Documents inclusion criteria, confidence flag definitions, the look-through methodology rule, and the scope decision that excludes DFIs / asset managers / commercial banks from the Commitments Database. Read before doing any aggregation.

### Inclusion Audit (tab 10)

55 entries documenting the May 2026 inclusion audit. This tab records include/exclude decisions for rows with weak African PF/SWF evidence, mandate-like rows, and member-only rows removed from the Commitments Database.

### Source Library (tab 11)

177 entries — every URL used, organized by allocator and source type. Schema: Allocator, Source type, Title / publication, Date accessed, URL, Used for.

### Absentees Investigation (tab 12)

10 Tier 1 allocators with no disclosed commitments, classified by reason: regulatory constraint (NOSI Egypt, POESSA Ethiopia pre-2022, PSSSF Tanzania), behavioural (NSSF Kenya, with active expansion underway), or political constraint (LIA Libya under sanctions).

### Regulatory vs Behaviour (tab 13)

For each top-20 allocator: regulator + key regulation, permitted alts ceiling, actual alts allocation, headroom unused, story. Two columns of interest for visualization: permitted % vs. actual % (paired bar chart).

### AVCA Aggregate vs Disclosed (tab 14)

Documents the disclosure gap between AVCA's aggregate African-LP capital figure (USD 639m in 2024) and traceable allocator-fund pairs (~USD 200m in 2024, ~$130-280m range). Also documents the cumulative database growth (27 → 85 commitments across all vintages after the May 2026 inclusion audit) and the breakdown by fund (Africa50-IAF, Adenia V, FONSIS-Oyass, etc.).

---

## 5. Key analytical dimensions for visualization

### Geographic
- 54 African countries
- Sub-regions: North Africa, Sub-Saharan Africa, East Africa, West Africa (CIPRES zone), Southern Africa
- Anglophone / Francophone / Lusophone / Arabophone splits

### Temporal
- Commitment vintages 2014–2026
- Regulatory milestones: SA Reg 28 amendment (Jan 2023), Nigeria PenCom revision (Sept 2025), Ethiopia POESSA liberalisation (2022), Ghana 5% alts rule (2025-26)

### Asset class
- PE, VC, Private credit, Infrastructure, Direct equity, Co-investment, Fund-of-Funds, Platform equity

### Allocator type
- Public PF (largest in absolute AUM), SWF (most disclosed per institution), Tier 2/3 corporate trustee (Ghana model), PFA (Nigeria), Pension consortium (KEPFIC, AOFSA)

### Policy archetypes (the headline finding)
Four structural archetypes are visible in the data:
1. **Mandated unlisted** — Namibia (GIPF, Reg 28/29) — *floor with SPV requirement*
2. **Mandated minimum** — Ghana (5% alts rule for Tier 2/3 trustees)
3. **Cap-doubling + product design** — Nigeria (PenCom Sept 2025; ARM-Harith ACT Fund local-currency tranche)
4. **Pooled consortium with DFI/TA** — Kenya (KEPFIC, USD 5.2bn member AUM, 24 funds) + South Africa (AOFSA, USD ~200bn member AUM, 15 funds)

The pooled-consortium archetype is the model with demonstrated scale (AOFSA exceeded its 5-year infrastructure target in year one). For policy research this should be the headline visualization story.

---

## 6. Suggested visualizations

### Tier 1 (highest analytical value)

1. **Allocator-Fund co-investment network graph (force-directed)**
   - Nodes: allocators (PF/SWF) + funds + DFIs
   - Edges: commitments
   - Color allocators by country, funds by asset class, DFIs by frequency tier
   - Source: Commitments Database + Funds & LP Co-Investors tabs
   - Expected insight: BII / FMO / Norfund clustering at the centre; isolated nodes are first-mover allocators

2. **Sankey: Allocator country → Asset class → GP / Vehicle**
   - Source: Commitments Database
   - Width by reported commitment size (USD m); fall back to count where size not disclosed
   - Highlights concentration in SA → Pan-African PE and Ghana → SME debt

3. **Regulatory headroom paired bar chart**
   - For each top-20 allocator: permitted alts % vs. actual %
   - Source: Regulatory vs Behaviour tab
   - The gap between bars is the policy-relevant finding

4. **DFI co-investor frequency bar chart with TA-provider overlay**
   - Source: DFI Co-Investor Patterns tab
   - Group by tier: DFI top (9), DFI second (5-8), DFI selective (1-4), TA providers (2)
   - Distinct visual treatment for TA providers (USAID, MiDA, WB, CrossBoundary, Batseta)

5. **Commitments-over-time bar/area chart**
   - X-axis: vintage year (2014-2026)
   - Y-axis: count of disclosed commitments
   - Stack by allocator country or by archetype
   - Source: Commitments Database column I
   - Captures the historical first-mover wave (2014 KPLC, 2017 BPOPF, 2018 CBK Pension Fund), the AVCA-growth wave (2022-24), and the regulatory-mandate wave (2024-26)

### Tier 2 (informative supplements)

6. **Country choropleth map**: institutional AUM per country, with SWFs vs PFs as toggle. Source: Country Summary tab.

7. **AVCA disclosure-gap waterfall**: USD 639m aggregate → named allocators → categorical cohorts → untraceable. Source: AVCA Aggregate vs Disclosed tab.

8. **Funnel chart**: Universe (~255 institutions) → Tier 1 (48 large enough to deploy alts) → With disclosed evidence (~30 allocators) → With multiple disclosed commitments (~12 allocators).

9. **AOFSA + KEPFIC pension-consortium dashboard**:
   - Member counts (15 vs 24)
   - Aggregate AUM (USD 200bn vs USD 5.2bn)
   - Cumulative committed (USD 400m vs not separately disclosed)
   - Founding year (2021 vs 2020)
   - Common TA providers (USAID + MiDA + World Bank)

10. **Vehicle composition stacked bars**: For each named fund in the Funds tab, stacked bar of African PF/SWF LPs vs DFI LPs vs Other named LPs vs Untraced. Source: Funds & LP Co-Investors tab. Best visualizes the structural archetype split (DFI-anchored SME platforms vs pan-African flagship PE vs continental equity vehicles).

### Tier 3 (interactive / exploratory)

11. **Allocator profile cards** with their disclosed commitments, sourced from the Commitments Database filtered by allocator name. Useful for individual deep-dives.

12. **GP profile cards** with their LP roster, sourced from Funds & LP Co-Investors. Useful for GP-side analysis.

13. **Confidence-flag filter** as a global UI control: hide L-confidence rows to see only well-evidenced data.

---

## 7. Data quality and methodology caveats

The Methodology & Caveats tab documents the scope decisions in full. The visualization-relevant items:

- **AUM figures** are USD-converted approximations with as-of years noted. They reflect FX as much as portfolio performance. For time series, do not interpolate or chain across years without an FX adjustment.
- **Confidence flags**: H = audited annual report or regulator return within 18 months. M = secondary databases or trade press. L = estimated / dated / inferred. Default to H+M for any "headline figure" claim.
- **Look-through methodology**: GEPF's commitments are tracked under "PIC (mgr for GEPF)" because PIC is the asset manager; the ultimate asset owner is GEPF. The same applies to SA umbrella DC funds (managed by Old Mutual, Sanlam, Alexforbes) and Moroccan parastatal pensions (managed by CDG). For per-country aggregations, attribute to the country of the **ultimate asset owner**, not the intermediary.
- **Sovereign edge cases**: Three rows in the Commitments Database are sovereign-government direct equity in AFC (Côte d'Ivoire, Sierra Leone, Egypt governments). They are kept because functionally similar to SWF deployment, but are NOT pension funds. Tag them explicitly in visualizations if pension-only views are needed.
- **Categorical cohort entries** ("Multiple Nigerian PFAs", "Multiple Kenyan pension funds", etc.) represent disclosed pension fund cohort participation where individual scheme names are not in the source. Don't count them as 1 allocator — they represent N > 1 allocators.
- **The 85 commitments are heavily biased toward vehicles with public allocator-level evidence** because that's where named LP disclosure is densest. DFI-only, planned, expected, targeted, generic LP-base, and MoU-only rows were removed in the May 2026 inclusion audit; pan-African flagship PE funds and SA institutional pools may have more African PF LPs than appear here where they are not publicly named at fund-close level.

---

## 8. Loading and parsing technical notes

The workbook is an Excel `.xlsx` file. Recommended Python loading:

```python
import pandas as pd

# Load all sheets at once
sheets = pd.read_excel('african_pf_and_swf_dataset.xlsx', sheet_name=None)

# Core fact tables
commitments = sheets['Commitments Database']
funds = sheets['Funds & LP Co-Investors']
dfi_patterns = sheets['DFI Co-Investor Patterns']

# Universe tabs
swfs = sheets['Sovereign Wealth Funds']
pensions = sheets['Pension Funds']
tier1 = sheets['Tier 1 Candidates']
country_summary = sheets['Country Summary']

# Reference + analysis
methodology = sheets['Methodology & Caveats']
sources = sheets['Source Library']
absentees = sheets['Absentees Investigation']
regulatory = sheets['Regulatory vs Behaviour']
avca_gap = sheets['AVCA Aggregate vs Disclosed']
```

For preserving formulas and formatting, use `openpyxl`:

```python
from openpyxl import load_workbook
wb = load_workbook('african_pf_and_swf_dataset.xlsx', data_only=False)  # formulas
wb_values = load_workbook('african_pf_and_swf_dataset.xlsx', data_only=True)  # calculated values
```

**Header rows are not always at row 1.** Commitments Database, Pension Funds, SWFs, Source Library, and DFI Co-Investor Patterns have headers at row 1 (after a section title row). Country Summary, Tier 1 Candidates, Funds & LP Co-Investors, Regulatory vs Behaviour, Absentees Investigation, and AVCA Aggregate vs Disclosed have headers on row 3 (after a merged title row at row 1 and a blank row at row 2). Inspect with `pd.read_excel(sheet_name=X, header=None).head(5)` first.

**Conditional formatting** on confidence columns (column N in Commitments Database, column J in Pension Funds) uses CellIsRule with H = green, M = yellow, L = red. When parsing into pandas, retain the string values; visualization tooling can re-apply the color scheme.

**Frozen panes and auto-filters** are set on most major tabs — preserve them on round-trip if writing back to Excel.

---

## 9. Source provenance

Every claim in the workbook is sourced — the Source Library tab (177 rows) lists every URL used to assemble the dataset, organized by allocator and source type. For academic citation:

- **Allocator-side**: regulator filings (FSCA, PenCom, RBA, NPRA, CIPRES, ACAPS), annual reports, allocator websites
- **GP-side**: fund-close press releases, GP corporate sites, AVCA member announcements
- **DFI-side**: BII, FMO, Norfund, Proparco, FSDA, IFC project disclosures, EIB equity fund pages, World Bank documents
- **Trade press**: Africa Global Funds, Africa Private Equity News, ImpactAlpha, WeeTracker, Ecofin Agency, Cytonn, Reuters Africa, regional outlets
- **Aggregate research**: AVCA APCA reports, OECD Africa Capital Markets Report 2025, USAID INVEST publications, World Bank pension reports

Each Commitments Database row has a `Source (short)` column referencing a Source Library entry. Build a join key on allocator name to cross-reference.

---

## 10. Glossary

| Term | Definition |
|---|---|
| AOFSA | Asset Owners Forum of South Africa (founded 2021; 15 SA pension funds; ~USD 200bn aggregate AUM; modelled on KEPFIC) |
| AVCA | African Private Equity and Venture Capital Association — produces the African Private Capital Activity Report (APCA) |
| CIPRES | Conférence Interafricaine de la Prévoyance Sociale — regulator for Francophone West & Central African social security funds |
| DFI | Development Finance Institution (BII, FMO, Norfund, IFC, EIB, etc.) |
| FoF | Fund of Funds |
| FSDAi | FSD Africa Investments — UK FCDO catalytic capital arm specialising in African pension capital mobilisation |
| KEPFIC | Kenya Pension Funds Investment Consortium (founded 2020; 24 Kenyan pension funds; USD 5.2bn aggregate AUM) |
| NPRA | National Pensions Regulatory Authority (Ghana) |
| PenCom | National Pension Commission (Nigeria) |
| PFA | Pension Fund Administrator (Nigerian licensed pension manager under the Contributory Pension Scheme) |
| RBA | Retirement Benefits Authority (Kenya) |
| Reg 28 | South African Pension Funds Act Regulation 28 (sets investment limits; amended Jan 2023 to raise PE cap from 10% to 15%) |
| SWF | Sovereign Wealth Fund |
| TA | Technical Assistance |
| URBRA | Uganda Retirement Benefits Regulatory Authority |

---

## 11. Open questions the dataset can support

A visualization tool built on this dataset should be able to answer:

1. **By country, which African pension/SWF allocators have disclosed alts commitments, and at what scale?**
2. **For each major African-focused PE/infra GP, what is the African pension/SWF LP base?**
3. **Which DFIs most reliably crowd in African pension capital, in which sectors and markets?**
4. **What is the regulatory ceiling vs actual alts allocation for each Tier 1 allocator, and where is the headroom largest?**
5. **How has the count, size, and geographic distribution of commitments evolved over 2014-2026?**
6. **Which fund vehicles have the highest concentration of African pension LP participation, and what structural features do they share (local currency, FoF, mandated minimum, etc.)?**
7. **Where is the AVCA-aggregate-vs-named-commitment gap largest, and what disclosure regime would close it?**

The headline policy story the data tells: **pooled consortium structures with DFI technical assistance (KEPFIC + AOFSA) outperform every other archetype on scale and deployment velocity**. Visualizations that surface that finding cleanly will be the most useful.

---

*Dataset compiled May 2026. Sources current as of fetch dates noted in the Source Library tab.*
