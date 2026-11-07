// =========================================================
// LOGIN E CADASTRO (funciona só no navegador, com localStorage)
// Atenção: isso é para estudo! Em um site real, senhas nunca
// ficam salvas no navegador.
// =========================================================

const CHAVE_USUARIOS = CONFIG.chave + '_usuarios';
const CHAVE_SESSAO = CONFIG.chave + '_sessao';

function pegarUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}

function cadastrarUsuario(nome, email, senha) {
  const usuarios = pegarUsuarios();
  const jaExiste = usuarios.find(u => u.email === email);
  if (jaExiste) return 'Esse e-mail já está cadastrado.';
  if (senha.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  usuarios.push({ nome, email, senha });
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  return null; // null = deu tudo certo
}

function fazerLogin(email, senha) {
  const usuario = pegarUsuarios().find(u => u.email === email && u.senha === senha);
  if (!usuario) return false;
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ nome: usuario.nome, email: usuario.email }));
  return true;
}

function usuarioLogado() {
  return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
}

function sair() {
  localStorage.removeItem(CHAVE_SESSAO);
  window.location.href = 'index.html';
}

// Coloque protegerPagina() nas páginas que só quem fez login pode ver
function protegerPagina() {
  if (!usuarioLogado()) {
    alert('Faça login para acessar esta página.');
    window.location.href = 'login.html';
  }
}

// Mostra "Olá, Fulano | Sair" ou "Entrar | Cadastrar" no menu
function mostrarUsuarioNoMenu() {
  const area = document.getElementById('area-usuario');
  if (!area) return;
  const usuario = usuarioLogado();
  if (usuario) {
    area.innerHTML = `<span>Olá, ${usuario.nome.split(' ')[0]}!</span>
      <button class="botao botao-pequeno botao-claro" onclick="sair()">Sair</button>`;
  } else {
    area.innerHTML = `<a class="botao botao-pequeno botao-claro" href="login.html">Entrar</a>`;
  }
}

// Marca no menu a página atual
function marcarMenuAtivo() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === pagina) link.classList.add('ativo');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarUsuarioNoMenu();
  marcarMenuAtivo();

  // ----- Formulário de cadastro -----
  const formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', evento => {
      evento.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const senha = document.getElementById('senha').value;
      const confirmar = document.getElementById('confirmar').value;
      const msg = document.getElementById('mensagem');

      if (senha !== confirmar) {
        msg.className = 'mensagem erro';
        msg.textContent = 'As senhas não são iguais.';
        return;
      }
      const erro = cadastrarUsuario(nome, email, senha);
      if (erro) {
        msg.className = 'mensagem erro';
        msg.textContent = erro;
        return;
      }
      msg.className = 'mensagem sucesso';
      msg.textContent = 'Cadastro feito! Indo para o login...';
      setTimeout(() => (window.location.href = 'login.html'), 1200);
    });
  }

  // ----- Formulário de login -----
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', evento => {
      evento.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const senha = document.getElementById('senha').value;
      const msg = document.getElementById('mensagem');
      if (fazerLogin(email, senha)) {
        window.location.href = CONFIG.paginaAposLogin;
      } else {
        msg.className = 'mensagem erro';
        msg.textContent = 'E-mail ou senha incorretos.';
      }
    });
  }
});
