# /update-ticket

Read ticket and activity first. Reopening clears the resolution and keeps original deadlines and first response. Changing a linked service must agree with the asset and problem service.

Run:

```bash
npm run service -- update-ticket --ticket=T-1 --owner=Lee --actor=Aroha
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
