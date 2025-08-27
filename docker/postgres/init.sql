-- Script de inicialização do PostgreSQL
-- Este arquivo é executado automaticamente quando o container é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar usuário e banco (já feito pelo docker-compose)
-- POSTGRES_DB: romaneio
-- POSTGRES_USER: romaneio_user
-- POSTGRES_PASSWORD: romaneio_password

-- Configurações adicionais do banco
ALTER DATABASE romaneio SET timezone TO 'America/Sao_Paulo';
ALTER DATABASE romaneio SET client_encoding TO 'UTF8';
ALTER DATABASE romaneio SET default_transaction_isolation TO 'read committed';

-- Comentário sobre o banco
COMMENT ON DATABASE romaneio IS 'Banco de dados do Sistema de Romaneio'; 