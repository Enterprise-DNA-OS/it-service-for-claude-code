# /approve-change

Read change-review and the source test evidence first. Approval needs a different named reviewer, a service, test evidence and a future schedule. Names are operator-supplied, not signatures.

Run:

```bash
npm run service -- approve-change --change=C-1 --note="Test and rollback reviewed" --actor=Aroha
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
