# Service CLI

Run npm run service -- followed by a command. Every command accepts --json. Named options use --name=value; bare flags are --json and --dry-run. Unknown options fail. No subcommand sends, deletes or executes infrastructure work.

| Command | Options |
|---|---|
| help | None |
| tickets | None |
| sla-risk | None |
| attention | None |
| assets | None |
| asset-risk | None |
| services | None |
| service-health | None |
| problems | None |
| problem-review | None |
| changes | None |
| change-review | None |
| workload | None |
| compliance | None |
| weekly-review | None |
| ticket | --ticket |
| activity | --ticket |
| add-ticket | --reference, --name, --requester, --owner, --service, --asset, --problem, --type, --priority, --response-due, --resolve-due, --actor |
| update-ticket | --ticket, --owner, --service, --asset, --problem, --priority, --status, --response-due, --resolve-due, --actor |
| respond | --ticket, --note, --actor |
| resolve | --ticket, --note, --actor |
| log | --ticket, --note, --actor |
| add-service | --reference, --name, --owner, --criticality, --actor |
| add-asset | --reference, --name, --service, --custodian, --warranty, --review-on, --actor |
| update-asset | --asset, --custodian, --status, --warranty, --review-on, --disposal-evidence, --actor |
| add-problem | --reference, --name, --service, --owner, --actor |
| update-problem | --problem, --owner, --status, --root-cause, --workaround, --resolution, --actor |
| add-change | --reference, --name, --service, --owner, --risk, --scheduled, --plan, --rollback, --evidence, --actor |
| update-change | --change, --name, --owner, --risk, --scheduled, --plan, --rollback, --evidence, --actor |
| approve-change | --change, --note, --actor |
| complete-change | --change, --outcome, --actor |
| retention | --ticket, --personal, --review-on, --basis, --hold, --actor |
| draft-incident | --ticket |
| import | --file, --map, --timezone, --actor, --dry-run |
| export | None |

## ticket

`npm run service -- ticket --ticket=T-1`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## activity

`npm run service -- activity --ticket=T-1`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## add-ticket

`npm run service -- add-ticket --reference=T-NEW --name="Login fault" --requester=Casey --owner=Lee --service=S-1 --priority=high --actor=Lee`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## update-ticket

`npm run service -- update-ticket --ticket=T-1 --owner=Lee --actor=Aroha`

Read ticket and activity first. Reopening clears the resolution and keeps original deadlines and first response. Changing a linked service must agree with the asset and problem service.

## respond

`npm run service -- respond --ticket=T-1 --note="Reply already delivered by operator" --actor=Lee`

This records a response the operator already delivered. It does not send one. Confirm the event first. The first response can only be acknowledged once.

## resolve

`npm run service -- resolve --ticket=T-1 --note="Requester confirmed recovery" --actor=Lee`

An owner and evidence note are required. Confirm recovery before resolving. Closing is a separate update after resolution.

## log

`npm run service -- log --ticket=T-1 --note="Owner confirmed next action" --actor=Lee`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## add-service

`npm run service -- add-service --reference=S-NEW --name="Payroll access" --owner=Aroha --criticality=critical --actor=Aroha`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## add-asset

`npm run service -- add-asset --reference=A-NEW --name="Spare laptop" --service=S-1 --custodian=Casey --actor=Casey`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## update-asset

`npm run service -- update-asset --asset=A-1 --custodian=Casey --review-on=2027-01-01 --actor=Casey`

Read assets first. Retired equipment needs disposal evidence. Custody is a record, not proof of encryption or safe disposal.

## add-problem

`npm run service -- add-problem --reference=P-NEW --name="Recurring login fault" --service=S-1 --owner=Lee --actor=Lee`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## update-problem

`npm run service -- update-problem --problem=P-1 --root-cause="Confirmed configuration fault" --workaround="Use spare" --status=known-error --actor=Lee`

Read problems and problem-review first. Resolve linked active tickets before recording a problem as resolved.

## add-change

`npm run service -- add-change --reference=C-NEW --name="Identity update" --service=S-1 --owner=Lee --risk=high --scheduled=2027-01-01T01:00:00Z --plan="Apply tested setting" --rollback="Restore backup" --evidence=archive://test/1 --actor=Lee`

Replace all example values with confirmed facts. New records need a unique reference and name. Service, problem, ticket and change creation require an owner. Changes also need risk, planned time, plan and rollback.

## update-change

`npm run service -- update-change --change=C-1 --plan="Revised tested procedure" --actor=Lee`

Read changes first. Any plan change resets approval. Completed records cannot be edited.

## approve-change

`npm run service -- approve-change --change=C-1 --note="Test and rollback reviewed" --actor=Aroha`

Read change-review and the source test evidence first. Approval needs a different named reviewer, a service, test evidence and a future schedule. Names are operator-supplied, not signatures.

## complete-change

`npm run service -- complete-change --change=C-1 --outcome="Operator confirmed work completed" --actor=Lee`

Confirm the work actually happened and record its outcome. This records completion of an approved change; it never executes infrastructure work.

## retention

`npm run service -- retention --ticket=T-1 --personal=true --review-on=2027-01-01 --basis="Current support purpose" --actor=Aroha`

Read docs/compliance.md. Record the purpose and review date. Preserve existing holds unless the responsible person explicitly directs a change. Never delete automatically.

## draft-incident

`npm run service -- draft-incident --ticket=T-1`

Read the full ticket and activity first. Drafts stay in drafts/. Check evidence before sharing; this workflow never sends.

## import

`npm run service -- import freshservice --file=fixtures/freshservice.csv --actor="Migration operator" --dry-run`

Read docs/replace-freshservice.md. Confirm scope, columns and timezones. Preview first, compare counts, then rerun without --dry-run when the operator has requested import. Changed repeats stop the entire batch.

ISO timestamps carry a timezone. Dates are YYYY-MM-DD. Ticket priorities are low, medium, high or urgent. States are open, pending, resolved or closed; use resolve with evidence before closed. Service criticality is normal or critical. Asset states are in-use, spare or retired. Problem states are open, known-error or resolved. Change risks are low, medium or high. Personal classification is true or false.

Optional blank service/asset/problem references clear ticket links if the resulting links remain consistent. A blank hold explicitly clears it. The CLI records before and after values for updates. All mutations run in transactions.

Read commands return actual recorded values. sla-risk excludes resolved/closed tickets and does not infer a paused SLA clock. attention includes active records quiet for seven days, ownerless or past a deadline. asset-risk finds missing custody, expired warranty, overdue reviews or more than one open incident. change-review joins active incident counts for the same service. workload groups open/pending records by owner. weekly-review combines sla-risk, problem-review, change-review and compliance.

Import details and supported headers: [replacement guide](replace-freshservice.md).
