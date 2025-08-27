#!/bin/sh

echo "🚀 Script simples de inicialização..."
echo "📁 Diretório: $(pwd)"
echo "🔑 Gerando chave..."
php artisan key:generate --force
echo "🌐 Iniciando servidor na porta $PORT..."
php artisan serve --host=0.0.0.0 --port=$PORT
