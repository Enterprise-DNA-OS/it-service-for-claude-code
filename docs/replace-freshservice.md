# Replace the Freshservice ticket register

The free importer covers selected ticket-level CSV fields. It is not a complete account migration. [Freshservice export instructions](https://support.freshservice.com/support/solutions/articles/50000006341-exporting-tickets), checked 8 October 2026.

1. In Tickets, apply the needed filters, clear selected tickets, choose Export and CSV, then select the fields. Include Ticket ID, Subject, Created Time, Status, Priority, Type, Requester, Agent and available deadline fields. Field selections need to be selected for each export. Download the emailed export and compare its count with the selected scope. Split large histories to meet the vendor's export limits.
2. Keep the original CSV in a private location. Use a separate empty DATA_DIR for real records and run npm run migrate without the fictional seed. Confirm the actual heading names and timestamps. The fixture is synthetic and illustrates supported columns, not a claimed byte-for-byte vendor export.
3. Preview and import:

```bash
npm run service -- import freshservice --file=/private/tickets.csv --actor="Migration operator" --dry-run
npm run service -- import freshservice --file=/private/tickets.csv --actor="Migration operator"
```

ISO times must carry Z or an offset. Local YYYY-MM-DD HH:mm:ss times need --timezone=+12:00 (use the actual export offset). Split exports across daylight-saving offsets before importing naive local times. Other time formats need explicit conversion while preserving the original export. The importer refuses to guess.

If headers differ, supply --map=/private/mapping.json. Example: {"source_id":"Ticket number","name":"Ticket title","opened_at":"Opened"}. Mapping keys and referenced columns are validated. Supported mapping keys are source_id, name, requester, owner, priority, status, type, opened_at, response_due, resolve_due, responded_at, resolved_at and resolution.

Ticket references become FS- plus source ID. Source rows are retained. Identical reimports skip records without overwriting later local work. Changed source rows or mapping options stop the entire batch for reconciliation. Duplicate source IDs and invalid timestamps stop the batch. Dry runs use a transaction rollback, including the audit entries.

4. Compare tickets, workload, compliance and export counts. Review missing owners, deadlines, personal-record retention and imported closure evidence. Map service, asset and problem links separately with update-ticket. Then check a sample of open and closed tickets against Freshservice before switching the operating workflow.

Standard ticket CSV does not include conversations or internal notes. Attachments, service-request item fields, SLA calendars, knowledge articles, assets, problems, changes, permissions, automation, discovery and integrations are separate migration work. The vendor documents API/XML options for conversation history. Enterprise DNA scopes those mappings before a managed migration; no background connector is installed here.

The export command writes all six record sets to JSON, including source rows and local history. Back up referenced documents separately. Database backup and restore should be tested before operational use. No real records or export files belong in Git.
