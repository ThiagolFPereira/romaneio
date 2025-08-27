#!/bin/bash

# Script para parar todos os containers
echo "🛑 Parando Sistema de Romaneio"

# Parar containers de desenvolvimento
echo "📦 Parando containers de desenvolvimento..."
docker compose down

# Parar containers de produção
echo "📦 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Remover volumes (opcional - descomente se quiser limpar dados)
# echo "🗑️ Removendo volumes..."
# docker volume rm romaneio_postgres_data

# Remover imagens não utilizadas (opcional)
echo "🧹 Limpando imagens não utilizadas..."
docker image prune -f

echo "✅ Sistema parado com sucesso!"
echo ""
echo "📋 Para reiniciar:"
echo "  - Desenvolvimento: ./scripts/start-dev.sh"
echo "  - Produção: ./scripts/start-prod.sh" 