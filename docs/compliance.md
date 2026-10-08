# Record checks, not certification

Checked 8 October 2026. The compliance command identifies incomplete records for a responsible reviewer. It does not certify an installation, make legal decisions or send notices.

| Rule | Record check | Source and limit |
|---|---|---|
| NZ-IPP5 | In-use assets without a custodian, retired assets without disposal evidence | [NZ Privacy Principle 5](https://www.privacy.org.nz/privacy-principles/5/) requires reasonable security safeguards. Custody and disposal records support a review; they do not prove encryption, safe disposal or access controls. |
| NZ-IPP9 | Personal ticket records with no retention purpose, missing review date or a due review | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits retention to the lawful purpose. No universal retention interval is inferred. |
| HOLD | Any recorded legal hold | Internal preservation control. No command deletes records or clears holds automatically. |
| POLICY-OWNER | Service without a named owner | Internal operating policy, not legislation. |
| POLICY-CHANGE | Draft change planned within seven days | Internal review window, not a legal notice period. Approval needs service, test evidence, a different named approver and a future schedule. |
| POLICY-DEADLINE | Active ticket missing an explicit response or resolution deadline | Internal service policy. The operator records agreed UTC deadlines. No business-hours calendar or paused clock is inferred. |
| POLICY-CLOSURE | Imported closed/resolved ticket missing resolution evidence or time | Migration quality check. The source status is preserved; missing evidence remains visible. |

Pending tickets keep their recorded deadlines. Resolved and closed tickets leave the current overdue queue. Reopening clears the resolution but retains the original deadline and first-response event. A later agreed deadline is an explicit audited update. A log note is not proof that a requester received a response. respond acknowledges a response the operator already made; it sends nothing.

Retention dates are review dates, never deletion dates. A hold remains even if the operator marks the ticket as containing no personal data. An explicit hold update records before and after values.

The CLI uses a trusted operator database connection. Actor names are self-reported, not authenticated signatures. Row-level security denies public access, while the database owner can modify history. Shared deployments require authenticated operators, roles, access review, encryption, tested backups and monitoring configured for that business. No public API is supplied.
