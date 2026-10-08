# /import

Read docs/replace-freshservice.md. Confirm scope, columns and timezones. Preview first, compare counts, then rerun without --dry-run when the operator has requested import. Changed repeats stop the entire batch.

Run:

```bash
npm run service -- import freshservice --file=fixtures/freshservice.csv --actor="Migration operator" --dry-run
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
