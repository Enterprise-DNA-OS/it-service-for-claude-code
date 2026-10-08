# /complete-change

Confirm the work actually happened and record its outcome. This records completion of an approved change; it never executes infrastructure work.

Run:

```bash
npm run service -- complete-change --change=C-1 --outcome="Operator confirmed work completed" --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
