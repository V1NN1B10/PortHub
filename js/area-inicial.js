// Seletor de modelos da página inicial.
(() => {
  const CHAVE_MODELO = `${CONFIG.chave}_modelo`;
  const modelosValidos = ['aurora', 'lume', 'noite'];

  function modeloAtual() {
    const guardado = localStorage.getItem(CHAVE_MODELO);
    return modelosValidos.includes(guardado) ? guardado : 'aurora';
  }

  function atualizarModelos() {
    const atual = modeloAtual();
    document.querySelectorAll('[data-modelo-card]').forEach((cartao) => {
      const selecionado = cartao.dataset.modeloCard === atual;
      cartao.classList.toggle('selecionado', selecionado);
      const botao = cartao.querySelector('[data-modelo]');
      if (botao) {
        botao.setAttribute('aria-pressed', String(selecionado));
        botao.textContent = selecionado ? 'Modelo selecionado' : 'Usar este modelo';
      }
    });
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
})();
