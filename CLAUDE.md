# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run unit tests (Jest, no watch mode)
npm test

# Run a single test file
npx jest tests/date.test.js

# Install dependencies
npm install
```

There is no local dev server — the miniprogram runs inside WeChat DevTools. Cloud functions are deployed via WeChat DevTools right-click → "上传并部署：云端安装依赖".

## Architecture

This is a **WeChat miniprogram** backed by **WeChat CloudBase** (serverless). There is no separate backend server.

### Key directories

- `miniprogram/` — frontend (WXML + WXSS + JS, WeChat native)
- `cloudfunctions/cloud1-5g5etfrv38da117f/functions/` — cloud functions (Node.js, wx-server-sdk)
- `tests/` — Jest unit tests for pure utility functions only

### Data flow

```
miniprogram/utils/cloud.js  →  wx.cloud.callFunction()  →  cloudfunctions/.../index.js  →  CloudBase DB
```

`cloud.js` is the single call wrapper: it rejects on `code !== 0`, so all cloud functions must return `{ code: 0, ...data }` on success and `{ code: -1, message }` on error.

### Cloud functions

| Function | Purpose |
|----------|---------|
| `login` | Upsert user in `users` collection, return `openid` |
| `itemAdd` | Add item to `items` collection |
| `itemUpdate` | Update item by `_id` |
| `itemDelete` | Delete item by `_id` |
| `itemList` | Query all items for current user |

### Frontend pages

| Page | Role |
|------|------|
| `index` | Item list with expiry filter tabs (all/near/expired) |
| `add` | Add item form with photo upload |
| `detail` | Item detail + edit |
| `profile` | User info + login |

### Shared utilities

- `miniprogram/utils/date.js` — `getDaysLeft`, `getItemStatus`, `formatDate`, `toMidnight`. Pure functions, fully unit-tested.
- `miniprogram/utils/cloud.js` — `call(name, data)` wrapper around `wx.cloud.callFunction`.

### Status thresholds

| Status | Condition |
|--------|-----------|
| `normal` | daysLeft > 7 |
| `near` | 0 ≤ daysLeft ≤ 7 |
| `expired` | daysLeft < 0 |

### Global state (`app.js`)

`app.globalData` holds `openid` (set after login cloud function resolves) and `userInfo`. Login is called automatically on `onLaunch`.

### Cloud environment

Environment ID: `cloud1-5g5etfrv38da117f`. Configured in `miniprogram/app.js` and each cloud function via `cloud.DYNAMIC_CURRENT_ENV`.

### Database collections

- `users` — one doc per user, keyed by `_openid`
- `items` — item records, `_openid` auto-injected by CloudBase, permission: creator-only read/write

## Testing scope

Jest tests cover only `miniprogram/utils/date.js` (pure functions). Cloud functions and UI are validated manually in WeChat DevTools.
