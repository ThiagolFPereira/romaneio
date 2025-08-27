# Dockerfile para o frontend React
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./

# Instalar dependências
RUN npm ci --only=production --legacy-peer-deps

# Copiar código da aplicação
COPY . .

# Construir a aplicação
RUN npm run build

# Instalar servidor para produção
RUN npm install -g serve

# Expor porta 3000
EXPOSE 3000

# Comando para servir a aplicação
CMD ["serve", "-s", "dist", "-l", "3000"] 