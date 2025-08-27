#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento
echo "🚀 Iniciando Sistema de Romaneio - Ambiente de Desenvolvimento"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down

# Construir e iniciar containers
echo "🔨 Construindo containers..."
docker compose up --build -d

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Executar migrações
echo "🗄️ Executando migrações..."
docker compose exec backend php artisan migrate --force

# Gerar chave da aplicação
echo "🔑 Gerando chave da aplicação..."
docker compose exec backend php artisan key:generate

# Limpar cache
echo "🧹 Limpando cache..."
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear

echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️ PostgreSQL: localhost:5432"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker compose logs -f"
echo "  - Parar: docker compose down"
echo "  - Rebuild: docker compose up --build"
echo ""
echo "🎉 Acesse http://localhost:3000 para começar!" 