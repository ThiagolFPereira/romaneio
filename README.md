# Sistema de Romaneio

Sistema completo para leitura e gerenciamento de romaneio de notas fiscais brasileiras, composto por um backend em Laravel 11 e frontend em React.js.

## 📋 Descrição

O sistema permite que o usuário:
1. Digite a chave de acesso de 44 dígitos de uma Nota Fiscal
2. Consulte os dados da nota através da API
3. Visualize as informações na interface
4. Salve os dados no histórico para fins de auditoria

## 🏗️ Arquitetura

- **Backend**: Laravel 11 (API REST)
- **Frontend**: React.js (SPA com Vite)
- **Banco de Dados**: MySQL/PostgreSQL
- **Comunicação**: HTTP/JSON

## 📁 Estrutura do Projeto

```
Romaneio/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Models/
│   │   │   └── HistoricoNota.php
│   │   └── Http/Controllers/Api/
│   │       └── NotaFiscalController.php
│   ├── database/migrations/
│   │   └── create_historico_notas_table.php
│   ├── routes/
│   │   └── api.php
│   └── composer.json
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Romaneio.jsx
│   │   │   └── Romaneio.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Instalação e Configuração

### 🐳 Com Docker (Recomendado)

#### Pré-requisitos
- **Docker** e **Docker Compose** instalados
- **Git** para clonar o repositório

#### Instalação Rápida

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd Romaneio
   ```

2. **Dar permissão aos scripts:**
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Iniciar ambiente de desenvolvimento:**
   ```bash
   ./scripts/start-dev.sh
   ```

4. **Acessar a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - PostgreSQL: localhost:5432

#### Comandos Docker Úteis

```bash
# Iniciar desenvolvimento
./scripts/start-dev.sh
# ou
make dev

# Iniciar produção
./scripts/start-prod.sh
# ou
make prod

# Parar todos os containers
./scripts/stop.sh
# ou
make stop

# Ver logs
docker-compose logs -f
# ou
make logs

# Acessar container do backend
docker-compose exec backend bash
# ou
make shell-backend

# Acessar container do frontend
docker-compose exec frontend sh
# ou
make shell-frontend

# Acessar PostgreSQL
docker-compose exec postgres psql -U romaneio_user -d romaneio
# ou
make shell-postgres

# Ver todos os comandos disponíveis
make help
```

### 🔧 Instalação Manual (Sem Docker)

#### Backend (Laravel)

1. **Instalar dependências:**
   ```bash
   cd backend
   composer install
   ```

2. **Configurar ambiente:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configurar banco de dados PostgreSQL:**
   - Edite o arquivo `.env` com suas configurações de banco
   - Execute as migrações:
   ```bash
   php artisan migrate
   ```

4. **Iniciar servidor:**
   ```bash
   php artisan serve
   ```
   O backend estará disponível em `http://localhost:8000`

#### Frontend (React)

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O frontend estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### 🔐 Endpoints de Autenticação (Públicos)

#### POST `/api/auth/register`
Registra um novo usuário no sistema.

**Parâmetros:**
- `name` (string) - Obrigatório
- `email` (string, email válido) - Obrigatório
- `password` (string, mínimo 8 caracteres) - Obrigatório
- `password_confirmation` (string) - Obrigatório

**Resposta de sucesso:**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "token": "1|abc123...",
  "token_type": "Bearer"
}
```

#### POST `/api/auth/login`
Faz login do usuário.

**Parâmetros:**
- `email` (string, email válido) - Obrigatório
- `password` (string) - Obrigatório

**Resposta de sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "token": "1|abc123...",
  "token_type": "Bearer"
}
```

### 🔒 Endpoints Protegidos (Requerem Autenticação)

#### POST `/api/notas/consultar`
Consulta dados de uma nota fiscal pela chave de acesso.

**Headers:**
- `Authorization: Bearer {token}` - Obrigatório

**Parâmetros:**
- `chave_acesso` (string, 44 caracteres) - Obrigatório

**Resposta de sucesso:**
```json
{
  "chave_acesso": "12345678901234567890123456789012345678901234",
  "destinatario": "Empresa de Exemplo S.A.",
  "valor_total": "1234.56"
}
```

#### POST `/api/historico/salvar`
Salva os dados da nota fiscal no histórico.

**Headers:**
- `Authorization: Bearer {token}` - Obrigatório

**Parâmetros:**
- `chave_acesso` (string, 44 caracteres) - Obrigatório
- `destinatario` (string) - Obrigatório
- `valor_total` (numeric) - Obrigatório

**Resposta de sucesso:**
```json
{
  "message": "Nota fiscal salva com sucesso no histórico",
  "data": {
    "id": 1,
    "user_id": 1,
    "chave_acesso": "12345678901234567890123456789012345678901234",
    "destinatario": "Empresa de Exemplo S.A.",
    "valor_total": "1234.56",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

#### POST `/api/auth/logout`
Faz logout do usuário (revoga o token).

**Headers:**
- `Authorization: Bearer {token}` - Obrigatório

**Resposta de sucesso:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### GET `/api/auth/user`
Retorna dados do usuário autenticado.

**Headers:**
- `Authorization: Bearer {token}` - Obrigatório

**Resposta de sucesso:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

## 🐳 Docker

### Estrutura de Containers

O projeto utiliza Docker para facilitar o desenvolvimento e deploy:

```
Romaneio/
├── docker-compose.yml          # Configuração de desenvolvimento
├── docker-compose.prod.yml     # Configuração de produção
├── backend/
│   ├── Dockerfile              # Imagem de produção
│   └── Dockerfile.dev          # Imagem de desenvolvimento
├── frontend/
│   ├── Dockerfile              # Imagem de produção
│   └── Dockerfile.dev          # Imagem de desenvolvimento
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf          # Configuração do Nginx
│   │   └── default.conf        # Virtual host
│   └── postgres/
│       └── init.sql            # Script de inicialização
└── scripts/
    ├── start-dev.sh            # Iniciar desenvolvimento
    ├── start-prod.sh           # Iniciar produção
    └── stop.sh                 # Parar containers
```

### Serviços Docker

- **postgres**: Banco de dados PostgreSQL 15
- **backend**: API Laravel com PHP 8.2-FPM
- **frontend**: Aplicação React com Node.js 18
- **nginx**: Servidor web (apenas em produção)

### Variáveis de Ambiente

As configurações do banco são definidas no `docker-compose.yml`:

```yaml
DB_CONNECTION: pgsql
DB_HOST: postgres
DB_PORT: 5432
DB_DATABASE: romaneio
DB_USERNAME: romaneio_user
DB_PASSWORD: romaneio_password
```

## 🗄️ Banco de Dados

### Tabela: `users`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint | Chave primária (auto-incremento) |
| `name` | varchar(255) | Nome completo do usuário |
| `email` | varchar(255) | Email do usuário (único) |
| `email_verified_at` | timestamp | Data de verificação do email |
| `password` | varchar(255) | Senha criptografada |
| `remember_token` | varchar(100) | Token de "lembrar-me" |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Tabela: `personal_access_tokens`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint | Chave primária (auto-incremento) |
| `tokenable_type` | varchar(255) | Tipo do modelo (User) |
| `tokenable_id` | bigint | ID do usuário |
| `name` | varchar(255) | Nome do token |
| `token` | varchar(64) | Token de acesso (único) |
| `abilities` | text | Permissões do token |
| `last_used_at` | timestamp | Último uso do token |
| `expires_at` | timestamp | Data de expiração |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Tabela: `historico_notas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | bigint | Chave primária (auto-incremento) |
| `user_id` | bigint | ID do usuário (chave estrangeira) |
| `chave_acesso` | varchar(44) | Chave de acesso da nota fiscal (única) |
| `destinatario` | varchar(255) | Nome do destinatário |
| `valor_total` | decimal(10,2) | Valor total da nota fiscal |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

## 🎨 Interface do Usuário

O frontend oferece uma interface moderna e responsiva com:

- **Formulário de consulta**: Campo para digitar a chave de acesso
- **Validação em tempo real**: Verifica se a chave tem 44 dígitos
- **Exibição de resultados**: Mostra os dados da nota consultada
- **Botão de salvamento**: Salva os dados no histórico
- **Feedback visual**: Indicadores de carregamento e mensagens de erro
- **Design responsivo**: Funciona em desktop e dispositivos móveis

## 🔧 Funcionalidades

### Backend
- ✅ Validação de dados de entrada
- ✅ Simulação de consulta de notas fiscais
- ✅ Persistência de dados no banco
- ✅ Tratamento de erros
- ✅ Prevenção de duplicatas
- ✅ **Sistema de autenticação com Laravel Sanctum**
- ✅ **Proteção de rotas da API**
- ✅ **Gestão de usuários**

### Frontend
- ✅ Interface intuitiva e moderna
- ✅ Validação de formulários
- ✅ Estados de carregamento
- ✅ Tratamento de erros
- ✅ Design responsivo
- ✅ Feedback visual para o usuário
- ✅ **Sistema de login e registro**
- ✅ **Gestão de sessões**
- ✅ **Proteção de rotas**
- ✅ **Header com informações do usuário**

## 🧪 Testando o Sistema

### 1. Acesse o Frontend
Abra seu navegador e acesse: `http://localhost:3000`

### 2. Autenticação
1. **Registre-se** ou **faça login** com suas credenciais
2. **Aguarde a verificação** do token de autenticação
3. **Acesse o sistema** de romaneio

### 3. Teste a Funcionalidade
1. **Digite uma chave de acesso** com 44 dígitos (ex: `12345678901234567890123456789012345678901234`)
2. **Clique em "Consultar Nota"** para buscar os dados
3. **Verifique os dados exibidos** (destinatário e valor total)
4. **Clique em "Salvar no Histórico"** para persistir os dados

### 4. Verificar no Banco de Dados
```sql
-- Verificar usuários
SELECT * FROM users;

-- Verificar histórico de notas (agora com user_id)
SELECT h.*, u.name as user_name 
FROM historico_notas h 
JOIN users u ON h.user_id = u.id;
```

## 🔒 Segurança

- Validação de entrada em ambos os lados
- Sanitização de dados
- Prevenção de SQL injection (Eloquent ORM)
- Validação de tipos e formatos
- Tratamento de erros sem exposição de informações sensíveis

## 🚀 Deploy

### 🐳 Deploy com Docker (Recomendado)

#### Desenvolvimento
```bash
./scripts/start-dev.sh
```

#### Produção
```bash
./scripts/start-prod.sh
```

### 🔧 Deploy Manual

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

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto. 