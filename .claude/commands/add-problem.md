# /add-problem

Read the relevant register first. Use actual references and operator-supplied facts. If a reference is ambiguous, show the candidates and stop the write.

Run:

```bash
npm run service -- add-problem --reference=P-NEW --name="Recurring login fault" --service=S-1 --owner=Lee --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
