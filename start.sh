#!/bin/sh

# Script de inicialização para o Render
echo "🚀 Iniciando Sistema de Romaneio..."
echo "📁 Diretório atual: $(pwd)"
echo "🔍 Variáveis de ambiente:"
echo "   PORT: $PORT"
echo "   DB_HOST: $DB_HOST"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   DB_USERNAME: $DB_USERNAME"

# Verificar se o .env existe, se não, criar um básico
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env básico..."
    cat > .env << EOF
APP_NAME="Sistema de Romaneio"
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
APP_KEY=
DB_CONNECTION=pgsql
DB_HOST=\${DB_HOST}
DB_PORT=5432
DB_DATABASE=\${DB_DATABASE}
DB_USERNAME=\${DB_USERNAME}
DB_PASSWORD=\${DB_PASSWORD}
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF
    echo "✅ .env criado com sucesso"
else
    echo "✅ .env já existe"
fi

# Verificar se o artisan existe
if [ ! -f artisan ]; then
    echo "❌ Arquivo artisan não encontrado!"
    exit 1
fi

# Gerar chave da aplicação
echo "🔑 Gerando chave da aplicação..."
php artisan key:generate --force

# Verificar se a chave foi gerada
if grep -q "APP_KEY=base64:" .env; then
    echo "✅ Chave da aplicação gerada com sucesso"
else
    echo "❌ Erro ao gerar chave da aplicação"
    exit 1
fi

# Executar migrations
echo "🗄️  Executando migrations..."
php artisan migrate --force

# Executar seeders
echo "🌱 Executando seeders..."
php artisan db:seed --force

# Verificar se o servidor pode iniciar
echo "🌐 Iniciando servidor na porta $PORT..."
echo "🔍 Verificando se a porta $PORT está disponível..."
php artisan serve --host=0.0.0.0 --port=$PORT
