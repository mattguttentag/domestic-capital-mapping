"""
Audit workbook data quality for the African PF/SWF capital mapping dataset.

This is a structural and source-linkage audit. It does not decide the facts on
its own; it flags rows that deserve human review before they are presented as
confirmed commitments, vehicles, or network-map nodes.

Run:
    python audit_data_quality.py
"""

from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd


EXCEL_FILE = Path("african_pf and swf_dataset_5.13.26.xlsx")
REPORT_DIR = Path("reports")
TODAY = date.today().isoformat()
CSV_OUT = REPORT_DIR / f"data_quality_audit_{TODAY}.csv"
MD_OUT = REPORT_DIR / f"data_quality_audit_{TODAY}.md"


STOPWORDS = {
    "africa",
    "african",
    "and",
    "asset",
    "assets",
    "capital",
    "commitment",
    "commitments",
    "company",
    "deal",
    "development",
    "equity",
    "finance",
    "financial",
    "fund",
    "funds",
    "group",
    "investment",
    "investments",
    "limited",
    "lp",
    "manager",
    "partners",
    "pension",
    "press",
    "private",
    "release",
    "source",
    "the",
    "vehicle",
    "vehicles",
}


def clean_cell(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "none"}:
        return ""
    return text


def norm(text: Any) -> str:
    return re.sub(r"[^a-z0-9]+", " ", clean_cell(text).lower()).strip()


def tokens(text: Any) -> set[str]:
    return {
        t
        for t in norm(text).split()
        if len(t) >= 4 and t not in STOPWORDS and not t.isdigit()
    }


def split_ids(value: Any) -> list[str]:
    text = clean_cell(value)
    if not text or text.upper() == "NONE":
        return []
    return [part.strip() for part in re.split(r"[;,]", text) if part.strip()]


def row_ref(sheet: str, row_number: int, row: pd.Series) -> str:
    label = (
        row.get("Allocator (institution)")
        or row.get("Fund / Vehicle / Client")
        or row.get("Fund / Vehicle / Deal name")
        or row.get("Fund / Vehicle")
        or row.get("Entity / prospective allocator")
        or ""
    )
    return f"{sheet}!row {row_number} | {clean_cell(label)}"


def add_issue(
    issues: list[dict[str, str]],
    sheet: str,
    row_number: int,
    row: pd.Series,
    severity: str,
    code: str,
    message: str,
    suggestion: str = "",
) -> None:
    vehicle = clean_cell(
        row.get("Fund / Vehicle / Client")
        or row.get("Fund / Vehicle / Deal name")
        or row.get("Fund / Vehicle")
        or row.get("Vehicle")
        or row.get("Vehicle / entity")
    )
    allocator = clean_cell(
        row.get("Allocator (institution)")
        or row.get("Named African PF/SWF LPs")
        or row.get("Entity / prospective allocator")
        or row.get("Allocator")
    )
    issues.append(
        {
            "severity": severity,
            "code": code,
            "sheet": sheet,
            "excel_row": str(row_number),
            "allocator_or_lps": allocator,
            "vehicle_or_entity": vehicle,
            "message": message,
            "suggestion": suggestion,
        }
    )


def load_sheet(xl: pd.ExcelFile, sheet: str, header: int = 0) -> pd.DataFrame:
    df = xl.parse(sheet, header=header)
    df.columns = [clean_cell(c) for c in df.columns]
    df = df.dropna(how="all")
    return df


def source_lookup(source_df: pd.DataFrame) -> dict[str, pd.Series]:
    lookup: dict[str, pd.Series] = {}
    for _, row in source_df.iterrows():
        sid = clean_cell(row.get("Source ID"))
        if sid:
            lookup[sid] = row
    return lookup


def source_text(source_rows: list[pd.Series]) -> str:
    return " ".join(
        clean_cell(src.get(col))
        for src in source_rows
        for col in ["Allocator", "Title / publication", "Used for", "URL"]
    )


def row_evidence_text(row: pd.Series) -> str:
    return " ".join(
        clean_cell(row.get(col))
        for col in [
            "Allocator (institution)",
            "Named African PF/SWF LPs",
            "Fund / Vehicle / Client",
            "Fund / Vehicle / Deal name",
            "Fund / Vehicle",
            "GP or counterparty",
            "Manager / GP",
            "Source (short)",
        ]
    )


def is_dash(value: Any) -> bool:
    return clean_cell(value) in {"", "-", "—", "–"}


def is_direct_row(row: pd.Series) -> bool:
    approach = clean_cell(row.get("Investment approach")).lower()
    asset = clean_cell(row.get("Asset class normalized")).lower()
    return (
        approach == "direct investment"
        or asset == "direct equity / strategic stake"
    )


def is_mandate_like(row: pd.Series) -> bool:
    label_text = norm(
        " ".join(
            clean_cell(row.get(col))
            for col in [
                "Fund / Vehicle / Client",
                "Fund / Vehicle / Deal name",
            ]
        )
    )
    status_text = norm(
        " ".join(
            clean_cell(row.get(col))
            for col in ["Commitment type", "Investment approach", "Status category"]
        )
    )
    if any(term in label_text for term in ["kepfic", "aofsa"]):
        return True
    if any(term in status_text for term in ["mou", "planned", "expected", "targeted", "member only"]):
        return True
    if "mandate pipeline only" in status_text:
        return True
    if "investment mandate" in status_text or status_text == "mandate":
        return True
    return False


def is_vehicle_or_instrument(row: pd.Series) -> bool:
    label = clean_cell(
        row.get("Fund / Vehicle")
        or row.get("Fund / Vehicle / Client")
        or row.get("Fund / Vehicle / Deal name")
    ).lower()
    approach = clean_cell(row.get("Investment approach"))
    asset = clean_cell(row.get("Asset class normalized"))
    if "medserve" in label or "oncology and diagnostics" in label:
        return False
    if approach == "Guarantee-backed Instrument" or asset == "Guarantee / Credit Enhancement":
        return True
    if approach == "Fund of Funds LP" or asset == "Fund of Funds":
        return True
    if "Fund of Funds" in approach:
        return True
    if "Fund LP" in approach and asset != "Direct Equity / Strategic Stake":
        return True
    if approach == "Platform / Anchor Sponsor" or asset == "Platform / Holding Company":
        return True
    if asset == "Direct Equity / Strategic Stake" and any(
        term in label
        for term in [
            "africa50",
            "africa finance corporation",
            "afc",
            "wessal",
            "nigeria infrastructure fund",
            "nif",
            "tsfe-adq",
            "egyptian health platform",
        ]
    ):
        return True
    return False


def looks_multi_vehicle(label: str) -> bool:
    text = clean_cell(label)
    low = text.lower()
    if re.search(r"\b[ivx]+(?:\s*/\s*|\s*,\s*|\s+and\s+)[ivx]+\b", low):
        return True
    if re.search(r"\b[ivx]+\s*-\s*[ivx]+\b", low):
        return True
    return any(
        phrase in low
        for phrase in [
            "multiple funds",
            "various funds",
            "77 indirect funds",
            "funds (",
            "ii / iii / iv",
            "ii/iii",
            "i-iv",
            "i, ii",
        ]
    )


def looks_aggregate(label: str) -> bool:
    low = clean_cell(label).lower()
    return any(
        phrase in low
        for phrase in [
            "portfolio",
            "various",
            "multiple",
            "direct stakes",
            "strategic projects",
            "domestic strategic",
            "alternatives portfolio",
            "indirect funds",
            "mandates",
        ]
    )


def vehicle_key(label: Any) -> str:
    text = norm(label)
    text = re.sub(r"\b(shareholder|stake|equity|fund|funds|vehicle|lp|deal|client)\b", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    aliases = {
        "ci gaba of": "ci gaba",
        "ci gaba": "ci gaba",
        "afc": "africa finance corporation",
        "africa finance corporation": "africa finance corporation",
        "africa finance corporation afc shareholders": "africa finance corporation",
        "africa50 general": "africa50",
        "africa50": "africa50",
        "africa50 infrastructure acceleration iaf": "africa50 infrastructure acceleration",
        "africinvest five financial inclusion evergreen": "africinvest five financial inclusion",
        "africinvest five financial inclusion": "africinvest five financial inclusion",
        "capital alliance private cape": "capital alliance private i iv cape",
        "cape i iv capital alliance private": "capital alliance private i iv cape",
        "for agricultural finance in nigeria fafin": "sahel capital for agricultural finance in nigeria fafin",
        "growth investment partners gip ghana": "growth investment partners ghana",
        "growth investment partners ghana": "growth investment partners ghana",
        "growth investment partners gip zambia": "growth investment partners zambia",
        "growth investment partners zambia gip zambia": "growth investment partners zambia",
        "growth investment partners zambia": "growth investment partners zambia",
        "medserve oncology and diagnostics expansion": "medserve",
        "medserve": "medserve",
        "nigeria infrastructure nif nsia sub": "nigeria infrastructure nif",
        "nigeria infrastructure nif direct": "nigeria infrastructure nif",
        "oyass capital sme": "oyass capital",
        "oyass capital": "oyass capital",
        "vantage capital mezzanine": "vantage mezzanine iv pan african sub",
        "vantage mezzanine iv pan african sub": "vantage mezzanine iv pan african sub",
        "wessal capital swf joint investment": "wessal capital",
        "wessal capital": "wessal capital",
    }
    return aliases.get(text, text)


def audit_sources(
    issues: list[dict[str, str]],
    sheet: str,
    df: pd.DataFrame,
    source_by_id: dict[str, pd.Series],
    row_offset: int,
) -> None:
    if "Source IDs" not in df.columns:
        return
    for idx, row in df.iterrows():
        excel_row = idx + row_offset
        ids_text = clean_cell(row.get("Source IDs"))
        ids = split_ids(ids_text)
        if not ids_text:
            add_issue(
                issues,
                sheet,
                excel_row,
                row,
                "high",
                "MISSING_SOURCE_IDS",
                "Row has no Source IDs.",
                "Add source IDs or explicitly mark NONE only when no public row-level source is available.",
            )
            continue
        if ids_text.upper() == "NONE":
            add_issue(
                issues,
                sheet,
                excel_row,
                row,
                "medium",
                "SOURCE_IDS_NONE",
                "Row is explicitly marked as having no row-level source.",
                "Find a supporting public source or move/qualify the row if evidence is only aggregate.",
            )
            continue
        missing = [sid for sid in ids if sid not in source_by_id]
        if missing:
            add_issue(
                issues,
                sheet,
                excel_row,
                row,
                "high",
                "SOURCE_ID_NOT_FOUND",
                f"Source ID(s) not found in Source Library: {', '.join(missing)}.",
                "Correct the Source IDs or add the missing Source Library rows.",
            )
            continue
        linked_sources = [source_by_id[sid] for sid in ids]
        linked_without_url = [
            sid for sid, src in zip(ids, linked_sources) if not clean_cell(src.get("URL"))
        ]
        if linked_without_url:
            add_issue(
                issues,
                sheet,
                excel_row,
                row,
                "medium",
                "SOURCE_WITHOUT_URL",
                f"Linked Source Library row(s) have no URL: {', '.join(linked_without_url)}.",
                "Add a URL, document an offline source, or use a better public source.",
            )
        row_toks = tokens(row_evidence_text(row))
        source_toks = tokens(source_text(linked_sources))
        overlap = row_toks & source_toks
        if row_toks and source_toks and len(overlap) < 2:
            add_issue(
                issues,
                sheet,
                excel_row,
                row,
                "medium",
                "SOURCE_MISMATCH_POSSIBLE",
                "Linked source text has very little token overlap with the row.",
                "Manually confirm the source supports the allocator, vehicle/client, and commitment claim.",
            )


def audit_commitments(
    issues: list[dict[str, str]],
    df: pd.DataFrame,
    fund_vehicle_keys: set[str],
) -> None:
    client_col = "Fund / Vehicle / Client" if "Fund / Vehicle / Client" in df.columns else "Fund / Vehicle / Deal name"
    for idx, row in df.iterrows():
        excel_row = idx + 2
        label = clean_cell(row.get(client_col))
        gp = row.get("GP or counterparty")
        if is_direct_row(row) and not is_dash(gp):
            add_issue(
                issues,
                "Commitments Database",
                excel_row,
                row,
                "high",
                "DIRECT_ROW_HAS_GP",
                "Direct-equity/direct-investment row still has a GP or counterparty value.",
                "Move target/client names to Fund / Vehicle / Client and leave GP blank.",
            )
        if is_mandate_like(row):
            add_issue(
                issues,
                "Commitments Database",
                excel_row,
                row,
                "high",
                "MANDATE_LIKE_COMMITMENT",
                "Commitment row contains mandate/planned/member-only language.",
                "Move to Pipeline & Mandates unless there is public evidence of an actual allocation.",
            )
        if looks_multi_vehicle(label):
            add_issue(
                issues,
                "Commitments Database",
                excel_row,
                row,
                "medium",
                "MULTI_VEHICLE_LABEL",
                "Vehicle/client label appears to collapse multiple vehicles into one row.",
                "Split into fund-specific rows or mark as historical aggregate and exclude from vehicle/network counts.",
            )
        if looks_aggregate(label):
            add_issue(
                issues,
                "Commitments Database",
                excel_row,
                row,
                "low",
                "AGGREGATE_PORTFOLIO_LABEL",
                "Label appears to describe an aggregate portfolio, not a discrete vehicle/client.",
                "Confirm whether this should remain in commitments or be moved to an analytical/reference tab.",
            )
        if is_vehicle_or_instrument(row) and not is_mandate_like(row):
            key = vehicle_key(label)
            if key and key not in fund_vehicle_keys:
                add_issue(
                    issues,
                    "Commitments Database",
                    excel_row,
                    row,
                    "medium",
                    "COMMITMENT_WITHOUT_VEHICLE_ROW",
                    "Confirmed fund/instrument commitment does not have a matching Vehicles & Instruments row.",
                    "Add a vehicle row or explain why it should be excluded from vehicle-level displays.",
                )


def audit_funds(
    issues: list[dict[str, str]],
    df: pd.DataFrame,
    commitment_vehicle_keys: set[str],
) -> None:
    for idx, row in df.iterrows():
        excel_row = idx + 4
        label = clean_cell(row.get("Fund / Vehicle"))
        if not is_vehicle_or_instrument(row):
            add_issue(
                issues,
                "Funds & LP Co-Investors",
                excel_row,
                row,
                "medium",
                "NON_VEHICLE_IN_FUNDS_SHEET",
                "Fund co-investor sheet row is direct/platform/aggregate and is not eligible for Vehicles & Instruments display.",
                "Move to a direct-investments/reference tab or keep excluded from vehicle counts and network nodes.",
            )
            continue
        if looks_multi_vehicle(label):
            add_issue(
                issues,
                "Funds & LP Co-Investors",
                excel_row,
                row,
                "medium",
                "MULTI_VEHICLE_LABEL",
                "Vehicle label appears to collapse multiple vehicles into one row.",
                "Split into discrete vehicles where source evidence allows.",
            )
        if looks_aggregate(label):
            add_issue(
                issues,
                "Funds & LP Co-Investors",
                excel_row,
                row,
                "low",
                "AGGREGATE_PORTFOLIO_LABEL",
                "Vehicle label appears aggregate rather than vehicle-specific.",
                "Check whether this belongs in Vehicles & Instruments.",
            )
        key = vehicle_key(label)
        if key and key not in commitment_vehicle_keys:
            add_issue(
                issues,
                "Funds & LP Co-Investors",
                excel_row,
                row,
                "medium",
                "VEHICLE_WITHOUT_CONFIRMED_COMMITMENT",
                "Vehicle row has no matching confirmed commitment row.",
                "Confirm whether the vehicle should remain visible or move to Pipeline/Omission Candidates.",
            )
        if not clean_cell(row.get("Named African PF/SWF LPs")):
            add_issue(
                issues,
                "Funds & LP Co-Investors",
                excel_row,
                row,
                "high",
                "VEHICLE_WITHOUT_AFRICAN_LP",
                "Vehicle row has no named African PF/SWF LPs.",
                "Remove from vehicle list unless African PF/SWF involvement is documented elsewhere.",
            )


def audit_duplicates(
    issues: list[dict[str, str]],
    sheet: str,
    df: pd.DataFrame,
    label_col: str,
    row_offset: int,
) -> None:
    grouped: dict[str, list[tuple[int, pd.Series, str]]] = defaultdict(list)
    if label_col not in df.columns:
        return
    for idx, row in df.iterrows():
        label = clean_cell(row.get(label_col))
        key = vehicle_key(label)
        if key:
            grouped[key].append((idx + row_offset, row, label))
    for _, rows in grouped.items():
        labels = sorted({label for _, _, label in rows})
        if len(labels) > 1:
            for excel_row, row, _ in rows:
                add_issue(
                    issues,
                    sheet,
                    excel_row,
                    row,
                    "low",
                    "POSSIBLE_DUPLICATE_LABEL",
                    f"Similar normalized labels appear in this sheet: {' | '.join(labels)}.",
                    "Confirm whether these are aliases, duplicates, or genuinely distinct vehicles/entities.",
                )


def write_reports(issues: list[dict[str, str]]) -> None:
    REPORT_DIR.mkdir(exist_ok=True)
    fields = [
        "severity",
        "code",
        "sheet",
        "excel_row",
        "allocator_or_lps",
        "vehicle_or_entity",
        "message",
        "suggestion",
    ]
    with CSV_OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(issues)

    by_code = Counter(issue["code"] for issue in issues)
    by_severity = Counter(issue["severity"] for issue in issues)
    high_priority = [i for i in issues if i["severity"] == "high"][:40]
    mediterrania = [
        i
        for i in issues
        if "mediterrania" in (i["vehicle_or_entity"] + " " + i["message"]).lower()
    ]

    lines = [
        f"# Data Quality Audit - {TODAY}",
        "",
        f"Workbook: `{EXCEL_FILE}`",
        f"Total findings: **{len(issues)}**",
        "",
        "## Summary by Severity",
        "",
    ]
    for severity in ["high", "medium", "low"]:
        lines.append(f"- **{severity}**: {by_severity.get(severity, 0)}")
    lines.extend(["", "## Summary by Finding Type", ""])
    for code, count in by_code.most_common():
        lines.append(f"- `{code}`: {count}")
    lines.extend(["", "## High Priority Findings", ""])
    if high_priority:
        for issue in high_priority:
            lines.append(
                f"- `{issue['code']}` - {issue['sheet']} row {issue['excel_row']}: "
                f"{issue['vehicle_or_entity'] or issue['allocator_or_lps']} - {issue['message']}"
            )
    else:
        lines.append("- None.")
    lines.extend(["", "## Mediterrania-Specific Findings", ""])
    if mediterrania:
        for issue in mediterrania:
            lines.append(
                f"- `{issue['code']}` - {issue['sheet']} row {issue['excel_row']}: "
                f"{issue['vehicle_or_entity']} - {issue['message']}"
            )
    else:
        lines.append("- None.")
    lines.extend(
        [
            "",
            "## Suggested Triage Order",
            "",
            "1. Resolve `MANDATE_LIKE_COMMITMENT` and `NON_VEHICLE_IN_FUNDS_SHEET` findings first because they affect inclusion and presentation.",
            "2. Review `SOURCE_MISMATCH_POSSIBLE` findings manually; these are evidence-quality flags, not automatic errors.",
            "3. Split or relabel `MULTI_VEHICLE_LABEL` rows before relying on vehicle counts or network nodes.",
            "4. Review `COMMITMENT_WITHOUT_VEHICLE_ROW` and `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT` after aliasing and aggregate-row decisions are settled.",
            "",
            f"Full CSV: `{CSV_OUT}`",
        ]
    )
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    xl = pd.ExcelFile(EXCEL_FILE)
    commitments = load_sheet(xl, "Commitments Database")
    funds = load_sheet(xl, "Funds & LP Co-Investors", header=2)
    pipeline = load_sheet(xl, "Pipeline & Mandates")
    sources = load_sheet(xl, "Source Library")
    source_by_id = source_lookup(sources)

    client_col = "Fund / Vehicle / Client" if "Fund / Vehicle / Client" in commitments.columns else "Fund / Vehicle / Deal name"
    commitment_vehicle_keys = {
        vehicle_key(row.get(client_col))
        for _, row in commitments.iterrows()
        if is_vehicle_or_instrument(row) and not is_mandate_like(row)
    }
    fund_vehicle_keys = {
        vehicle_key(row.get("Fund / Vehicle"))
        for _, row in funds.iterrows()
        if clean_cell(row.get("Fund / Vehicle"))
    }

    issues: list[dict[str, str]] = []
    audit_sources(issues, "Commitments Database", commitments, source_by_id, 2)
    audit_sources(issues, "Funds & LP Co-Investors", funds, source_by_id, 4)
    audit_sources(issues, "Pipeline & Mandates", pipeline, source_by_id, 2)
    audit_commitments(issues, commitments, fund_vehicle_keys)
    audit_funds(issues, funds, commitment_vehicle_keys)
    audit_duplicates(issues, "Commitments Database", commitments, client_col, 2)
    audit_duplicates(issues, "Funds & LP Co-Investors", funds, "Fund / Vehicle", 4)

    severity_order = {"high": 0, "medium": 1, "low": 2}
    issues.sort(key=lambda i: (severity_order.get(i["severity"], 9), i["code"], i["sheet"], int(i["excel_row"])))
    write_reports(issues)

    print(f"Wrote {CSV_OUT}")
    print(f"Wrote {MD_OUT}")
    print(f"Findings: {len(issues)}")
    print("By severity:", dict(Counter(i["severity"] for i in issues)))
    print("Top finding types:", dict(Counter(i["code"] for i in issues).most_common(10)))


if __name__ == "__main__":
    main()
