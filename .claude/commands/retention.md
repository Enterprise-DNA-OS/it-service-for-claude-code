# /retention

Read docs/compliance.md. Record the purpose and review date. Preserve existing holds unless the responsible person explicitly directs a change. Never delete automatically.

Run:

```bash
npm run service -- retention --ticket=T-1 --personal=true --review-on=2027-01-01 --basis="Current support purpose" --actor=Aroha
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
