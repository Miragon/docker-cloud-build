---
release: github-release
---
# Dependency updates

Rules for merging Renovate pull requests in this repo, by hand or with an agent such as the Kehrwoche
(Miragon/github-governance, `kehrwoche/`).

- The action runs from the checked-in `dist/`. An update in `package.json` has no effect until `dist/` is rebuilt: run
  `yarn install` and `yarn dist` on the PR branch and commit `dist/` before merging.
- The repo has no CI. `yarn dist` lints, type-checks and bundles, so a clean `yarn dist` is the check.
- A merged update reaches users only with a new release: the workflows that use the action pin a tag such as
  `v2.1.1`. After merged updates, release the next patch version (`v2.1.1` to `v2.1.2`) with generated notes. The
  header lets the Kehrwoche create that release.
