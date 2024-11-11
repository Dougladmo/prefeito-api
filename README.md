# Documentação da API

Este documento detalha os modelos e exemplos de requisições HTTP para cada um dos recursos da API.

## Endpoints de Autenticação de Usuários (`/userRoutes`)

### Rotas de Autenticação para Usuários Comuns
- **POST /register** - Registro de novos usuários.
- **POST /login** - Login de usuários.
- **POST /forgot-password** - Envio de código de recuperação de senha por e-mail (6 dígitos).
- **POST /reset-password** - Redefinição de senha usando o código de recuperação.
- **POST /verify-email/user** - Verificação de e-mail com código de verificação.

### Rotas de Autenticação para Administradores
- **POST /adm/register** - Registro de novos administradores.
- **POST /adm/login** - Login de administradores.
- **POST /adm/forgot-password** - Envio de código de recuperação de senha para administradores.
- **POST /adm/reset-password** - Redefinição de senha para administradores usando código.
- **POST /adm/verify-email** - Verificação de e-mail de administrador com código.
- **POST /adm/resend-verification-email** - Reenvio de e-mail de verificação de conta de administrador.
- **POST /adm/resend-reset-password-email** - Reenvio de e-mail de redefinição de senha para administrador.

### Rotas Privadas
- **GET /users** - Obter dados do usuário autenticado. Necessita de token JWT.
- **GET /adm/users/:id** - Obter dados de administrador pelo ID. Necessita de token JWT.

---

## Endpoints de Notícias da Cidade (`/cityRoutes`)

### Rotas para Notícias
- **POST /news** - Criação de uma nova notícia. Utiliza `reportsMiddleware`.
- **GET /news** - Obter todas as notícias.
- **GET /news/:id** - Obter uma notícia pelo ID.
- **PUT /news/:id** - Atualizar uma notícia pelo ID. Utiliza `reportsMiddleware`.
- **DELETE /news/:id** - Deletar uma notícia pelo ID. Utiliza `reportsMiddleware`.

---

## Endpoints de Relatórios (`/reportsRoutes`)

### Guard Report
- **GET /guardReports** - Obter todos os relatórios de guard report.
- **GET /guardReport/:id** - Obter um guard report específico pelo ID.
- **GET /guardReports/user/:userId** - Obter relatórios de guard report por `userId`.
- **POST /guardReport** - Criar um novo guard report. Utiliza `reportsMiddleware`.
- **PUT /guardReport/:id** - Atualizar um guard report pelo ID.
- **DELETE /guardReport/:id** - Deletar um guard report pelo ID.

### Traffic Report
- **GET /trafficReports** - Obter todos os relatórios de trânsito.
- **GET /trafficReport/:id** - Obter um relatório de trânsito pelo ID.
- **GET /trafficReports/user/:userId** - Obter relatórios de trânsito por `userId`.
- **POST /trafficReport** - Criar um relatório de trânsito com upload de imagem. Utiliza `reportsMiddleware` e `uploadMiddleware`.
- **PUT /trafficReport/:id** - Atualizar um relatório de trânsito pelo ID.
- **DELETE /trafficReport/:id** - Deletar um relatório de trânsito pelo ID.

### Public Lighting Report
- **GET /publicLightingReports** - Obter todos os relatórios de iluminação pública.
- **GET /publicLightingReport/:id** - Obter um relatório de iluminação pública pelo ID.
- **GET /publicLightingReports/user/:userId** - Obter relatórios de iluminação pública por `userId`.
- **POST /publicLightingReport** - Criar um relatório de iluminação pública com upload de imagem. Utiliza `reportsMiddleware` e `uploadMiddleware`.
- **PUT /publicLightingReport/:id** - Atualizar um relatório de iluminação pública pelo ID.
- **DELETE /publicLightingReport/:id** - Deletar um relatório de iluminação pública pelo ID.

### Relatórios de um Usuário Específico
- **GET /user/:userId** - Obter todos os relatórios de um usuário específico.

---

## Endpoints de Feedbacks (`/reportsRoutes`)

### User Feedback
- **POST /feedback** - Criar um novo feedback. Utiliza `reportsMiddleware`.
- **GET /feedback** - Obter todos os feedbacks.

---

## Middlewares

- **checkToken** - Middleware para validação do token JWT nas rotas privadas.
- **reportsMiddleware** - Middleware para validação de dados em relatórios e feedbacks.
- **uploadMiddleware** - Middleware para upload de imagens nas rotas que exigem arquivo.

---

## Observações

- Para acessar as rotas privadas, é necessário autenticação com token JWT.
- Certos endpoints requerem permissões específicas (usuários comuns ou administradores).
- Para autenticação de administradores e usuários comuns, existem rotas e controladores separados, permitindo uma administração mais segura e modular.

---

## 1. AdmUser

Modelo para criação de usuários administradores.

### Exemplo de Requisição (`POST` /adm-users)

- **URL**: `/adm-users`
- **Método**: `POST`

**Body**:
```json
{
  "name": "Nome do Administrador",
  "email": "admin@example.com",
  "password": "senhaSegura",
  "isVerified": false,
  "verificationToken": "tokenDeVerificacao"
}
```

---

## 2. GuardReport

Modelo para criação de um relatório de incidente envolvendo patrimônio público.

### Exemplo de Requisição (`POST` /guard-reports)

- **URL**: `/guard-reports`
- **Método**: `POST`

**Body**:
```json
{
  "type": "dano-patrimonio-publico",
  "description": "Descrição do incidente",
  "location": "Rua Exemplo, 123",
  "status": "pendente",
  "image": "URL_da_imagem",
  "userId": "ID_do_usuario_relacionado"
}
```

**Observação**: `status` é opcional e assume o valor padrão `"pendente"` se omitido.

---

## 3. News

Modelo para criação de uma notícia.

### Exemplo de Requisição (`POST` /news)

- **URL**: `/news`
- **Método**: `POST`

**Body**:
```json
{
  "title": "Título da notícia",
  "description": "Descrição da notícia",
  "image": "URL_da_imagem",
  "date": "2024-01-01T00:00:00.000Z"
}
```

**Observação**: `date` é opcional e assume a data atual se omitido.

---

## 4. PublicLightingReport

Modelo para criação de um relatório de iluminação pública.

### Exemplo de Requisição (`POST` /public-lighting-reports)

- **URL**: `/public-lighting-reports`
- **Método**: `POST`

**Body**:
```json
{
  "type": "troca-de-postes",
  "description": "Descrição do problema de iluminação",
  "location": {
    "lat": -23.5505,
    "lng": -46.6333
  },
  "statusReport": "pendente",
  "image": "URL_da_imagem",
  "userId": "ID_do_usuario_relacionado"
}
```

**Observação**: `statusReport` é opcional e assume o valor padrão `"pendente"` se omitido.

---

## 5. TrafficReport

Modelo para criação de um relatório de problemas de trânsito.

### Exemplo de Requisição (`POST` /traffic-reports)

- **URL**: `/traffic-reports`
- **Método**: `POST`

**Body**:
```json
{
  "type": "semaforo-desligado",
  "description": "Descrição do problema de trânsito",
  "location": "Rua Exemplo, 123",
  "statusReport": "pendente",
  "image": "URL_da_imagem",
  "userId": "ID_do_usuario_relacionado"
}
```

**Observação**: `statusReport` é opcional e assume o valor padrão `"pendente"` se omitido.

---

## 6. User

Modelo para criação de usuários comuns.

### Exemplo de Requisição (`POST` /users)

- **URL**: `/users`
- **Método**: `POST`

**Body**:
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@example.com",
  "password": "senhaSegura",
  "isVerified": false,
  "verificationCode": "codigoDeVerificacao",
  "verificationCodeExpires": "2024-01-01T00:00:00.000Z",
  "resetPasswordCode": "codigoDeRedefinicao",
  "resetPasswordExpires": "2024-01-01T00:00:00.000Z"
}
```

---

## 7. UserFeedback

Modelo para criação de feedbacks de usuários.

### Exemplo de Requisição (`POST` /user-feedbacks)

- **URL**: `/user-feedbacks`
- **Método**: `POST`

**Body**:
```json
{
  "sportsAndLeisure": 5, // nota de 1 a 5 sobre esportes e lazer
  "culture": 4, // nota de 1 a 5 sobre cultura
  "education": 3, // nota de 1 a 5 sobre Educação
  "health": 5, // nota de 1 a 5 sobre saúde
  "safety": 4, // nota de 1 a 5 sobre segurança
  "mobilityAndTraffic": 3, // nota de 1 a 5 Mobilidade e trafégo
  "publicWorksAndServices": 4, // nota de 1 a 5 sobre trabalhos e serviços
  "comments": "Excelente serviço!",
  "userId": "ID_do_usuario_relacionado"
}
```

---
