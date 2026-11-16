---
release: github-release
---
# Dependency updates

Rules for merging Renovate pull requests in this repo, by hand or with an agent such as the Kehrwoche
(Miragon/github-governance, `kehrwoche/`).

- The action runs from the checked-in `dist/`. An update in `package.json` has no effect until `dist/` is rebuilt. On
  Renovate branches the workflow `dist` rebuilds it and pushes the commit `chore: rebuild dist`. If `dist` is red, the
  build failed: do not merge, a human looks.
- The workflow `check` runs `yarn dist` (lint, type check, bundle) and fails if `dist/` is not the build of the
  commit. Merge when `check` is green.
- A merged update reaches users only with a new release: the workflows that use the action pin a tag such as
  `v2.1.1`. After merged updates, release the next patch version (`v2.1.1` to `v2.1.2`) with generated notes. The
  header lets the Kehrwoche create that release.
