# Source ID Research Audit - 2026-06-24

This memo records the online source check for commitment rows previously flagged as missing `Source IDs`.

## Summary

- Added Source Library records `S251` through `S260`.
- Linked all formerly missing-source commitment rows to at least one public source.
- Cleared the audit category `MISSING_SOURCE_IDS`.
- Kept caveats where the source supports only aggregate/platform exposure rather than a named allocator-to-specific-vehicle commitment.
- Updated the vehicle/instrument audit rule so platform/shareholder vehicles remain eligible, while individual operating-company clients such as MedServe are still flagged.

## Row-Level Conclusions

| Commitment row | Vehicle / client | Source ID | Assessment |
|---:|---|---|---|
| 4 | Pembani Remgro Infrastructure Fund | S251 | Partial. Africa Global Funds confirms PRIF first close and private-pension participation, but does not name PIC/GEPF. Keep for review unless named PIC evidence is found. |
| 5 | Convergence Partners Communications Infrastructure Fund | S252 | Strong. Africa Global Funds names PIC acting on behalf of GEPF at final close and lists DFI co-investors. |
| 15 | Multiple funds | S260 | Weak/aggregate. Stanbic IBTC source supports Multi-Fund structure context but not named PE/infra fund commitments. Candidate for aggregate/reference treatment. |
| 26 | Sectoral co-investment funds | S253 | Platform-level. FM6I official site supports thematic/sectoral fund platform role; split into specific funds once closed vehicles are named. |
| 40 | Lobito Corridor partnership | S254 | Strategic-platform context. FSDEA source supports strategic-plan/Lobito platform context, but not a discrete closed commitment. Candidate for Pipeline/Reference unless stronger transaction evidence is found. |
| 44 | Domestic strategic investments | S255 | Aggregate. Agaciro annual report supports equity allocation, but not named direct investments in this row. |
| 45 | BK Group, RwandAir, other strategic stakes | S256 | Partial. Source supports RSSB/BK Group ownership; RwandAir and other stakes still need separate evidence or row should be narrowed. |
| 48 | Domestic infrastructure deals | S257 | Good aggregate support. GIIF investor presentation documents mandate, committed transactions, portfolio sectors, and pipeline. |
| 49 | Gabonese financial and infra stakes | S258 | Aggregate/role support. IFSWF source supports FGIS strategic state-asset role, but not specific holdings. |
| 50 | Domestic strategic partnerships | S259 | Mandate/platform support. FSD source supports co-investment mandate in strategic sectors, but not a discrete closed platform transaction. |

## Sources Added

- `S251`: Africa Global Funds, Pembani Remgro Infrastructure Fund first close.
- `S252`: Africa Global Funds, Convergence Partners Communication Infrastructure Fund final close.
- `S253`: Mohammed VI Investment Fund official site, funds and investments.
- `S254`: FSDEA official site, 2024-2028 strategic plan and Lobito platform context.
- `S255`: Agaciro Development Fund Annual Report 2021.
- `S256`: Early Warning System / IFC-MIGA project disclosure, BK Group ownership by RSSB and Agaciro.
- `S257`: GIIF Investor Presentation, June 2024.
- `S258`: IFSWF, FGIS membership/background note.
- `S259`: Fonds Souverain de Djibouti public profile/mandate.
- `S260`: Stanbic IBTC Pension Managers Multi-Fund information.

## Follow-Up Recommendations

1. Move or qualify rows that are only aggregate exposure rather than named commitments: Stanbic multiple funds, Agaciro domestic strategic investments, FGIS financial/infra stakes, and FSD domestic partnerships.
2. Narrow RSSB row 45 to the source-supported BK Group exposure or add separate evidence for RwandAir and other strategic stakes.
3. Keep Convergence as a confirmed commitment.
4. Treat Pembani as review-needed until PIC/GEPF-specific evidence is located.
5. Keep platform/shareholder rows in Vehicles & Instruments where the vehicle is a platform, fund, guarantee instrument, SWF platform, or multilateral/shareholder vehicle; exclude operating-company clients like MedServe.
