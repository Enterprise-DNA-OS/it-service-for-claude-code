# /update-problem

Read problems and problem-review first. Resolve linked active tickets before recording a problem as resolved.

Run:

```bash
npm run service -- update-problem --problem=P-1 --root-cause="Confirmed configuration fault" --workaround="Use spare" --status=known-error --actor=Lee
```

Replace example facts and dates with confirmed values. Append --json for structured output. Record the real operator in --actor. Review the returned record before reporting success. Do not invent an event or send anything.
