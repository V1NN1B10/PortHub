# Base para API, banco de dados e autenticação

O projeto continua iniciando em modo local para o portfólio. Quando houver uma API, configure `CONFIG.auth.mode` como `api` e informe `CONFIG.auth.apiBaseUrl`. As telas usam as rotas de autenticação descritas abaixo. A API deve ser hospedada em HTTPS e validar as permissões no servidor.

## Rotas de autenticação esperadas

Todas as respostas devem ser JSON. A sessão deve ser criada em cookie `HttpOnly`, `Secure` e `SameSite`; o cliente atualmente mantém um resumo do usuário para exibição da interface.

| Método | Rota | Corpo esperado | Responsabilidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ nome, email, senha }` | Validar e-mail, aplicar hash forte à senha e criar usuário. |
| `POST` | `/auth/login` | `{ email, senha }` | Verificar credenciais e criar sessão segura. |
| `POST` | `/auth/logout` | `{}` | Invalidar a sessão atual no servidor. |
| `POST` | `/auth/forgot-password` | `{ email }` | Responder de forma genérica, criar código/token de uso único com validade curta e enviar o código por e-mail. |
| `POST` | `/auth/reset-password` | `{ email, code, novaSenha }` | Validar e consumir o código, aplicar hash da senha e invalidar sessões antigas. |

Exemplo de retorno de login: `{ "user": { "id": "...", "nome": "...", "email": "...", "foto": "..." } }`. Erros devem usar status HTTP apropriado e, quando possível, `{ "message": "..." }`.

O envio de código deve acontecer no servidor. EmailJS fica disponível somente para o modo demonstrativo local; não coloque chaves privadas de SMTP ou de provedores de e-mail no JavaScript do navegador.

## Modelo de dados inicial

- `users`: `id`, `name`, `email` (único), `password_hash` (nulo para métodos sem senha), `created_at`, `updated_at`.
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

## Configurar e-mail e redes

- No painel do EmailJS, conecte um serviço de e-mail e crie um template para recuperação de senha.
- No destinatário do template, use `{{to_email}}`. No assunto, use algo como `Código de recuperação do {{app_name}}`; no corpo, inclua `{{verification_code}}` e informe que o código expira em `{{expiration_minutes}}` minutos.
- Copie o Service ID do serviço, o Template ID do template e a Public Key da conta para `CONFIG.emailjs.serviceId`, `templateId` e `publicKey` em `js/config.js`. O navegador envia esses valores à API REST oficial do EmailJS junto com `template_params`.
- Configure no EmailJS a lista de origens/domínios permitidos para aceitar apenas o domínio de publicação e o endereço de desenvolvimento que você usa. Não coloque a Private Key no JavaScript.
- `CONFIG.recuperacaoSenha.validadeMinutos` e `maxTentativas` controlam a validade e o limite de erros no modo local. No modo API, a API deve impor os mesmos limites no servidor.
- `CONFIG.redesSociais.instagramUrl` e `tiktokUrl`: URLs completas dos perfis.
- `CONFIG.redesSociais.whatsappNumber`: número internacional com código do país, apenas dígitos (ex.: `5511999999999`). A interface gera o link `wa.me`.
