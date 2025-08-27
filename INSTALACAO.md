# 📋 Instruções de Instalação - Sistema de Romaneio

## Pré-requisitos

- **PHP 8.2+** com extensões: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- **Composer** (gerenciador de dependências PHP)
- **Node.js 18+** e **npm**
- **MySQL 8.0+** ou **PostgreSQL 13+**
- **Git**

## 🚀 Instalação Passo a Passo

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd Romaneio
```

### 2. Configuração do Backend (Laravel)

#### 2.1. Instalar Dependências
```bash
cd backend
composer install
```

#### 2.2. Configurar Ambiente
```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate
```

#### 2.3. Configurar Banco de Dados
Edite o arquivo `.env` e configure as variáveis de banco de dados:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=romaneio
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

#### 2.4. Criar Banco de Dados
```sql
CREATE DATABASE romaneio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.5. Executar Migrações
```bash
php artisan migrate
```

#### 2.6. Iniciar Servidor
```bash
php artisan serve
```

O backend estará disponível em: `http://localhost:8000`

### 3. Configuração do Frontend (React)

#### 3.1. Instalar Dependências
```bash
cd frontend
npm install
```

#### 3.2. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 🧪 Testando o Sistema

### 1. Acesse o Frontend
Abra seu navegador e acesse: `http://localhost:3000`

### 2. Teste a Funcionalidade
1. **Digite uma chave de acesso** com exatamente 44 dígitos
   - Exemplo: `12345678901234567890123456789012345678901234`
2. **Clique em "Consultar Nota"**
3. **Verifique os dados exibidos**:
   - Chave de Acesso
   - Destinatário: "Empresa de Exemplo S.A."
   - Valor Total: "R$ 1.234,56"
4. **Clique em "Salvar no Histórico"**
5. **Confirme a mensagem de sucesso**

### 3. Verificar no Banco de Dados
```sql
SELECT * FROM historico_notas;
```

## 🔧 Configurações Adicionais

### Configuração CORS
O arquivo `backend/config/cors.php` já está configurado para permitir requisições do frontend. Se necessário, adicione outros domínios em `allowed_origins`.

### Configuração de Produção

#### Backend
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Frontend
```bash
cd frontend
npm run build
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o MySQL/PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `php artisan tinker`

### Erro CORS
- Verifique se o frontend está rodando na porta 3000
- Confirme a configuração em `backend/config/cors.php`
- Limpe o cache: `php artisan config:clear`

### Erro de Dependências
```bash
# Backend
composer install --ignore-platform-reqs

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de Migração
```bash
php artisan migrate:fresh
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique se todos os pré-requisitos estão instalados
2. Confirme as versões das tecnologias
3. Verifique os logs de erro
4. Abra uma issue no repositório com detalhes do erro

## 🔒 Segurança

- Nunca commite o arquivo `.env` no repositório
- Use senhas fortes para o banco de dados
- Configure HTTPS em produção
- Mantenha as dependências atualizadas 