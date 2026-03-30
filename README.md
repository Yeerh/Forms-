# Sistema de Gerenciamento de Formularios de Projetos

Aplicacao web completa com frontend React e backend Node.js + Express para autenticacao e verificacao de formularios.

## Tecnologias

- Frontend: React + Vite + Axios
- Backend: Node.js + Express
- Autenticacao: JWT
- Persistencia: arquivo JSON (`backend/data/formularios.json`)
- Upload de arquivos: Multer (PDF e PNG)

## Funcionalidades entregues

- Login com usuario/e-mail e senha
- Protecao de rotas no frontend (dashboard apenas logado)
- API protegida por token JWT para rotas do dashboard
- Dashboard com tabela de formularios
- Filtro por nome ou matricula
- Botao `Ver detalhes` por linha
- Modal em duas colunas:
  - Coluna esquerda: documentos enviados (preview imagem e link para PDF)
  - Coluna direita: checklist de validacao
- Atualizacao do checklist via API
- Status visual do formulario (`pendente`, `em_analise`, `aprovado`)

## Credenciais de teste

- Usuario: `admin`
- E-mail: `admin@projetos.local`
- Senha: `123456`

## Estrutura de pastas

```text
forms/
  backend/
    data/
      formularios.json
    uploads/
    src/
      config/
        auth.js
      controllers/
        authController.js
        formularioController.js
      middlewares/
        authMiddleware.js
      routes/
        authRoutes.js
        formularioRoutes.js
      utils/
        storage.js
      validators/
        formularioValidator.js
      server.js
  frontend/
    src/
      api/
        authApi.js
        formularioApi.js
        httpClient.js
      components/
        ProtectedRoute.jsx
        dashboard/
          FormularioDetailsModal.jsx
          FormulariosTable.jsx
      context/
        AuthContext.jsx
      pages/
        LoginPage.jsx
        DashboardPage.jsx
      styles/
        app.css
      App.jsx
      main.jsx
```

## Como rodar o sistema

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Servidor backend: `http://localhost:3001`

### 2) Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Variavel de ambiente (opcional)

Se quiser alterar o endereco da API no frontend, crie:

```bash
# frontend/.env
VITE_API_URL=http://localhost:3001
```

## Rotas da API

### Publica

- `POST /login` -> autentica usuario e retorna token JWT

### Protegidas (Bearer Token)

- `GET /formularios` -> lista formularios para o dashboard
- `GET /formulario/:id` -> retorna detalhes de um formulario
- `PUT /formulario/:id/checklist` -> salva checklist de verificacao

### Suporte (ja existente)

- `POST /formulario` -> cria novo formulario com upload
- `GET /health` -> status da API

## Exemplo de login

### Request

```json
{
  "identifier": "admin",
  "password": "123456"
}
```

### Response

```json
{
  "token": "jwt-token",
  "user": {
    "id": "1",
    "name": "Administrador",
    "email": "admin@projetos.local",
    "username": "admin",
    "role": "secretaria"
  }
}
```

## Observacoes

- As rotas de dashboard exigem `Authorization: Bearer <token>`.
- Os dados continuam sendo armazenados no arquivo JSON local.
- O status do formulario e atualizado quando o checklist e salvo.
