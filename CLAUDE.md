# IT Service for Claude Code: operating instructions

For the person who owns internal service incidents, service requests, assets, recurring problems and change reviews. The Harbour seed is fictional. Set the organisation name in brand.json.

Read the CLI before answering. Read the full ticket and activity before changing it. Never invent a response, recovery, approval or infrastructure event. An approval or completion command records something a person has confirmed. It sends nothing and executes no infrastructure work. Do not delete records. Preserve retention holds. Read docs/compliance.md before interpreting findings.

## One route per recurring job

| Job | Recipe |
|---|---|
| tickets | /tickets |
| sla risk | /sla-risk |
| attention | /attention |
| assets | /assets |
| asset risk | /asset-risk |
| services | /services |
| service health | /service-health |
| problems | /problems |
| problem review | /problem-review |
| changes | /changes |
| change review | /change-review |
| workload | /workload |
| compliance | /compliance |
| weekly review | /weekly-review |
| ticket | /ticket |
| activity | /activity |
| add ticket | /add-ticket |
| update ticket | /update-ticket |
| respond | /respond |
| resolve | /resolve |
| log | /log |
| add service | /add-service |
| add asset | /add-asset |
| update asset | /update-asset |
| add problem | /add-problem |
| update problem | /update-problem |
| add change | /add-change |
| update change | /update-change |
| approve change | /approve-change |
| complete change | /complete-change |
| retention | /retention |
| draft incident | /draft-incident |
| import | /import |
| export | /export |
| customise | /customise |
| new view | /new-view |

Use node scripts/service.mjs help for arguments and append --json for machine output. References and case-insensitive names resolve first, then partial IDs or names. Ambiguous matches list candidates and exit 1. Recipes live only in .claude/commands.

The migration and fictional seed live in supabase/. scripts/service.mjs is the one CLI. brand.json supplies the name, logo and colours. drafts/, exports/, views/ and docs-out/ contain local output and are ignored by Git. Never commit real ticket exports or personal records.

PGlite allows one local process at a time. DATABASE_URL selects shared Postgres with verified TLS. Actor names are self-reported, not authenticated signatures. The database owner can change history. Shared use requires authenticated access, restricted privileges and tested recovery.

Omni by Enterprise DNA installs, customises and runs your version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=freshservice&utm_medium=instructions
