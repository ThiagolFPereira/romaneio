#!/bin/sh

# Script de inicialização para o Render
echo "🚀 Iniciando Sistema de Romaneio..."
echo "📁 Diretório atual: $(pwd)"
echo "🔍 Variáveis de ambiente:"
echo "   PORT: $PORT"
echo "   DB_HOST: $DB_HOST"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   DB_USERNAME: $DB_USERNAME"

# Gerar uma chave base64 manualmente ANTES de criar o .env
echo "🔑 Gerando chave da aplicação manualmente..."
APP_KEY_VALUE=$(openssl rand -base64 32)
echo "✅ Chave gerada: $APP_KEY_VALUE"

# Criar o .env com a chave já definida
echo "📝 Criando arquivo .env com chave pré-definida..."
cat > .env << EOF
APP_NAME="Sistema de Romaneio"
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
APP_KEY=base64:$APP_KEY_VALUE
DB_CONNECTION=pgsql
DB_HOST=$DB_HOST
DB_PORT=5432
DB_DATABASE=$DB_DATABASE
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF

echo "✅ .env criado com sucesso"
echo "📋 Conteúdo do .env:"
cat .env

# Verificar se o artisan existe
if [ ! -f artisan ]; then
    echo "❌ Arquivo artisan não encontrado!"
    exit 1
fi

# Verificar se a chave foi definida corretamente
if grep -q "APP_KEY=base64:" .env; then
    echo "✅ Chave da aplicação está definida no .env"
else
    echo "❌ Erro: APP_KEY não foi definida corretamente"
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
