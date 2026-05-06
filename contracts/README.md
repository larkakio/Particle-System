## CheckIn

- `checkIn()` — once per UTC day, `msg.value` must be `0`.
- `lastCheckInDay(address)` stores **calendar day + 1** (`0` = never checked). Use `lastCalendarDay(address)` for the raw day index.
- Emits `CheckedIn(user, dayIndex, newStreak)`.

Deploy:

```bash
forge script script/DeployCheckIn.s.sol --rpc-url $BASE_RPC --broadcast --verify
```

Deployed instance (update if you redeploy): `0x2408F797A535C3Da3fFdE6b0606Cc913727dd3cE`
