# Makefile para Sistema de Romaneio
.PHONY: help dev prod stop logs clean build rebuild

# Cores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(GREEN)Sistema de Romaneio - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

dev: ## Inicia ambiente de desenvolvimento
	@echo "$(GREEN)🚀 Iniciando ambiente de desenvolvimento...$(NC)"
	@chmod +x scripts/start-dev.sh
	@./scripts/start-dev.sh

prod: ## Inicia ambiente de produção
	@echo "$(GREEN)🚀 Iniciando ambiente de produção...$(NC)"
	@chmod +x scripts/start-prod.sh
	@./scripts/start-prod.sh

stop: ## Para todos os containers
	@echo "$(YELLOW)🛑 Parando containers...$(NC)"
	@chmod +x scripts/stop.sh
	@./scripts/stop.sh

logs: ## Mostra logs dos containers
	@echo "$(GREEN)📋 Mostrando logs...$(NC)"
	@docker compose logs -f

logs-prod: ## Mostra logs dos containers de produção
	@echo "$(GREEN)📋 Mostrando logs de produção...$(NC)"
	@docker compose -f docker-compose.prod.yml logs -f

build: ## Constrói as imagens Docker
	@echo "$(GREEN)🔨 Construindo imagens...$(NC)"
	@docker compose build

build-prod: ## Constrói as imagens Docker de produção
	@echo "$(GREEN)🔨 Construindo imagens de produção...$(NC)"
	@docker compose -f docker-compose.prod.yml build

rebuild: ## Reconstrói as imagens Docker
	@echo "$(GREEN)🔨 Reconstruindo imagens...$(NC)"
	@docker compose build --no-cache

rebuild-prod: ## Reconstrói as imagens Docker de produção
	@echo "$(GREEN)🔨 Reconstruindo imagens de produção...$(NC)"
	@docker compose -f docker-compose.prod.yml build --no-cache

clean: ## Limpa containers, imagens e volumes não utilizados
	@echo "$(YELLOW)🧹 Limpando Docker...$(NC)"
	@docker system prune -f
	@docker volume prune -f

shell-backend: ## Acessa o shell do container backend
	@echo "$(GREEN)🐚 Acessando shell do backend...$(NC)"
	@docker compose exec backend bash

shell-frontend: ## Acessa o shell do container frontend
	@echo "$(GREEN)🐚 Acessando shell do frontend...$(NC)"
	@docker compose exec frontend sh

shell-postgres: ## Acessa o PostgreSQL
	@echo "$(GREEN)🗄️ Acessando PostgreSQL...$(NC)"
	@docker compose exec postgres psql -U romaneio_user -d romaneio

migrate: ## Executa migrações do banco
	@echo "$(GREEN)🗄️ Executando migrações...$(NC)"
	@docker compose exec backend php artisan migrate

migrate-fresh: ## Recria o banco de dados
	@echo "$(RED)⚠️ Recriando banco de dados...$(NC)"
	@docker compose exec backend php artisan migrate:fresh

seed: ## Executa seeders do banco
	@echo "$(GREEN)🌱 Executando seeders...$(NC)"
	@docker compose exec backend php artisan db:seed

status: ## Mostra status dos containers
	@echo "$(GREEN)📊 Status dos containers:$(NC)"
	@docker compose ps

status-prod: ## Mostra status dos containers de produção
	@echo "$(GREEN)📊 Status dos containers de produção:$(NC)"
	@docker compose -f docker-compose.prod.yml ps 