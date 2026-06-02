# Contributing to Swarmtally

Thank you for your interest in contributing! This guide will help you get started quickly.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Project Overview

Swarmtally is an AI-powered drone detection and counting system built with:
- **Backend**: FastAPI + YOLOv8 (Python)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS

The core detection logic lives in `backend/main.py`. The `best.pt` model is a trained YOLOv8 weight file.

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Git
- Docker (optional, for container-based development)

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Drone_detection.git
cd Drone_detection
```

### 2. Set Up Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Set Up Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

### 4. Start Development Servers

```bash
# Terminal 1 – Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 – Frontend
cd frontend && npm run dev
```

Or with Make:
```bash
make install
# Then in separate terminals:
make dev-backend
make dev-frontend
```

---

## Development Workflow

### Branching

Use descriptive branch names following this convention:

| Type | Format | Example |
|---|---|---|
| Feature | `feat/short-description` | `feat/add-batch-detection` |
| Bug fix | `fix/short-description` | `fix/cors-header-missing` |
| Documentation | `docs/short-description` | `docs/update-api-reference` |
| Refactor | `refactor/short-description` | `refactor/extract-model-service` |
| Chore | `chore/short-description` | `chore/update-dependencies` |

```bash
git checkout -b feat/your-feature-name
```

---

## Code Style

### Python (Backend)

- Follow **PEP 8**
- Use type hints where practical
- Keep `main.py` focused — add new logic to separate modules
- Use descriptive variable names
- Add docstrings to all public functions

### TypeScript/React (Frontend)

- Use **Prettier** for formatting: `npm run format`
- Use **ESLint** for linting: `npm run lint`
- Prefer `const` over `let`
- Use TypeScript types for all props and API responses
- Keep components focused and single-purpose
- Use `@/` path alias instead of relative imports

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Examples**:
```
feat(backend): add confidence threshold config via env var
fix(frontend): handle empty response from detect endpoint
docs(readme): add Docker deployment section
chore(deps): update ultralytics to 8.3.0
ci: add frontend build check to GitHub Actions
```

---

## Pull Request Process

1. **Before opening a PR**, make sure:
   - `npm run lint` passes (no errors)
   - `npm run type-check` passes
   - `npm run build` succeeds
   - Backend starts without errors: `uvicorn main:app --reload`
   - The detection workflow still works end-to-end

2. **PR description** should include:
   - What changed and why
   - Screenshots for UI changes
   - How to test the change

3. **PR title** should follow the same Conventional Commits format.

4. Wait for review. Address all requested changes before requesting re-review.

---

## Reporting Issues

When opening a bug report, include:

- OS and version (Windows 11, macOS 14, Ubuntu 22.04...)
- Python version (`python --version`)
- Node.js version (`node --version`)
- Error message (full traceback)
- Steps to reproduce

**Feature requests** are welcome! Open an issue with the `enhancement` label.

---

## Important: Core Logic

> **Do not modify `backend/main.py`'s YOLO inference logic or the drone counting formula (`count = len(results[0].boxes)`) without discussing in an issue first.** These are core to the application's accuracy.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
