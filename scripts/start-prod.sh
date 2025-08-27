#!/bin/bash

# Script para iniciar o ambiente de produção
echo "🚀 Iniciando Sistema de Romaneio - Ambiente de Produção"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose -f docker-compose.prod.yml down

# Construir e iniciar containers
echo "🔨 Construindo containers de produção..."
docker compose -f docker-compose.prod.yml up --build -d

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 15

# Executar migrações
echo "🗄️ Executando migrações..."
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force

# Otimizar para produção
echo "⚡ Otimizando para produção..."
docker compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker compose -f docker-compose.prod.yml exec backend php artisan view:cache

echo "✅ Sistema de produção iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️ PostgreSQL: localhost:5432"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  - Parar: docker compose -f docker-compose.prod.yml down"
echo "  - Rebuild: docker compose -f docker-compose.prod.yml up --build"
echo ""
echo "🎉 Sistema de produção pronto!" 