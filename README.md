# Liquid Sort Game

A modern web-based puzzle game where users sort colored liquids between containers to solve each level. The project features a clean UI, interactive gameplay, and is fully containerized for easy deployment.

## Features

- **Puzzle Gameplay:** Move colored liquids between containers to group them by color. Win by sorting all colors into separate containers.
- **Modern UI:** Responsive design with smooth animations and drag-and-drop support.
- **Difficulty & Complexity Controls:** Adjust the number of extra/filled containers for custom challenges.
- **Sound Effects:** (If present in `src/assets/sounds/`)
- **Move Counter & Game Over Modal:** Track your moves and get feedback when you win or lose.
- **Versioning:** Automated version management based on commit messages.
- **Containerized Deployment:** Run locally or deploy anywhere with Docker and Nginx.

## Project Structure

- `index.html` — Main HTML file and game container.
- `src/js/` — Game logic:
  - `game.js`: Main entry, game state, user interaction.
  - `container.js`: Container logic (add/remove/check liquids).
  - `liquid.js`: Liquid object (color/type).
  - `utils.js`: Win/lose logic, move validation, shuffling.
- `src/css/` — Styles for layout, containers, liquids, and modals.
- `src/assets/sounds/` — (Optional) Sound effects.
- `scripts/` — Version management and sync scripts.
- `logs/` — Nginx logs (when running in Docker).
- `Dockerfile`, `docker-compose.yml`, `nginx.conf` — Containerization and web server config.

## Development

```bash
# Start development server
npm start
# The game will be available at http://localhost:8000
```

## Version Management

This project uses **Semantic Versioning** (SemVer) based on git commits. Versioning is managed by scripts in the `scripts/` folder and can be synced with PowerShell:

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

**Commit Message Examples:**
```bash
git commit -m "feat: add drag and drop functionality"     # → MINOR bump
git commit -m "fix: resolve container selection bug"      # → PATCH bump
git commit -m "breaking: redesign game mechanics"         # → MAJOR bump
```

## Docker Deployment

You can run the game locally or deploy it anywhere using Docker and Nginx. See `DOCKER.md` for full details.

```powershell
# On Windows (PowerShell)
.\deploy.ps1
```
```bash
# On Linux/Mac
chmod +x deploy.sh
./deploy.sh
# Or manually:
docker-compose up --build -d
```

Once deployed, access the game at:
- http://localhost:8080 (default Docker port)
- http://localhost:8091 (if using docker-compose.yml)

## Security & Performance

- Security headers and Content Security Policy enabled (see `nginx.conf`).
- Gzip compression and static asset caching for fast load times.
- Logs available in the `logs/` directory when running in Docker.

---

For more, see `DOCKER.md` and in-code comments.