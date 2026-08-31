# Desktop Quality Gates

This desktop package is a thin Electron runtime wrapper. The authoritative executable gates are:

- `npm run smoke:native` — Windows/native folder-watcher runtime smoke.
- `npm run package:win` — Windows x64 NSIS packaging.
- `npm test` — aliases the native runtime smoke so a standard test gate exists.
- `npm run lint` — syntax validation of the Electron main/preload CommonJS entrypoints.
- `npm run build` — Windows x64 NSIS build/package gate.

The desktop package does not maintain a separate unit-test suite at this time. These scripts are explicit quality contracts, not placeholders for an unimplemented test framework.

Security/install-script policy:

- Do not use `npm audit fix --force`.
- Electron install scripts must be explicitly approved at the exact resolved version after installation.
- `electron-winstaller` is a transitive dependency of the packaging toolchain and may be approved only after its exact resolved version is observed and verified in the installed dependency tree.
- Unreviewed install scripts remain blocked.
