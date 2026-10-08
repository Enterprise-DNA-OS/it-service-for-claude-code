# /respond

This records a response the operator already delivered. It does not send one. Confirm the event first. The first response can only be acknowledged once.

Run:

```bash
npm run service -- respond --ticket=T-1 --note="Reply already delivered by operator" --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
