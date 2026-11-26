// Reprodução da animação de apresentação.
(() => {
  const animacao = document.querySelector('.oferece-video');
  if (!animacao) return;

  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibilidadeMinima = 0.5;
  let visivel = false;

  function atualizarAnimacao() {
    if (!visivel || movimentoReduzido.matches) {
      animacao.pause();
      animacao.currentTime = 0;
      return;
    }

    animacao.play().catch(() => {});
  }

  const observador = new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting && entrada.intersectionRatio >= visibilidadeMinima;
    atualizarAnimacao();
  }, { threshold: visibilidadeMinima });

  observador.observe(animacao);
  movimentoReduzido.addEventListener('change', atualizarAnimacao);
})();

// Seletor de modelos da página inicial.
(() => {
  const CHAVE_MODELO = `${CONFIG.chave}_modelo`;
  const carrossel = document.querySelector('[data-modelos-carrossel]');
  if (!carrossel) return;

  const cartoes = [...carrossel.querySelectorAll('[data-modelo-card]')];
  const modelosValidos = cartoes.map((cartao) => cartao.dataset.modeloCard);
  const posicoes = ['atual', 'proximo', 'anterior'];
  const botaoAnterior = carrossel.querySelector('[data-modelos-anterior]');
  const botaoProximo = carrossel.querySelector('[data-modelos-proximo]');
  const status = carrossel.querySelector('[data-modelos-status]');
  let indiceAtual = modelosValidos.indexOf(modeloAtual());

  function modeloAtual() {
    const guardado = localStorage.getItem(CHAVE_MODELO);
    return modelosValidos.includes(guardado) ? guardado : 'aurora';
  }

  function atualizarModelos() {
    const atual = modeloAtual();
    cartoes.forEach((cartao) => {
      const selecionado = cartao.dataset.modeloCard === atual;
      cartao.classList.toggle('selecionado', selecionado);
      const botao = cartao.querySelector('[data-modelo]');
      if (botao) {
        botao.setAttribute('aria-pressed', String(selecionado));
        botao.textContent = selecionado ? 'Modelo selecionado' : 'Usar este modelo';
      }
    });
  }

  function mostrarModelo() {
    cartoes.forEach((cartao, indice) => {
      const distancia = (indice - indiceAtual + cartoes.length) % cartoes.length;
      cartao.dataset.posicao = posicoes[distancia];
      cartao.inert = indice !== indiceAtual;
    });
  }

  function navegar(direcao) {
    const focoNoCartao = cartoes[indiceAtual].contains(document.activeElement);
    indiceAtual = (indiceAtual + direcao + cartoes.length) % cartoes.length;
    mostrarModelo();

    const cartao = cartoes[indiceAtual];
    if (focoNoCartao) cartao.querySelector('[data-modelo]').focus();
    const nome = cartao.querySelector('h4').textContent;
    status.textContent = `${nome}, modelo ${indiceAtual + 1} de ${cartoes.length}.`;
  }

  document.addEventListener('click', (evento) => {
    const botaoModelo = evento.target.closest('[data-modelo]');
    if (!botaoModelo) return;
    const modelo = botaoModelo.dataset.modelo;
    if (!modelosValidos.includes(modelo)) return;
    localStorage.setItem(CHAVE_MODELO, modelo);
    atualizarModelos();
    window.dispatchEvent(new CustomEvent('porthub:modelo-alterado'));
  });

  atualizarModelos();
  mostrarModelo();
  carrossel.classList.add('carrossel-ativo');
  carrossel.setAttribute('aria-roledescription', 'carrossel');
  botaoAnterior.hidden = false;
  botaoProximo.hidden = false;

  botaoAnterior.addEventListener('click', () => navegar(-1));
  botaoProximo.addEventListener('click', () => navegar(1));
  carrossel.addEventListener('keydown', (evento) => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    navegar(evento.key === 'ArrowLeft' ? -1 : 1);
  });
})();
