# Data Quality Audit - 2026-06-25

Workbook: `african_pf and swf_dataset_5.13.26.xlsx`
Total findings: **71**

## Summary by Severity

- **high**: 3
- **medium**: 54
- **low**: 14

## Summary by Finding Type

- `COMMITMENT_WITHOUT_VEHICLE_ROW`: 33
- `AGGREGATE_PORTFOLIO_LABEL`: 14
- `MULTI_VEHICLE_LABEL`: 8
- `SOURCE_MISMATCH_POSSIBLE`: 6
- `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT`: 6
- `MANDATE_LIKE_COMMITMENT`: 3
- `NON_VEHICLE_IN_FUNDS_SHEET`: 1

## High Priority Findings

- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 72: KEPFIC-facilitated housing + infrastructure investments - Commitment row contains mandate/planned/member-only language.
- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 81: SA infrastructure + alts mandates - Commitment row contains mandate/planned/member-only language.
- `MANDATE_LIKE_COMMITMENT` - Commitments Database row 118: Mergence Lesotho unlisted investment mandate (PE & infrastructure) - Commitment row contains mandate/planned/member-only language.

## Mediterrania-Specific Findings

- `COMMITMENT_WITHOUT_VEHICLE_ROW` - Commitments Database row 21: Mediterrania Capital II/III (historical) - Confirmed fund/instrument commitment does not have a matching Vehicles & Instruments row.
- `MULTI_VEHICLE_LABEL` - Commitments Database row 21: Mediterrania Capital II/III (historical) - Vehicle/client label appears to collapse multiple vehicles into one row.
- `MULTI_VEHICLE_LABEL` - Funds & LP Co-Investors row 15: Mediterrania Capital II / III / IV - Vehicle label appears to collapse multiple vehicles into one row.
- `SOURCE_MISMATCH_POSSIBLE` - Commitments Database row 21: Mediterrania Capital II/III (historical) - Linked source text has very little token overlap with the row.
- `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT` - Funds & LP Co-Investors row 15: Mediterrania Capital II / III / IV - Vehicle row has no matching confirmed commitment row.

## Suggested Triage Order

1. Resolve `MANDATE_LIKE_COMMITMENT` and `NON_VEHICLE_IN_FUNDS_SHEET` findings first because they affect inclusion and presentation.
2. Review `SOURCE_MISMATCH_POSSIBLE` findings manually; these are evidence-quality flags, not automatic errors.
3. Split or relabel `MULTI_VEHICLE_LABEL` rows before relying on vehicle counts or network nodes.
4. Review `COMMITMENT_WITHOUT_VEHICLE_ROW` and `VEHICLE_WITHOUT_CONFIRMED_COMMITMENT` after aliasing and aggregate-row decisions are settled.

Full CSV: `reports\data_quality_audit_2026-06-25.csv`
