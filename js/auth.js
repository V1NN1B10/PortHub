// =========================================================
// LOGIN E CADASTRO (funciona só no navegador, com localStorage)
// Atenção: isso é para estudo! Em um site real, senhas nunca
// ficam salvas no navegador.
// =========================================================

const CHAVE_USUARIOS = CONFIG.chave + '_usuarios';
const CHAVE_SESSAO = CONFIG.chave + '_sessao';
const AUTH_API_ATIVA = CONFIG.auth?.mode === 'api';

async function requisicaoAuth(caminho, dados) {
  const baseConfigurada = CONFIG.auth?.apiBaseUrl;
  if (!baseConfigurada) throw new Error('Configure a URL da API em js/config.js.');
  const base = baseConfigurada.replace(/\/$/, '');
  const resposta = await fetch(`${base}/auth/${caminho}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dados)
  });
  const resultado = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(resultado.message || 'Não foi possível concluir a operação.');
  return resultado;
}

function gerarCodigoRecuperacao() {
  if (!window.crypto?.getRandomValues) throw new Error('Este navegador não oferece geração segura de códigos.');
  const valor = new Uint32Array(1);
  window.crypto.getRandomValues(valor);
  return String(100000 + (valor[0] % 900000));
}

async function enviarCodigoRecuperacao(email, codigo, validadeMinutos) {
  const emailjs = CONFIG.emailjs || {};
  if (!emailjs.serviceId || !emailjs.templateId || !emailjs.publicKey) {
    throw new Error('O envio de e-mail ainda não foi configurado em js/config.js.');
  }
  const resposta = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: emailjs.serviceId,
      template_id: emailjs.templateId,
      user_id: emailjs.publicKey,
      template_params: {
        to_email: email,
        verification_code: codigo,
        app_name: 'PortHub',
        expiration_minutes: validadeMinutos
      }
    })
  });
  if (!resposta.ok) throw new Error('O serviço de e-mail não aceitou o envio. Confira o template e as configurações.');
}

function pegarUsuarios() {
  return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}

async function cadastrarUsuario(nome, email, senha) {
  if (AUTH_API_ATIVA) {
    try {
      await requisicaoAuth('register', { nome, email, senha });
      return null;
    } catch (erro) { return erro.message; }
  }
  const usuarios = pegarUsuarios();
  const jaExiste = usuarios.find(u => u.email === email);
  if (jaExiste) return 'Esse e-mail já está cadastrado.';
  if (senha.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  usuarios.push({ nome, email, senha });
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  return null; // null = deu tudo certo
}

async function fazerLogin(email, senha) {
  if (AUTH_API_ATIVA) {
    try {
      const resultado = await requisicaoAuth('login', { email, senha });
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(resultado.user));
      return true;
    } catch (erro) { return false; }
  }
  const usuario = pegarUsuarios().find(u => u.email === email && u.senha === senha);
  if (!usuario) return false;
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ nome: usuario.nome, email: usuario.email }));
  return true;
}

async function trocarSenhaUsuario(email, novaSenha, codigo) {
  if (AUTH_API_ATIVA) {
    try {
      await requisicaoAuth('reset-password', { email, code: codigo, novaSenha });
      return true;
    } catch (erro) { return false; }
  }
  const usuarios = pegarUsuarios();
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) return false;
  usuario.senha = novaSenha;
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  return true;
}

function usuarioLogado() {
  return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
}

async function sair() {
  if (AUTH_API_ATIVA) {
    try { await requisicaoAuth('logout', {}); } catch (erro) { /* A sessão local também será removida. */ }
  }
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

function mostrarRedesSociais() {
  const area = document.getElementById('redes-sociais');
  if (!area) return;
  const redes = CONFIG.redesSociais || {};
  const icones = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="ponto" cx="18" cy="6" r="1"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3v11.1a4.4 4.4 0 1 1-3.5-4.3v3.7a.9.9 0 1 0-.9.9V3h4.4Zm0 0c.3 2.6 1.8 4 4 4.2v3.6c-1.5 0-2.9-.5-4-1.3V3Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2Zm0 17.8c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3A7.8 7.8 0 1 1 12 19.8Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-3-.2-.3.2-.3.6-1 .1-.2.1-.3 0-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1.1 1.8-.8 2.9.4 1.2 1.2 2.3 2.1 3.1 1.4 1.3 2.5 1.8 4.1 2.3 1.1.3 2 .2 2.7-.2.8-.4 1.2-1.1 1.3-1.7.1-.2 0-.3-.2-.4Z"/></svg>'
  };
  const dados = [
    { id: 'instagram', texto: 'Instagram', destino: redes.instagramUrl, icone: icones.instagram },
    { id: 'tiktok', texto: 'TikTok', destino: redes.tiktokUrl, icone: icones.tiktok },
    { id: 'whatsapp', texto: 'WhatsApp', destino: redes.whatsappNumber ? `https://wa.me/${redes.whatsappNumber.replace(/\D/g, '')}` : '', icone: icones.whatsapp }
  ];
  area.innerHTML = dados.map(rede => rede.destino
    ? `<a class="rede-social" href="${rede.destino}" target="_blank" rel="noopener noreferrer" aria-label="${rede.texto}">${rede.icone}<span>${rede.texto}</span></a>`
    : `<span class="rede-social rede-social-vazia" aria-label="${rede.texto}: link ainda não configurado">${rede.icone}<span>${rede.texto}</span></span>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarUsuarioNoMenu();
  marcarMenuAtivo();
  mostrarRedesSociais();
  const campoSenha = document.getElementById('senha');
  const botaoVisibilidadeSenha = document.getElementById('alternar-senha');
  if (campoSenha && botaoVisibilidadeSenha) {
    botaoVisibilidadeSenha.addEventListener('click', () => {
      const mostrar = campoSenha.type === 'password';
      campoSenha.type = mostrar ? 'text' : 'password';
      botaoVisibilidadeSenha.setAttribute('aria-pressed', String(mostrar));
      botaoVisibilidadeSenha.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      botaoVisibilidadeSenha.title = mostrar ? 'Ocultar senha' : 'Mostrar senha';
    });
  }
  // ----- Formulário de cadastro -----
  const formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', async evento => {
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
      const erro = await cadastrarUsuario(nome, email, senha);
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
    formLogin.addEventListener('submit', async evento => {
      evento.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const senha = document.getElementById('senha').value;
      const msg = document.getElementById('mensagem');
      if (await fazerLogin(email, senha)) {
        window.location.href = CONFIG.paginaAposLogin;
      } else {
        msg.className = 'mensagem erro';
        msg.textContent = 'E-mail ou senha incorretos.';
      }
    });
  }

  // Recuperação por código enviado com EmailJS.
  const modalRecuperacao = document.getElementById('recuperacao-senha');
  const formEmailRecuperacao = document.getElementById('form-recuperacao-email');
  const formCodigoRecuperacao = document.getElementById('form-recuperacao-codigo');
  if (modalRecuperacao && formEmailRecuperacao && formCodigoRecuperacao) {
    const msgRecuperacao = document.getElementById('mensagem-recuperacao');
    let recuperacao = null;
    const mostrarMensagem = (texto, tipo = '') => {
      msgRecuperacao.className = `mensagem ${tipo}`.trim();
      msgRecuperacao.textContent = texto;
    };
    const fechar = () => {
      modalRecuperacao.hidden = true;
      recuperacao = null;
      formEmailRecuperacao.reset();
      formCodigoRecuperacao.reset();
      formEmailRecuperacao.hidden = false;
      formCodigoRecuperacao.hidden = true;
      mostrarMensagem('');
      document.getElementById('recuperacao-instrucao').textContent = 'Informe o e-mail usado no cadastro para receber um código de verificação.';
    };
    const abrirRecuperacao = document.getElementById('abrir-recuperacao');
    if (abrirRecuperacao) {
      abrirRecuperacao.addEventListener('click', evento => {
        evento.preventDefault();
        modalRecuperacao.hidden = false;
        document.getElementById('email-recuperacao').focus();
      });
    }
    document.getElementById('fechar-recuperacao').addEventListener('click', fechar);
    modalRecuperacao.addEventListener('click', evento => { if (evento.target === modalRecuperacao) fechar(); });
    document.addEventListener('keydown', evento => { if (evento.key === 'Escape' && !modalRecuperacao.hidden) fechar(); });

    formEmailRecuperacao.addEventListener('submit', async evento => {
      evento.preventDefault();
      const email = document.getElementById('email-recuperacao').value.trim().toLowerCase();
      const botao = formEmailRecuperacao.querySelector('button[type="submit"]');
      botao.disabled = true;
      botao.textContent = 'Enviando...';
      try {
        let codigo = null;
        if (AUTH_API_ATIVA) {
          await requisicaoAuth('forgot-password', { email });
          recuperacao = { email, modoApi: true };
        } else {
          const usuario = pegarUsuarios().find(u => u.email === email);
          if (!usuario) {
            mostrarMensagem('Se esse e-mail estiver cadastrado, você receberá um código.');
            return;
          }
          const politicaRecuperacao = CONFIG.recuperacaoSenha || {};
          const validadeMinutos = politicaRecuperacao.validadeMinutos || 10;
          codigo = gerarCodigoRecuperacao();
          await enviarCodigoRecuperacao(email, codigo, validadeMinutos);
          recuperacao = {
            email,
            codigo,
            expiraEm: Date.now() + validadeMinutos * 60 * 1000,
            tentativas: 0,
            maxTentativas: politicaRecuperacao.maxTentativas || 5
          };
        }
        formEmailRecuperacao.hidden = true;
        formCodigoRecuperacao.hidden = false;
        document.getElementById('recuperacao-instrucao').textContent = AUTH_API_ATIVA
          ? 'Se o e-mail estiver cadastrado, enviaremos um código. Digite-o abaixo para continuar.'
          : `Enviamos um código de 6 dígitos. Ele expira em ${CONFIG.recuperacaoSenha?.validadeMinutos || 10} minutos.`;
        mostrarMensagem('Confira sua caixa de entrada e a pasta de spam.', 'sucesso');
        document.getElementById('codigo-recuperacao').focus();
      } catch (erro) {
        mostrarMensagem(erro.message || 'Não foi possível enviar o código. Confira as configurações e tente novamente.', 'erro');
      } finally {
        botao.disabled = false;
        botao.textContent = 'Enviar código';
      }
    });

    formCodigoRecuperacao.addEventListener('submit', async evento => {
      evento.preventDefault();
      const codigoDigitado = document.getElementById('codigo-recuperacao').value.trim();
      const novaSenha = document.getElementById('nova-senha').value;
      const confirmar = document.getElementById('confirmar-nova-senha').value;
      if (!recuperacao || (!recuperacao.modoApi && Date.now() > recuperacao.expiraEm)) {
        mostrarMensagem('O código expirou. Feche esta janela e solicite outro.', 'erro');
        return;
      }
      if (!recuperacao.modoApi && codigoDigitado !== recuperacao.codigo) {
        recuperacao.tentativas += 1;
        if (recuperacao.tentativas >= (recuperacao.maxTentativas || CONFIG.recuperacaoSenha?.maxTentativas || 5)) {
          recuperacao = null;
          mostrarMensagem('Limite de tentativas atingido. Feche e solicite um novo código.', 'erro');
        } else mostrarMensagem('Código inválido. Confira o e-mail e tente novamente.', 'erro');
        return;
      }
      if (novaSenha.length < 6) return mostrarMensagem('A senha precisa ter pelo menos 6 caracteres.', 'erro');
      if (novaSenha !== confirmar) return mostrarMensagem('As senhas não são iguais.', 'erro');
      if (!await trocarSenhaUsuario(recuperacao.email, novaSenha, codigoDigitado)) return mostrarMensagem('Código inválido ou não foi possível atualizar a senha.', 'erro');
      recuperacao = null;
      formCodigoRecuperacao.hidden = true;
      document.getElementById('recuperacao-instrucao').textContent = 'Sua senha foi redefinida com sucesso.';
      mostrarMensagem('Senha alterada! Agora você já pode entrar com a nova senha.', 'sucesso');
    });
  }
});
