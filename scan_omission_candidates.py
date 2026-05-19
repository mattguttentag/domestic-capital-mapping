"""
Generate targeted public-source search queries for missing African PF/SWF
alternative-asset vehicles.

This script does not scrape search engines. It creates a reproducible query
inventory from the current workbook so the manual/public-source review can be
run in batches and tracked in the "Omission Candidates" sheet.

Run:
    python scan_omission_candidates.py
"""

from __future__ import annotations

import csv
from pathlib import Path

import pandas as pd


EXCEL_FILE = "african_pf and swf_dataset_5.13.26.xlsx"
OUT_DIR = Path("reports")
OUT_FILE = OUT_DIR / "omission_scan_queries.csv"

CORE_ALLOCATORS = [
    "PIC GEPF",
    "Public Investment Corporation Government Employees Pension Fund",
    "Eskom Pension and Provident Fund",
    "SSNIT Ghana",
    "NSIA Nigeria Sovereign Investment Authority",
    "Fundo Soberano de Angola FSDEA",
    "GIPF Namibia",
    "Botswana Public Officers Pension Fund BPOPF",
    "Rwanda Social Security Board RSSB",
    "CDG Morocco",
    "Ithmar Capital",
]

DFI_TERMS = [
    "AfDB",
    "BII CDC Group",
    "FMO",
    "Norfund",
    "IFC",
    "Proparco",
    "DEG",
    "Dutch Good Growth Fund DGGF",
    "IFU",
    "EBID",
    "DBSA",
]

SOURCE_SITES = [
    "site:english.dggf.nl",
    "site:bii.co.uk",
    "site:afdb.org",
    "site:fmo.nl",
    "site:norfund.no",
    "site:ifc.org",
    "site:dbsa.org",
    "site:avca.africa",
]

QUERY_TEMPLATES = [
    '"{allocator}" "{dfi}" "fund" Africa "limited partner"',
    '"{allocator}" "{dfi}" "first close" Africa fund',
    '"{allocator}" "{dfi}" "final close" Africa fund',
    '"{allocator}" "anchored by" fund Africa',
    '"{allocator}" "alongside" "{dfi}" fund',
]


def workbook_terms() -> list[str]:
    xl = pd.ExcelFile(EXCEL_FILE)
    terms: set[str] = set(CORE_ALLOCATORS)
    for sheet in ["Commitments Database", "Funds & LP Co-Investors"]:
        header = 2 if sheet == "Funds & LP Co-Investors" else 0
        df = xl.parse(sheet, header=header)
        df.columns = [str(c).strip() for c in df.columns]
        for col in [
            "Allocator (institution)",
            "Named African PF/SWF LPs",
            "Fund / Vehicle / Deal name",
            "Fund / Vehicle",
        ]:
            if col in df.columns:
                for val in df[col].dropna().astype(str):
                    if 4 <= len(val) <= 90:
                        terms.add(val)
    return sorted(terms)


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    rows: list[dict[str, str]] = []

    for allocator in CORE_ALLOCATORS:
        for dfi in DFI_TERMS:
            for template in QUERY_TEMPLATES:
                rows.append({
                    "batch": "allocator_dfi_crosscheck",
                    "allocator": allocator,
                    "dfi_or_source": dfi,
                    "query": template.format(allocator=allocator, dfi=dfi),
                })

    for site in SOURCE_SITES:
        for allocator in CORE_ALLOCATORS:
            rows.append({
                "batch": "site_specific_allocator",
                "allocator": allocator,
                "dfi_or_source": site,
                "query": f'{site} "{allocator}" "fund"',
            })

    for term in workbook_terms():
        rows.append({
            "batch": "known_entity_reverse_lookup",
            "allocator": term,
            "dfi_or_source": "",
            "query": f'"{term}" "limited partner" OR "LP" fund Africa',
        })

    with OUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["batch", "allocator", "dfi_or_source", "query"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows):,} queries to {OUT_FILE}")


if __name__ == "__main__":
    main()
