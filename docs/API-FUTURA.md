# Base para API, banco de dados e autenticação

O projeto continua iniciando em modo local para o portfólio. Quando houver uma API, configure `CONFIG.auth.mode` como `api` e informe `CONFIG.auth.apiBaseUrl`. As telas usam as rotas de autenticação descritas abaixo. A API deve ser hospedada em HTTPS e validar as permissões no servidor.

## Rotas de autenticação esperadas

Todas as respostas devem ser JSON. A sessão deve ser criada em cookie `HttpOnly`, `Secure` e `SameSite`; o cliente atualmente mantém um resumo do usuário para exibição da interface.

| Método | Rota | Corpo esperado | Responsabilidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ nome, email, senha }` | Validar e-mail, aplicar hash forte à senha e criar usuário. |
| `POST` | `/auth/login` | `{ email, senha }` | Verificar credenciais e criar sessão segura. |
| `POST` | `/auth/logout` | `{}` | Invalidar a sessão atual no servidor. |
| `POST` | `/auth/google` | `{ credential }` | Validar assinatura, emissor, público (`aud`) e expiração do token Google; localizar ou criar usuário. |
| `POST` | `/auth/forgot-password` | `{ email }` | Responder de forma genérica, criar código/token de uso único com validade curta e enviar o código por e-mail. |
| `POST` | `/auth/reset-password` | `{ email, code, novaSenha }` | Validar e consumir o código, aplicar hash da senha e invalidar sessões antigas. |

Exemplo de retorno de login: `{ "user": { "id": "...", "nome": "...", "email": "...", "foto": "..." } }`. Erros devem usar status HTTP apropriado e, quando possível, `{ "message": "..." }`.

O envio de código deve acontecer no servidor. EmailJS fica disponível somente para o modo demonstrativo local; não coloque chaves privadas de SMTP ou de provedores de e-mail no JavaScript do navegador.

## Modelo de dados inicial

- `users`: `id`, `name`, `email` (único), `password_hash` (opcional para contas Google), `created_at`, `updated_at`.
- `auth_identities`: `id`, `user_id`, `provider`, `provider_subject` (único por provedor), `created_at`.
- `password_reset_tokens`: `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at`. Armazene apenas o hash do código/token.
- `projects`: `id`, `user_id`, campos definidos por `CONFIG.campos`, `created_at`, `updated_at`.
- `profiles`: `user_id`, `cargo`, `bio`, `contato`, `updated_at`.

## Rotas CRUD sugeridas para projetos

| Método | Rota | Ação |
| --- | --- | --- |
| `GET` | `/projects` | Listar apenas projetos do usuário autenticado. |
| `POST` | `/projects` | Criar projeto associado ao usuário da sessão. |
| `GET` | `/projects/:id` | Buscar projeto próprio pelo ID. |
| `PATCH` | `/projects/:id` | Atualizar campos permitidos de um projeto próprio. |
| `DELETE` | `/projects/:id` | Excluir um projeto próprio. |
| `GET` / `PUT` | `/profile` | Consultar e atualizar o perfil do usuário autenticado. |

O servidor deve derivar o dono (`user_id`) da sessão autenticada, nunca aceitar como confiável o autor enviado pelo navegador. Aplicar validação de entrada, controle de acesso por registro, limites de requisição e proteção contra CSRF quando a sessão usar cookies.

## Google Identity Services

Cadastre um OAuth Client ID do tipo aplicação Web e inclua as origens autorizadas de desenvolvimento/publicação. O botão oficial da Google Identity Services aparece depois de preencher `CONFIG.auth.googleClientId`. No modo local a interface aceita o retorno assinado para demonstrar o fluxo, com verificações básicas de público, validade e e-mail. Essa validação local não substitui a verificação de assinatura no servidor; para produção, configure o modo `api` e implemente `/auth/google` usando uma biblioteca oficial de validação de ID tokens.

## Configurar e-mail e redes

- `CONFIG.emailjs.serviceId`, `templateId` e `publicKey`: configuração de demonstração; o template precisa dos campos `to_email` e `verification_code`.
- `CONFIG.redesSociais.instagramUrl` e `tiktokUrl`: URLs completas dos perfis.
- `CONFIG.redesSociais.whatsappNumber`: número internacional com código do país, apenas dígitos (ex.: `5511999999999`). A interface gera o link `wa.me`.
