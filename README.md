# IT Service for Claude Code

Incidents, service requests, asset custody, recurring problems and change decisions in a database you own. MIT-licensed service records for Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install, try the demo and import ticket records. | Your service rules, fields, interfaces and Freshservice migration. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=freshservice&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=freshservice&utm_medium=managed) |

Freshservice Pro lists US$99 per agent per month billed annually. A 20-agent scenario is US$23,760 a year before other charges, not a verified customer invoice. [Vendor pricing](https://www.freshworks.com/freshservice/pricing/), checked 8 October 2026. [Selection and six scores](docs/research.md).

## Five weekly jobs

Triage incidents, review overdue responses, investigate recurring problems, review planned changes and check asset custody. The fictional Harbour demo includes overdue and stale incidents, an ownerless request, an expired-warranty laptop with repeated incidents and an unapproved change on the same service. Dates are relative to the first seed. Reseeding preserves later edits.

## Quick start

Node 20 or later, Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/it-service-for-claude-code.git
cd it-service-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

Start with /sla-risk, /problem-review and /change-review. PGlite runs locally in .data/db with no server installation. DATABASE_URL selects shared Postgres. Use a separate DATA_DIR and migrate without seed before real imports.

## 35 CLI commands and 36 slash recipes

/tickets, /sla-risk, /attention, /assets, /asset-risk, /services, /service-health, /problems, /problem-review, /changes, /change-review, /workload, /compliance, /weekly-review, /ticket, /activity, /add-ticket, /update-ticket, /respond, /resolve, /log, /add-service, /add-asset, /update-asset, /add-problem, /update-problem, /add-change, /update-change, /approve-change, /complete-change, /retention, /draft-incident, /import, /export, /customise, /new-view. The CLI also includes help. [All arguments](docs/cli.md). Every CLI command accepts --json. Partial IDs and case-insensitive names work; ambiguity lists candidates and exits 1.

## Ten questions for Monday

These joins work today. Freshservice has custom analytics, so these are demonstrated questions, not claims that its reporting cannot answer them. Your rules and joins are inspectable and editable here.

- Which incidents missed both response and resolution deadlines? `sla-risk`
- Which urgent work has gone quiet for a week? `attention`
- Which expired-warranty assets also have repeated open incidents? `asset-risk`
- Which services combine critical status with overdue incidents? `service-health`
- Which recurring problems still have open incidents? `problem-review`
- Which planned changes affect services with active incidents? `change-review`
- Which owners carry the most overdue tickets? `workload`
- Which personal records need a retention review? `compliance`
- Which services have no accountable owner? `services`
- What happened before an incident was resolved? `ticket --ticket=T-1`

## Your first hour: ten things to ask for

1. Put our business name and logo on the incident briefs.
2. Show incidents past both agreed deadlines.
3. Find quiet work with no clear next action.
4. Check laptops with repeated incidents and expired warranties.
5. Show planned changes alongside current service incidents.
6. Record the cause and workaround for a recurring fault.
7. Draft a review brief from the actual incident history.
8. Test our Freshservice export before saving records.
9. Add a business-unit field through a tested migration.
10. Add our Monday service-health view.

## Paperwork and checks

Change brand.json once. npm run docs renders incident briefs, change review records and asset custody records. npm run view renders two read-only HTML snapshots. /new-view adds another. These files never send, notify or execute a change.

/compliance checks record completeness against cited NZ privacy principles and separately named operating policies. Retention reviews never delete records. A change needs test evidence and a different named approver; a changed plan loses its approval. Approval names are self-reported, not signatures. [Rules and limits](docs/compliance.md).

## Bring ticket records across

```bash
npm run service -- import freshservice --file=/private/tickets.csv --actor="Migration operator" --dry-run
npm run service -- import freshservice --file=/private/tickets.csv --actor="Migration operator"
```

The import preserves original fields, validates states and times, skips identical repeats and rejects changed repeats. A bad row rolls back the whole batch. Standard ticket exports exclude conversations and internal notes. Attachments, service-request item fields, assets, changes, calendars and connections need separate mapping. [Export steps, headings and timezone handling](docs/replace-freshservice.md).

The export command writes all six record sets including local history. Back up referenced documents separately. Local use allows one process at a time. Shared use needs authenticated access, restricted roles and tested backups. [Why no front end](docs/why-no-front-end.md) describes the employee portal, mobile workflow and connections to scope for your version. Hosting and agent subscriptions have separate costs.

## Verification

npm test uses a temporary database and exercises all 35 commands. It checks actual queue values, record ambiguity, approval invalidation, incident/problem transitions, custody evidence, retention holds, import dry runs and rollback, repeat imports, drafts, exports and escaped HTML. TEST_DATABASE_URL runs the same suite against a fresh disposable Postgres database. GitHub checks cover Linux and Windows on Node 20/22 and Postgres 17.

MIT licence. Not affiliated with Freshworks or Anthropic. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=freshservice&utm_medium=readme).
