# /add-service

Read the relevant register first. Use actual references and operator-supplied facts. If a reference is ambiguous, show the candidates and stop the write.

Run:

```bash
npm run service -- add-service --reference=S-NEW --name="Payroll access" --owner=Aroha --criticality=critical --actor=Aroha
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
