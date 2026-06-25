# Data Quality Audit - 2026-06-25

Workbook: `african_pf and swf_dataset_5.13.26.xlsx`
Total findings: **66**

## Summary by Severity

- **high**: 3
- **medium**: 49
- **low**: 14

## Summary by Finding Type

- `COMMITMENT_WITHOUT_VEHICLE_ROW`: 32
- `AGGREGATE_PORTFOLIO_LABEL`: 14
- `MULTI_VEHICLE_LABEL`: 6
- `SOURCE_MISMATCH_POSSIBLE`: 5
- `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT`: 5
- `MANDATE_LIKE_COMMITMENT`: 3
- `NON_VEHICLE_IN_FUNDS_SHEET`: 1

## High Priority Findings

- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 71: KEPFIC-facilitated housing + infrastructure investments - Commitment row contains mandate/planned/member-only language.
- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 80: SA infrastructure + alts mandates - Commitment row contains mandate/planned/member-only language.
- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 117: Mergence Lesotho unlisted investment mandate (PE & infrastructure) - Commitment row contains mandate/planned/member-only language.

## Mediterrania-Specific Findings

- None.

## Suggested Triage Order

1. Resolve `MANDATE_LIKE_COMMITMENT` and `NON_VEHICLE_IN_FUNDS_SHEET` findings first because they affect inclusion and presentation.
2. Review `SOURCE_MISMATCH_POSSIBLE` findings manually; these are evidence-quality flags, not automatic errors.
3. Split or relabel `MULTI_VEHICLE_LABEL` rows before relying on vehicle counts or network nodes.
4. Review `COMMITMENT_WITHOUT_VEHICLE_ROW` and `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT` after aliasing and aggregate-row decisions are settled.

Full CSV: `reports\data_quality_audit_2026-06-25.csv`
