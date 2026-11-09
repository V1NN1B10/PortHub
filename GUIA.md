# Portfólio Fácil · Guia do Grupo 3

> ## 🚀 Leia isto primeiro
> Este site é um **ponto de partida**, não o projeto pronto. Vocês podem (e devem!) mudar **tudo**: cores, fontes, textos, imagens, a ordem das seções, criar páginas novas, apagar o que não fizer sentido. O professor vai avaliar o que **o grupo** construiu em cima dele.

**Integrantes:**
- Vinicius Almeida Reis
- Joel Josue Nina Nina
- Kaiky Mateus Oliveira da Silva
- Jaqueline Thomas
- Aghata Ribeiro Silva

---

## 1. Como abrir o site

1. Baixe e extraia o projeto (ou clone, veja a seção 6).
2. Abra a pasta no **VS Code** (File → Open Folder).
3. Instale a extensão **Live Server** (ícone de quadradinhos na lateral, pesquise "Live Server").
4. Clique com o botão direito no `index.html` → **Open with Live Server**. O site abre no navegador e atualiza sozinho a cada vez que você salva.

**Teste o fluxo completo:** crie uma conta, faça login, cadastre alguns registros, filtre, mude o status/exclua e visite todas as páginas.

---

## 2. Mapa dos arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Página inicial: título grande, letreiro andando, vitrine em mosaico, três passos, citação, equipe com foto no hover |
| `projetos.html` | Seus projetos em cards com imagem, com filtro por categoria e botões Editar e Excluir |
| `novo-projeto.html` | Formulário para cadastrar um projeto. Aberto com `?editar=ID`, vira formulário de edição |
| `portfolio.html` | O portfólio gerado: perfil editável, números, filtro por categoria e botão de salvar em PDF |
| `js/portfolio.js` | Monta o perfil e os projetos do portfólio |
| `css/style.css` | **Todo o visual.** Parte 1 = cores e fontes, Parte 2 = estrutura, Parte 3 = visual deste site |
| `js/config.js` | **Os campos do formulário**, filtros, status e opções |
| `js/auth.js` | Cadastro, login, sair e proteção das páginas |
| `js/app.js` | Salvar, listar, filtrar, alterar status e excluir registros |
| `img/` | Pasta para as imagens do grupo |

> 💡 Os comentários no código (`<!-- ... -->` no HTML e `// ...` no JS) explicam cada parte. Leiam!

---

## 3. Mudanças fáceis (comecem por aqui)

### 3.1 Trocar as cores

O estilo atual é: estilo revista, papel off-white, títulos em fonte serifada e azul elétrico. Abra `css/style.css`. Logo no começo existe o bloco `:root`:

```css
:root {
  --primaria: #1f3dff;
  --fundo: #f3efe7;
  ...
}
```

Troque os códigos de cor e salve. **O site inteiro muda junto.** Para escolher cores bonitas que combinam, usem **coolors.co** ou **colorhunt.co**.

### 3.2 Trocar a fonte

1. Entre em **fonts.google.com**, escolha uma fonte e clique em **Get font → Get embed code**.
2. Copie o `<link href="https://fonts.googleapis.com/...">` e troque o link de fonte que está no `<head>` de **cada página**.
3. No `:root` do CSS, troque o nome em `--fonte` e `--fonte-titulo`.

### 3.3 Trocar os textos

Tudo que está com **fundo amarelo** no site é texto de exemplo que o grupo **deve** reescrever. No código, ele tem `class="trocar"`. Depois de escrever o texto final, **apague o `class="trocar"`** para o fundo amarelo sumir.

### 3.4 Colocar imagens

1. Salve a imagem dentro da pasta `img/` (ex.: `img/hero.jpg`). Use nomes sem espaço e sem acento.
2. No HTML, procure a `<div class="espaco-imagem">` (as caixas tracejadas com 📷) e troque a div inteira por:

```html
<img src="img/hero.jpg" alt="Descrição da imagem" class="imagem">
```

> O `alt` é obrigatório: ele descreve a imagem para quem usa leitor de tela.

**Onde achar imagens gratuitas:** unsplash.com, pexels.com, undraw.co (ilustrações), storyset.com. Para fotos da equipe, usem fotos de vocês.

### 3.5 Adicionar ou mudar um campo do formulário

Abra `js/config.js`. Cada campo é um bloco assim:

```js
{ "id": "titulo", "rotulo": "Nome que aparece", "tipo": "text", "obrigatorio": true }
```

- Para **adicionar**, copie um bloco, cole embaixo (com vírgula entre eles) e mude o `id` e o `rotulo`.
- Tipos: `text`, `number`, `date`, `time`, `url`, `textarea` (texto grande) e `select` (lista de opções, precisa de `"opcoes": ["A", "B"]`).
- Para o campo aparecer no card, coloque o `id` em `camposEtiqueta` (vira etiqueta) ou `camposDetalhe` (vira linha de texto).
- Para virar filtro, coloque o `id` em `filtros`.

O formulário, a lista e os filtros se montam sozinhos a partir dessa configuração.

### 3.6 Adicionar uma página nova

1. Copie uma página parecida (ex.: `login.html`) e renomeie.
2. Mude o `<title>` e apague o conteúdo de dentro do `<main>`.
3. Escreva o conteúdo novo.
4. Adicione o link no menu de **todas** as páginas.
5. Se só quem fez login pode ver, coloque antes do `</body>`: `<script>protegerPagina();</script>` (depois dos outros scripts).

### 3.7 Mudar a ordem das seções da página inicial

No `index.html`, cada bloco começa com `<!-- NOME DA SEÇÃO -->` e é uma `<section>`. Recorte a section inteira (do `<section` até o `</section>`) e cole em outro lugar. Para apagar uma seção, é só deletar o bloco.

---

## 4. Melhorias propostas para o seu tema

As melhorias têm nível: ⭐ fácil, ⭐⭐ médio. Façam pelo menos **duas**. Sempre testem depois de cada uma e façam um commit (seção 6).

### Melhoria A: foto de perfil no portfólio ⭐ fácil

1. Salve sua foto em `img/perfil.jpg`.
2. No `portfolio.html`, troque `<div class="espaco-imagem foto-perfil">📷 Sua foto</div>` por:

```html
<img src="img/perfil.jpg" alt="Foto de perfil" class="imagem foto-perfil">
```

3. Desafio ⭐⭐: coloque um campo "Link da foto" no formulário de perfil e salve junto com o nome e a bio (veja como o `js/portfolio.js` salva o `cargo` e repita para a foto).

### Melhoria B: projeto em destaque ⭐⭐ médio

1. Em `js/config.js`, adicione o campo:

```js
{ "id": "destaque", "rotulo": "Projeto em destaque?", "tipo": "select", "opcoes": ["Não", "Sim"] },
```

2. Em `js/portfolio.js`, na função `montarProjetos`, troque a primeira linha por:

```js
const todos = pegarRegistros().sort((a, b) => (b.destaque === 'Sim') - (a.destaque === 'Sim') || b.id - a.id);
```

3. Agora os projetos marcados como destaque aparecem primeiro. Para deixá-los com borda azul, adicione no CSS `.projeto.destaque { outline: 3px solid var(--primaria); outline-offset: 10px; }` e coloque `class="projeto ${p.destaque === 'Sim' ? 'destaque' : ''}"` na `<section>`.

### Melhoria C: filtrar por tecnologia no portfólio ⭐⭐ médio

Hoje o filtro é por categoria. Para filtrar por tecnologia, em `js/portfolio.js`:

1. Troque a lista `categorias` por `const categorias = [...tecnologias];` (a variável `tecnologias` já existe logo acima).
2. Troque o filtro de projetos por:

```js
const projetos = categoriaAtiva
  ? todos.filter(p => (p.tecnologias || '').includes(categoriaAtiva))
  : todos;
```

### Melhoria D: seção "Habilidades" com barras ⭐ fácil

No `portfolio.html`, depois do `<div class="portfolio-numeros" ...>`, cole:

```html
<section style="margin:30px 0">
  <h2>Habilidades</h2>
  <p>HTML</p><div class="barra"><div style="width:80%"></div></div>
  <p>CSS</p><div class="barra"><div style="width:65%"></div></div>
  <p>JavaScript</p><div class="barra"><div style="width:40%"></div></div>
</section>
```

Troque os nomes e as porcentagens. A classe `barra` já existe no CSS.

### Melhoria E: segundo visual do portfólio (escuro) ⭐⭐ médio

1. No final do `css/style.css`:

```css
.portfolio.escuro { background: var(--tinta); color: var(--fundo); padding: 60px 40px; }
```

2. Na barra de ferramentas do `portfolio.html`, adicione:

```html
<button class="botao botao-pequeno" onclick="document.querySelector('.portfolio').classList.toggle('escuro')">Trocar visual</button>
```

---

## 5. Melhorias que servem para qualquer site

### Melhoria 1: mostrar e esconder a senha ⭐ fácil

No `login.html` e no `cadastro.html`, logo depois do `<input type="password" id="senha" ...>`, adicione:

```html
<label><input type="checkbox" onclick="senha.type = this.checked ? 'text' : 'password'"> Mostrar senha</label>
```

### Melhoria 2: animação quando a seção aparece na tela ⭐⭐ médio

1. No final do `css/style.css`:

```css
.animar { opacity: 0; transform: translateY(30px); transition: opacity .7s, transform .7s; }
.animar.visivel { opacity: 1; transform: none; }
```

2. Crie `js/animacoes.js`:

```js
document.querySelectorAll('section').forEach(secao => secao.classList.add('animar'));
const observador = new IntersectionObserver(itens => {
  itens.forEach(item => {
    if (item.isIntersecting) item.target.classList.add('visivel');
  });
});
document.querySelectorAll('.animar').forEach(el => observador.observe(el));
```

3. Coloque `<script src="js/animacoes.js"></script>` no final do `index.html`.

### Melhoria 3: botão de trocar o tema (claro/escuro) ⭐⭐ médio

Como as cores estão em variáveis, dá para trocar todas de uma vez.

1. No final do `css/style.css`, crie uma versão alternativa das variáveis (copie de `:root` e mude as cores):

```css
body.tema-alternativo {
  --fundo: #ffffff;
  --superficie: #f4f4f4;
  --texto: #111111;
  /* ...as outras que quiser mudar */
}
```

2. No menu, adicione um botão: `<button class="botao botao-pequeno" id="trocar-tema">🌓</button>`
3. No final do `js/auth.js`:

```js
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('tema') === 'alt') document.body.classList.add('tema-alternativo');
  const botao = document.getElementById('trocar-tema');
  if (!botao) return;
  botao.addEventListener('click', () => {
    document.body.classList.toggle('tema-alternativo');
    localStorage.setItem('tema', document.body.classList.contains('tema-alternativo') ? 'alt' : '');
  });
});
```

### Melhoria 4: contador de resultados na lista ⭐ fácil

1. Na página de lista, logo acima de `<div id="lista">`, coloque `<p id="contador"></p>`.
2. No `js/app.js`, dentro de `montarLista`, logo depois de `const lista = registrosFiltrados();`:

```js
const contador = document.getElementById('contador');
if (contador) contador.textContent = `${lista.length} resultado(s)`;
```

### Melhoria 5: página "Sobre" ⭐ fácil

1. Copie o `login.html` e renomeie para `sobre.html`.
2. Apague tudo que está dentro de `<main>` e escreva o conteúdo novo (história do projeto, objetivo, referências).
3. Adicione o link no menu de **todas** as páginas: `<a href="sobre.html">Sobre</a>`.

### Melhoria 6: favicon (ícone da aba) ⭐ fácil

Salve uma imagem quadrada em `img/icone.png` e coloque dentro do `<head>` de cada página:

```html
<link rel="icon" href="img/icone.png">
```

### Ideias extras para quem quiser ir além

- Página de **perfil** mostrando nome e e-mail do usuário logado (use `usuarioLogado()`).
- **Editar** um registro (dica: carregar os dados no formulário e salvar por cima pelo `id`).
- Menu **hambúrguer** no celular.
- Página **404** personalizada.
- Deixar o site **acessível**: contraste das cores, `alt` nas imagens, navegar só com o teclado.

---

## Divisão sugerida de tarefas

| Papel | Responsabilidades |
|---|---|
| **Liderança** | Cria o repositório, adiciona os colaboradores, divide as tarefas, revisa e aprova os Pull Requests, organiza a apresentação |
| **Dev** | Implementa as melhorias em JavaScript, corrige erros, cuida do login e do formulário |
| **UX / Design** | Define cores, fontes e imagens, faz um rascunho no Figma, revisa se o site está bonito no celular |
| **Conteúdo** | Escreve os textos, pesquisa dados reais (com fonte), cuida dos depoimentos e da seção da equipe |

> Todo mundo deve fazer **pelo menos um commit**. O histórico do GitHub mostra quem contribuiu.

---

## 6. Git e GitHub: salvando e compartilhando o código

> **Ideia principal:** o **Git** guarda o histórico do projeto (cada "save" é um **commit**). O **GitHub** é o site onde esse histórico fica na nuvem para o grupo todo trabalhar junto.

### 6.1 Palavras que vocês vão ouvir

| Termo | O que é |
|---|---|
| **Repositório (repo)** | A pasta do projeto com todo o histórico |
| **Commit** | Um "save" com uma mensagem explicando o que mudou |
| **Push** | Enviar seus commits do seu computador para o GitHub |
| **Pull** | Baixar do GitHub o que os colegas enviaram |
| **Clone** | Baixar o repositório pela primeira vez |
| **Branch** | Uma "cópia paralela" para mexer sem bagunçar a principal |
| **Merge** | Juntar uma branch na outra |
| **Pull Request (PR)** | Pedido no GitHub para juntar sua branch na principal, com revisão |
| **Conflito** | Quando duas pessoas mudaram a mesma linha e o Git precisa que alguém escolha |

### 6.2 Primeira vez (só a liderança faz)

1. Crie uma conta em **github.com** (todos do grupo).
2. Clique em **New repository**, dê o nome (ex.: `grupo3-portfolio-facil`), marque **Public** e crie.
3. Na página do repositório: **Settings → Collaborators → Add people** e adicione o usuário de cada integrante. Cada um precisa aceitar o convite pelo e-mail.
4. Suba os arquivos do template (pelo GitHub Desktop ou pelo botão **uploading an existing file**).

### 6.3 Usando o GitHub Desktop (recomendado para começar)

**Instalar e entrar**
1. Baixe em **desktop.github.com** e instale.
2. Abra e clique em **Sign in to GitHub.com**. Faça login no navegador e autorize.

**Baixar o projeto (clone)**
1. **File → Clone repository**.
2. Escolha o repositório do grupo na lista.
3. Em **Local path**, escolha onde salvar (ex.: Documentos). Clique em **Clone**.
4. Clique em **Open in Visual Studio Code** para abrir o projeto.

**O ciclo de todo dia**
1. **Antes de começar:** clique em **Fetch origin** e depois em **Pull origin** (baixa o que os colegas fizeram).
2. Faça suas alterações no VS Code e salve (Ctrl + S).
3. Volte ao GitHub Desktop. Na esquerda aparecem os arquivos alterados (verde = novo, amarelo = alterado, vermelho = apagado).
4. Embaixo, à esquerda, escreva um **Summary** (resumo) claro. Ex.: `Adiciona botão ver no mapa`.
5. Clique em **Commit to main**.
6. Clique em **Push origin** (envia para o GitHub).

**Trabalhando com branch (para não atrapalhar os colegas)**
1. **Current branch → New branch**, dê um nome como `melhoria-mapa` e clique em **Create branch**.
2. Faça os commits normalmente e clique em **Publish branch**.
3. Clique em **Create Pull Request**. O navegador abre o GitHub: escreva o que você fez e clique em **Create pull request**.
4. A liderança (ou outro colega) revisa e clica em **Merge pull request**.
5. Volte para a branch `main` no Desktop e faça **Pull origin**.

### 6.4 Usando o terminal (Git Bash ou terminal do VS Code)

Configuração inicial (uma vez por computador):

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

Baixar o projeto:

```bash
git clone https://github.com/USUARIO/NOME-DO-REPO.git
cd NOME-DO-REPO
```

O ciclo de todo dia:

```bash
git pull                     # 1. baixa o que os colegas fizeram
# ... você edita os arquivos ...
git status                   # 2. mostra o que mudou
git add .                    # 3. prepara todos os arquivos alterados
git commit -m "Adiciona página Sobre"   # 4. cria o commit
git push                     # 5. envia para o GitHub
```

Trabalhando com branch:

```bash
git checkout -b melhoria-tema      # cria a branch e entra nela
# ... edita, add, commit ...
git push -u origin melhoria-tema   # envia a branch (depois abra o Pull Request no site)
git checkout main                  # volta para a principal
git pull                           # atualiza depois do merge
```

Outros comandos úteis:

```bash
git log --oneline     # lista os commits
git diff              # mostra exatamente o que mudou
git branch            # lista as branches
git restore arquivo.html   # desfaz alterações não salvas em um arquivo
```

### 6.5 Boas mensagens de commit

Comece com um verbo e diga **o que** mudou:

- ✅ `Adiciona filtro por bairro`
- ✅ `Corrige cor do botão no celular`
- ✅ `Troca imagens da página inicial`
- ❌ `alterações`
- ❌ `asdasd`
- ❌ `final agora vai`

### 6.6 Deu conflito, e agora?

Acontece quando duas pessoas mudaram a mesma parte do mesmo arquivo. O arquivo vai ficar assim:

```
<<<<<<< HEAD
<h1>Título da Maria</h1>
=======
<h1>Título do João</h1>
>>>>>>> outra-branch
```

1. Converse com o colega e decidam qual versão fica (ou juntem as duas).
2. Apague as linhas `<<<<<<<`, `=======` e `>>>>>>>`, deixando só o código certo.
3. Salve, faça `git add .` e `git commit` (no Desktop: **Commit merge**).

**Para evitar conflito:** sempre faça **Pull** antes de começar, dividam as tarefas por arquivo e façam commits pequenos e frequentes.

### 6.7 Publicando o site (GitHub Pages)

Assim o site ganha um link para mostrar na apresentação.

1. No repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
4. Espere 1 ou 2 minutos e atualize a página. Vai aparecer o link: `https://USUARIO.github.io/NOME-DO-REPO/`
5. Cada novo push atualiza o site sozinho (pode levar 1 minuto).

> ⚠️ O arquivo da página inicial **precisa** se chamar `index.html` e estar na raiz do repositório.

> ⚠️ Os cadastros e logins ficam salvos no navegador de cada pessoa. Se você abrir o site em outro computador, vai precisar criar a conta de novo. Isso é normal neste projeto.

---

## 7. Checklist da entrega

- [ ] Nenhum texto com fundo amarelo (todos os `class="trocar"` foram substituídos)
- [ ] Nenhuma caixa tracejada 📷 (todas as imagens foram colocadas)
- [ ] Cores e fontes escolhidas pelo grupo
- [ ] Pelo menos duas melhorias da seção 4 ou 5 implementadas
- [ ] Cadastro, login e sair funcionando
- [ ] Cadastrar, listar e filtrar funcionando
- [ ] Site testado no celular (no navegador: F12 → ícone de celular)
- [ ] Todos os integrantes com commits no GitHub
- [ ] Site publicado no GitHub Pages e link funcionando

**Bom projeto! 💪**
