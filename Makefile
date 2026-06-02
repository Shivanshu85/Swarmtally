# =============================================================================
# Swarmtally – Makefile
# Developer shortcuts for common tasks
#
# Usage:
#   make install     – Install all dependencies (backend + frontend)
#   make dev         – Start both servers for local development
#   make docker-up   – Start full stack with Docker Compose
#   make docker-down – Stop and remove Docker containers
#   make lint        – Run linters for both backend and frontend
#   make format      – Auto-format all code
#   make type-check  – Run TypeScript type checking
#   make clean       – Remove build artifacts
# =============================================================================

.PHONY: install dev dev-backend dev-frontend docker-up docker-down docker-build \
        lint format type-check clean help

# ── Colors ───────────────────────────────────────────────────────────────────
CYAN  := \033[36m
RESET := \033[0m
BOLD  := \033[1m

help: ## Show this help message
	@echo ""
	@echo "$(BOLD)Swarmtally – Developer Commands$(RESET)"
	@echo "================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Installation ─────────────────────────────────────────────────────────────
install: ## Install all dependencies (backend + frontend)
	@echo "$(CYAN)▶ Installing backend dependencies...$(RESET)"
	cd backend && pip install -r requirements.txt
	@echo "$(CYAN)▶ Installing frontend dependencies...$(RESET)"
	cd frontend && npm install
	@echo "$(CYAN)✓ All dependencies installed$(RESET)"

# ── Local Development ─────────────────────────────────────────────────────────
dev-backend: ## Start FastAPI backend server (port 8000)
	@echo "$(CYAN)▶ Starting FastAPI backend on http://localhost:8000$(RESET)"
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start Next.js frontend server (port 3000)
	@echo "$(CYAN)▶ Starting Next.js frontend on http://localhost:3000$(RESET)"
	cd frontend && npm run dev

dev: ## Start both servers (requires two terminals)
	@echo "$(CYAN)▶ Run these commands in separate terminals:$(RESET)"
	@echo "  Terminal 1: make dev-backend"
	@echo "  Terminal 2: make dev-frontend"

# ── Docker ───────────────────────────────────────────────────────────────────
docker-build: ## Build Docker images without starting
	docker-compose build

docker-up: ## Start full stack with Docker Compose (detached)
	@echo "$(CYAN)▶ Starting Swarmtally with Docker Compose...$(RESET)"
	docker-compose up --build -d
	@echo "$(CYAN)✓ Running at: http://localhost:3000$(RESET)"
	@echo "$(CYAN)  Backend API: http://localhost:8000$(RESET)"
	@echo "$(CYAN)  API Docs:    http://localhost:8000/docs$(RESET)"

docker-down: ## Stop and remove Docker containers
	@echo "$(CYAN)▶ Stopping containers...$(RESET)"
	docker-compose down
	@echo "$(CYAN)✓ Containers stopped$(RESET)"

docker-logs: ## Stream logs from all containers
	docker-compose logs -f

docker-clean: ## Stop containers and remove volumes (WARNING: deletes upload/output data)
	docker-compose down -v

# ── Code Quality ─────────────────────────────────────────────────────────────
lint: ## Run ESLint on frontend
	@echo "$(CYAN)▶ Running frontend linter...$(RESET)"
	cd frontend && npm run lint

format: ## Auto-format frontend code with Prettier
	@echo "$(CYAN)▶ Formatting frontend code...$(RESET)"
	cd frontend && npm run format

type-check: ## Run TypeScript type checking
	@echo "$(CYAN)▶ Running TypeScript type check...$(RESET)"
	cd frontend && npm run type-check

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts
	@echo "$(CYAN)▶ Cleaning build artifacts...$(RESET)"
	rm -rf frontend/.next frontend/out frontend/build
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(CYAN)✓ Clean complete$(RESET)"
