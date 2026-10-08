# /add-change

Read the relevant register first. Use actual references and operator-supplied facts. If a reference is ambiguous, show the candidates and stop the write.

Run:

```bash
npm run service -- add-change --reference=C-NEW --name="Identity update" --service=S-1 --owner=Lee --risk=high --scheduled=2027-01-01T01:00:00Z --plan="Apply tested setting" --rollback="Restore backup" --evidence=archive://test/1 --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
