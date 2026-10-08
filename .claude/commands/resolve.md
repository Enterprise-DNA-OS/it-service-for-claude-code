# /resolve

An owner and evidence note are required. Confirm recovery before resolving. Closing is a separate update after resolution.

Run:

```bash
npm run service -- resolve --ticket=T-1 --note="Requester confirmed recovery" --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
