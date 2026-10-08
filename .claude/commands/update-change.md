# /update-change

Read changes first. Any plan change resets approval. Completed records cannot be edited.

Run:

```bash
npm run service -- update-change --change=C-1 --plan="Revised tested procedure" --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
