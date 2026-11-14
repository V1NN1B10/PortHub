// Modelos e projetos exibidos na página inicial.
(() => {
  const CHAVE_PROJETOS = `${CONFIG.chave}_registros`;
  const CHAVE_MODELO = `${CONFIG.chave}_modelo`;
  const areaProjetos = document.getElementById('projetos-cliente');
  const modelosValidos = ['aurora', 'lume', 'noite'];

  if (!areaProjetos) return;

  function escapar(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function lerProjetos() {
    try {
      const projetos = JSON.parse(localStorage.getItem(CHAVE_PROJETOS) || '[]');
      return Array.isArray(projetos) ? projetos : [];
    } catch (erro) {
      return [];
    }
  }

  function renderizarProjetos() {
    const projetos = lerProjetos().sort((a, b) => Number(b.id) - Number(a.id));
    if (!projetos.length) {
      areaProjetos.innerHTML = '<div class="projetos-cliente-vazio">Seus projetos cadastrados vão aparecer aqui. <a href="novo-projeto.html">Cadastre o primeiro projeto</a>.</div>';
      return;
    }

    areaProjetos.innerHTML = projetos.map(projeto => {
      const imagem = String(projeto[CONFIG.campoImagem] || '').trim();
      const foto = imagem && !/^\s*(javascript|vbscript):/i.test(imagem)
        ? `<img class="projeto-cliente-foto" src="${escapar(imagem)}" alt="Imagem do projeto ${escapar(projeto[CONFIG.campoTitulo])}">`
        : '<div class="projeto-cliente-foto projeto-cliente-placeholder" aria-label="Projeto sem imagem">▧</div>';
      const tags = Array.isArray(projeto.tecnologias)
        ? projeto.tecnologias.join(', ')
        : String(projeto.tecnologias || '');
      return `<article class="projeto-cliente-card">
        ${foto}
        <div class="projeto-cliente-corpo">
          <span class="projeto-cliente-meta">${escapar(projeto.categoria || 'Projeto')}</span>
          <h4>${escapar(projeto[CONFIG.campoTitulo] || 'Projeto sem título')}</h4>
          <p>${escapar(projeto.descricao || 'Adicione uma descrição para apresentar este projeto.')}</p>
          ${tags ? `<div class="projeto-cliente-tags">${escapar(tags)}</div>` : ''}
          <div class="projeto-cliente-acoes">
            <a class="botao botao-contorno" href="novo-projeto.html?editar=${encodeURIComponent(projeto.id)}">Editar</a>
            <button class="botao botao-perigo" type="button" data-excluir-projeto="${escapar(projeto.id)}">Excluir</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  function modeloAtual() {
    const guardado = localStorage.getItem(CHAVE_MODELO);
    return modelosValidos.includes(guardado) ? guardado : 'aurora';
  }

  function atualizarModelos() {
    const atual = modeloAtual();
    document.querySelectorAll('[data-modelo-card]').forEach(cartao => {
      const selecionado = cartao.dataset.modeloCard === atual;
      cartao.classList.toggle('selecionado', selecionado);
      const botao = cartao.querySelector('[data-modelo]');
      if (botao) {
        botao.setAttribute('aria-pressed', String(selecionado));
        botao.textContent = selecionado ? 'Modelo selecionado' : 'Usar este modelo';
      }
    });
  }

  document.addEventListener('click', evento => {
    const botaoModelo = evento.target.closest('[data-modelo]');
    if (botaoModelo) {
      const modelo = botaoModelo.dataset.modelo;
      if (modelosValidos.includes(modelo)) {
        localStorage.setItem(CHAVE_MODELO, modelo);
        atualizarModelos();
      }
      return;
    }

    const botaoExcluir = evento.target.closest('[data-excluir-projeto]');
    if (!botaoExcluir) return;
    const id = botaoExcluir.dataset.excluirProjeto;
    if (!window.confirm('Tem certeza que quer excluir este projeto?')) return;
    const restantes = lerProjetos().filter(projeto => String(projeto.id) !== id);
    localStorage.setItem(CHAVE_PROJETOS, JSON.stringify(restantes));
    renderizarProjetos();
  });

  renderizarProjetos();
  atualizarModelos();
})();
