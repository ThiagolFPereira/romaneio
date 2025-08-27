#!/bin/sh

# Script de inicialização para o Render
echo "🚀 Iniciando Sistema de Romaneio..."
echo "📁 Diretório atual: $(pwd)"

# Debug: Mostrar TODAS as variáveis de ambiente
echo "🔍 TODAS as variáveis de ambiente disponíveis:"
env | sort

echo "🔍 Variáveis de banco específicas:"
echo "   DB_HOST: $DB_HOST"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   DB_USERNAME: $DB_USERNAME"
echo "   DB_PASSWORD: $DB_PASSWORD"
echo "   DATABASE_URL: $DATABASE_URL"

# Verificar se estamos no Render e ajustar variáveis de banco
if [ "$RENDER" = "true" ]; then
    echo "🌐 Detectado ambiente Render"
    
    # Se DB_HOST for "postgres" (inválido), usar variáveis padrão do Render
    if [ "$DB_HOST" = "postgres" ]; then
        echo "⚠️  DB_HOST inválido detectado, usando variáveis padrão do Render"
        
        # Tentar usar variáveis padrão do Render PostgreSQL
        if [ -n "$RENDER_INTERNAL_HOSTNAME" ]; then
            DB_HOST="$RENDER_INTERNAL_HOSTNAME"
            echo "✅ Usando RENDER_INTERNAL_HOSTNAME: $DB_HOST"
        else
            # Fallback para localhost se não houver hostname interno
            DB_HOST="localhost"
            echo "⚠️  Usando fallback localhost"
        fi
    fi
    
    # Verificar se temos DATABASE_URL (formato padrão do Render)
    if [ -n "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL encontrada, extraindo variáveis..."
        # Extrair variáveis da DATABASE_URL
        # Formato: postgresql://user:pass@host:port/database
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_DATABASE=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        
        echo "🔧 Variáveis extraídas da DATABASE_URL:"
        echo "   DB_HOST: $DB_HOST"
        echo "   DB_PORT: $DB_PORT"
        echo "   DB_DATABASE: $DB_DATABASE"
        echo "   DB_USERNAME: $DB_USERNAME"
        echo "   DB_PASSWORD: $DB_PASSWORD"
    fi
else
    echo "🏠 Ambiente local detectado"
fi

echo "🔧 Variáveis de banco finais:"
echo "   DB_HOST: $DB_HOST"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   DB_USERNAME: $DB_USERNAME"
echo "   DB_PASSWORD: $DB_PASSWORD"

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
DB_PORT=${DB_PORT:-5432}
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

# Testar conexão com o banco antes de executar migrations
echo "🔌 Testando conexão com o banco de dados..."
if php artisan tinker --execute="echo 'Conexão OK'; exit();" 2>/dev/null; then
    echo "✅ Conexão com banco estabelecida"
else
    echo "❌ Erro na conexão com banco"
    echo "🔍 Verificando configurações..."
    php artisan config:show database
    exit 1
fi

# Executar migrations
echo "🗄️  Executando migrations..."
php artisan migrate --force

# Executar seeders
echo "🌱 Executando seeders..."
php artisan db:seed --force

# Verificar se o usuário foi criado
echo "👤 Verificando se o usuário foi criado..."
if php artisan tinker --execute="echo 'Usuários: ' . App\Models\User::count(); exit();" 2>/dev/null; then
    echo "✅ Usuário verificado no banco"
else
    echo "⚠️  Não foi possível verificar usuários"
fi

# Verificar se o servidor pode iniciar
echo "🌐 Iniciando servidor na porta $PORT..."
echo "🔍 Verificando se a porta $PORT está disponível..."
php artisan serve --host=0.0.0.0 --port=$PORT
