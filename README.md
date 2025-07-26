# Liquid Sort Game

A web-based game where users sort containers with liquid.

## Version Management

This project uses **Semantic Versioning** (SemVer) based on git commits:

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (v1.0 → v2.0): Breaking changes, complete redesigns, new game modes
- **MINOR** (v1.0 → v1.1): New features, enhancements, new levels
- **PATCH** (v1.0.0 → v1.0.1): Bug fixes, small tweaks, optimizations

### Automatic Version Detection

The system analyzes git commit messages to determine version bumps:

- **MAJOR**: `breaking:`, `major:`, `redesign`, `rewrite`, `!:`
- **MINOR**: `feat:`, `feature:`, `minor:`, `add`, `new`
- **PATCH**: `fix:`, `patch:`, `bug`, `hotfix`

### Usage

```bash
# Auto-detect version bump from git commits
npm run version:auto

# Manual version bumps
npm run version:major    # 1.0.0 → 2.0.0
npm run version:minor    # 1.0.0 → 1.1.0
npm run version:patch    # 1.0.0 → 1.0.1

# Check current version
npm run version:current
```

### Commit Message Examples

```bash
git commit -m "feat: add drag and drop functionality"     # → MINOR bump
git commit -m "fix: resolve container selection bug"      # → PATCH bump
git commit -m "breaking: redesign game mechanics"         # → MAJOR bump
```

## Development

```bash
# Start development server
npm start

# The game will be available at http://localhost:8000
```