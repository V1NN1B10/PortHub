// Fluxo visual de perfil, projetos e modelo do PortHub.
(() => {
  const wizard = document.querySelector('[data-montar-wizard]');
  if (!wizard || typeof CONFIG === 'undefined') return;

  const chavePerfil = `${CONFIG.chave}_perfil`;
  const chaveProjetos = `${CONFIG.chave}_registros`;
  const chaveModelo = `${CONFIG.chave}_modelo`;
  const modelos = { aurora: 'Aurora', lume: 'Lume', noite: 'Noite' };
  const contexto = wizard.dataset.contexto;
  const listaProjetos = wizard.querySelector('[data-lista-projetos]');
  const botoesEtapa = [...wizard.querySelectorAll('[data-etapa]')];
  const paineis = [...wizard.querySelectorAll('[data-painel]')];

  function escapar(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function lerJSON(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave) || 'null');
      return valor == null ? padrao : valor;
    } catch (erro) {
      return padrao;
    }
  }

  function lerPerfil() {
    const perfil = lerJSON(chavePerfil, {});
    if (!perfil.nome && typeof usuarioLogado === 'function') {
      const usuario = usuarioLogado();
      if (usuario && usuario.nome) perfil.nome = usuario.nome;
    }
    return perfil;
  }

  function preencherPerfil() {
    const perfil = lerPerfil();
    wizard.querySelectorAll('[data-perfil]').forEach(campo => {
      campo.value = perfil[campo.dataset.perfil] || '';
    });
  }

  function salvarPerfil() {
    const perfil = lerJSON(chavePerfil, {});
    wizard.querySelectorAll('[data-perfil]').forEach(campo => {
      perfil[campo.dataset.perfil] = campo.value.trim();
    });
    localStorage.setItem(chavePerfil, JSON.stringify(perfil));
  }

  function imagemSegura(valor) {
    const imagem = String(valor || '').trim();
    if (!imagem || /^(javascript|vbscript):/i.test(imagem) || /^\/\//.test(imagem)) return '';
    if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(imagem)) return imagem;
    if (/^[a-z][a-z0-9+.-]*:/i.test(imagem) && !/^https?:\/\//i.test(imagem)) return '';
    return imagem;
  }

  function lerProjetos() {
    const projetos = lerJSON(chaveProjetos, []);
    return Array.isArray(projetos) ? projetos.sort((a, b) => Number(b.id) - Number(a.id)) : [];
  }

  function renderizarProjetos() {
    if (!listaProjetos) return;
    const projetos = lerProjetos();
    if (!projetos.length) {
      const acao = contexto === 'novo-projeto'
        ? 'Preencha o formulário acima para cadastrar o primeiro.'
        : 'Adicione seu primeiro projeto para continuar.';
      listaProjetos.innerHTML = `<div class="montar-vazio">${acao}</div>`;
      return;
    }

    listaProjetos.innerHTML = projetos.map(projeto => {
      const titulo = projeto[CONFIG.campoTitulo] || 'Projeto sem título';
      const imagem = imagemSegura(projeto[CONFIG.campoImagem]);
      const tecnologias = Array.isArray(projeto.tecnologias)
        ? projeto.tecnologias.join(', ')
        : String(projeto.tecnologias || '');
      const miniatura = imagem
        ? `<img src="${escapar(imagem)}" alt="Prévia de ${escapar(titulo)}" data-imagem-projeto>`
        : '<div class="montar-projeto-sem-imagem" aria-hidden="true">▧</div>';
      return `<article class="montar-projeto-card">
        ${miniatura}
        <div class="montar-projeto-info">
          <span>${escapar(projeto.categoria || 'Projeto')}</span>
          <h4>${escapar(titulo)}</h4>
          <p>${escapar(tecnologias || projeto.descricao || 'Projeto adicionado ao portfólio.')}</p>
          <div class="montar-projeto-acoes">
            <a href="novo-projeto.html?editar=${encodeURIComponent(projeto.id)}&etapa=2">Editar</a>
            <button type="button" data-apagar-projeto="${escapar(projeto.id)}">Excluir</button>
          </div>
        </div>
      </article>`;
    }).join('');

    listaProjetos.querySelectorAll('img[data-imagem-projeto]').forEach(imagem => {
      imagem.addEventListener('error', () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'montar-projeto-sem-imagem';
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.textContent = '▧';
        imagem.replaceWith(placeholder);
      }, { once: true });
    });
  }

  function atualizarModelo() {
    const nome = modelos[localStorage.getItem(chaveModelo)] || modelos.aurora;
    wizard.querySelectorAll('[data-modelo-atual]').forEach(elemento => {
      elemento.textContent = nome;
    });
  }

  function irParaEtapa(numero) {
    const etapa = String(numero);
    botoesEtapa.forEach(botao => {
      const ativo = botao.dataset.etapa === etapa;
      botao.classList.toggle('ativa', ativo);
      if (ativo) botao.setAttribute('aria-current', 'step');
      else botao.removeAttribute('aria-current');
    });
    paineis.forEach(painel => {
      painel.hidden = painel.dataset.painel !== etapa;
    });
    if (etapa === '2') renderizarProjetos();
    if (etapa === '3') atualizarModelo();
  }

  const perfilForm = wizard.querySelector('.montar-perfil-form');
  if (perfilForm) {
    perfilForm.addEventListener('submit', evento => {
      evento.preventDefault();
      salvarPerfil();
      irParaEtapa(2);
    });
  }

  botoesEtapa.forEach(botao => botao.addEventListener('click', () => {
    if (botao.dataset.etapa !== '1') salvarPerfil();
    irParaEtapa(botao.dataset.etapa);
  }));

  wizard.querySelectorAll('[data-ir-etapa]').forEach(botao => {
    botao.addEventListener('click', () => irParaEtapa(botao.dataset.irEtapa));
  });

  wizard.addEventListener('click', evento => {
    const excluir = evento.target.closest('[data-apagar-projeto]');
    if (!excluir) return;
    if (!window.confirm('Tem certeza que quer excluir este projeto?')) return;
    const id = excluir.dataset.apagarProjeto;
    const projetos = lerProjetos().filter(projeto => String(projeto.id) !== id);
    localStorage.setItem(chaveProjetos, JSON.stringify(projetos));
    renderizarProjetos();
  });

  window.addEventListener('porthub:projeto-salvo', () => {
    renderizarProjetos();
    const mensagem = wizard.querySelector('#mensagem');
    if (mensagem) {
      mensagem.className = 'mensagem sucesso';
      mensagem.textContent = 'Projeto salvo com sucesso!';
    }
  });

  preencherPerfil();
  renderizarProjetos();
  const parametros = new URLSearchParams(window.location.search);
  irParaEtapa(parametros.has('editar') || parametros.get('etapa') === '2' ? 2 : 1);
})();
