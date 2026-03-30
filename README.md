# Formulario de Acompanhamento de Projetos

Aplicacao web completa para registro e acompanhamento de projetos institucionais.

- Frontend: React + Vite
- Backend: Node.js + Express
- Persistencia: arquivo JSON local
- Upload: PDF e PNG com Multer

## Funcionalidades

- Tela inicial de orientacoes com card central
- Formulario dividido em 10 secoes
- Validacao de campos obrigatorios no frontend e backend
- Checkbox de situacao com selecao unica
- Upload de documentos de apoio (PDF/PNG)
- Preview de imagens PNG anexadas
- Barra de progresso de preenchimento
- Mensagem de sucesso apos envio
- Dashboard simples com listagem dos formularios enviados

## Estrutura do projeto

```text
forms/
  backend/
    data/formularios.json
    uploads/
    src/
      controllers/
      routes/
      utils/
      validators/
      server.js
  frontend/
    src/
      api/
      components/
      pages/
      styles/
      App.jsx
      main.jsx
```

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Executando localmente

### 1) Subir o backend

```bash
cd backend
npm install
npm run dev
```

API em: `http://localhost:3001`

### 2) Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Aplicacao em: `http://localhost:5173`

## Variavel de ambiente do frontend (opcional)

Se precisar mudar a URL da API:

```bash
# frontend/.env
VITE_API_URL=http://localhost:3001
```

## Endpoints da API

### GET `/health`

Retorna o status da API.

### POST `/formulario`

Recebe envio do formulario em `multipart/form-data`.

Campos principais:

- Campos textuais do formulario
- `tiposDocumentos`: array (enviado como JSON string)
- `documentosApoio`: arquivos PDF ou PNG

Resposta de sucesso (201):

```json
{
  "message": "Formulario enviado com sucesso.",
  "formulario": {
    "id": "uuid",
    "createdAt": "2026-03-30T12:00:00.000Z"
  }
}
```

### GET `/formularios`

Lista os formularios enviados:

```json
{
  "total": 1,
  "items": []
}
```

## Validacoes implementadas

- Campos obrigatorios de todas as secoes
- Percentual de execucao entre 0 e 100
- Quantitativo maior ou igual a 0
- Pelo menos 1 tipo de documento selecionado
- Campo "Outros" obrigatorio quando selecionado
- Pelo menos 1 arquivo anexado
- Restricao de tipo de arquivo: PDF e PNG
- Limite de 10 arquivos por envio

## Scripts

Backend:

- `npm run dev`: sobe API com watch
- `npm start`: sobe API em modo normal

Frontend:

- `npm run dev`: sobe app em desenvolvimento
- `npm run build`: gera build de producao
- `npm run preview`: visualiza build local
