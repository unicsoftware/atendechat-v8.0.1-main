# AtendeChat v8.0.1 - Guia Completo de Desenvolvimento (Localhost)

Este repositório contém a solução multi-atendimento para WhatsApp e canais Omnichannel **AtendeChat v8.0.1**.

---

## 📋 Resumo das Alterações Realizadas no Projeto

1. **Criado `docker-compose.yml` na raiz**: Para subir o PostgreSQL 14 e o Redis automaticamente via Docker.
2. **Criado `backend/.env`**: Configurado com credenciais de desenvolvimento conectando ao PostgreSQL (`localhost:5432`) e Redis (`localhost:6379`).
3. **Criado `frontend/.env`**: Configurado apontando para a API do backend local (`http://localhost:8080`).
4. **Corrigida dependência em `backend/package.json`**: Atualizado `@whiskeysockets/baileys` de `github:zennn08/Baileys#profile-picture-url` para `github:zennn08/Baileys#master`.
5. **Corrigida importação no frontend**: Substituído `react-qr-code` por `qrcode.react` em `CheckoutSuccess.js` para evitar erro de compatibilidade de módulos `.mjs` no Webpack 4.
6. **Atualizado script `npm start` do frontend**: Incluída a flag `NODE_OPTIONS=--openssl-legacy-provider` para que o comando `npm start` funcione diretamente no Node v17+ / Node v26 sem erros de OpenSSL.
7. **Corrigida dependência transitiva de `fast-png`**: Travada a versão `"fast-png": "6.1.0"` e `"html2pdf.js": "0.10.1"` no `frontend/package.json` para evitar erros de compilação de campos de classe não inicializados ES2022 no Webpack 4.

---

## 📄 Arquivos de Configuração Gerados

### 1. `docker-compose.yml` (Raiz do Projeto)
```yaml
services:
  postgres:
    image: postgres:14-alpine
    container_name: atendechat_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: senha
      POSTGRES_DB: atendechat
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    container_name: atendechat_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. `backend/.env` (Pasta `/backend`)
```env
NODE_ENV=development
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
PORT=8080

# CREDENCIAIS DO BANCO DE DADOS (PostgreSQL)
DB_HOST=localhost
DB_DIALECT=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=senha
DB_NAME=atendechat

MASTER_KEY=senha_master
TIMEOUT_TO_IMPORT_MESSAGE=1000

# CREDENCIAIS DO REDIS
REDIS_URI=redis://127.0.0.1:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000

# SECRETS DE AUTENTICAÇÃO JWT
JWT_SECRET=kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=
JWT_REFRESH_SECRET=dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A=

VERIFY_TOKEN=whaticket

# CREDENCIAIS DO GERENCIANET / EFÍ BANK (PIX)
GERENCIANET_SANDBOX=false
GERENCIANET_CLIENT_ID=seu_client_id
GERENCIANET_CLIENT_SECRET=seu_client_secret
GERENCIANET_PIX_CERT=certificado
GERENCIANET_CHAVEPIX=sua_chave_pix
```

### 3. `frontend/.env` (Pasta `/frontend`)
```env
PORT=3000
HOST=0.0.0.0
BROWSER=none
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_FACEBOOK_APP_ID=
REACT_APP_NAME_SYSTEM="AtendeChat"
REACT_APP_NUMBER_SUPPORT=
```

---

## 🛠️ GUIA 1: Primeira Instalação e Configuração do Zero

Execute estes passos na **primeira vez** que baixar o projeto ou quiser resetar tudo:

### Passo 1: Subir o PostgreSQL e o Redis no Docker
Na raiz do projeto:
```bash
docker compose up -d
```

### Passo 2: Configurar e Instalar o Backend
```bash
cd backend
npm install
npm run build
npm run db:migrate
npm run db:seed
```

### Passo 3: Configurar e Instalar o Frontend
Em outro terminal, na pasta raiz:
```bash
cd frontend
npm install --legacy-peer-deps
```

---

## ⚡ GUIA 2: Como Iniciar Tudo ao Abrir a IDE (Rotina Diária)

Quando você abrir a IDE no dia a dia, execute os comandos abaixo para subir todo o ambiente:

### 1. Iniciar os Bancos de Dados (Docker)
Na raiz do projeto (`atendechat-v8.0.1-main`):
```bash
docker compose up -d
```

### 2. Iniciar o Backend
Abra um terminal e rode:
```bash
cd backend
npm run dev:server
```
📍 *Servidor ativo em: `http://localhost:8080`*

### 3. Iniciar o Frontend
Abra outro terminal e rode:
```bash
cd frontend
npm start
```
📍 *Frontend ativo em: `http://localhost:3000`*

### 4. Acessar no Navegador
- **URL:** `http://localhost:3000`
- **E-mail:** `admin@atendechat.com`
- **Senha:** `123456`

---

## 🛑 GUIA 3: Como Parar os Serviços ao Fechar o Ambiente de Dev

Antes de fechar a IDE ou encerrar o expediente:

1. **Parar o Backend e o Frontend**:
   Nos terminais onde estiverem rodando o backend e o frontend, pressione **`Ctrl + C`**.

2. **Parar os Contêineres do Docker**:
   Na raiz do projeto, execute:
   ```bash
   docker compose down
   ```
   > 💡 *Se desejar limpar completamente o banco de dados para a próxima inicialização, use `docker compose down -v`.*

---

## 💳 Configuração da Integração PIX (Efí Bank / Gerencianet)

A integração para pagamentos de assinaturas via PIX utiliza a API do **Efí Bank (Gerencianet)**.

### 📁 Arquivos do Projeto Relacionados:
- **Certificados `.p12`**: [`backend/certs/`](file:///Users/elpidio.junior/Documents/_projetos/atende/atendechat-v8.0.1-main/backend/certs/)
- **Configuração do SDK**: [`backend/src/config/Gn.ts`](file:///Users/elpidio.junior/Documents/_projetos/atende/atendechat-v8.0.1-main/backend/src/config/Gn.ts)
- **Controlador de Cobranças/Webhooks**: [`backend/src/controllers/SubscriptionController.ts`](file:///Users/elpidio.junior/Documents/_projetos/atende/atendechat-v8.0.1-main/backend/src/controllers/SubscriptionController.ts)

### ⚙️ Como Configurar o Certificado e Credenciais:

1. **Adicionar o certificado `.p12`**:
   Baixe o certificado PIX na sua conta do Efí Bank e coloque o arquivo `.p12` dentro da pasta `backend/certs/` (exemplo: `backend/certs/certificado.p12`).

2. **Configurar as variáveis no `backend/.env`**:
   ```env
   GERENCIANET_SANDBOX=false
   GERENCIANET_CLIENT_ID=seu_client_id_da_efi
   GERENCIANET_CLIENT_SECRET=seu_client_secret_da_efi
   GERENCIANET_PIX_CERT=certificado
   GERENCIANET_CHAVEPIX=sua_chave_pix_cadastrada
   ```
   > 💡 *Nota*: A variável `GERENCIANET_PIX_CERT` deve conter apenas o nome do arquivo sem a extensão `.p12`. Por exemplo, se o arquivo for `certificado.p12`, defina `GERENCIANET_PIX_CERT=certificado`.

