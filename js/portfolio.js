// Gera a página do portfólio a partir dos projetos cadastrados
const CHAVE_PERFIL = CONFIG.chave + '_perfil';
const CHAVE_MODELO = CONFIG.chave + '_modelo';
let categoriaAtiva = '';

function aplicarModeloEscolhido() {
  const modelo = localStorage.getItem(CHAVE_MODELO);
  const portfolio = document.querySelector('.portfolio');
  if (!portfolio) return;
  ['aurora', 'lume', 'noite'].forEach(nome => portfolio.classList.remove(`modelo-${nome}`));
  portfolio.classList.add(`modelo-${['aurora', 'lume', 'noite'].includes(modelo) ? modelo : 'aurora'}`);
}

function pegarPerfil() {
  const usuario = usuarioLogado() || { nome: 'Seu nome' };
  return JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {
    nome: usuario.nome,
    cargo: 'Estudante de tecnologia',
    bio: 'Escreva aqui um pouco sobre você, o que gosta de criar e o que está aprendendo.',
    contato: usuario.email || 'seu-email@exemplo.com',
    hardSkills: '',
    foto: '',
    github: '',
    linkedin: '',
  };
}

function montarPerfil() {
  const p = pegarPerfil();
  document.getElementById('pf-nome').textContent = p.nome;
  document.getElementById('pf-cargo').textContent = p.cargo;
  document.getElementById('pf-bio').textContent = p.bio;
  document.getElementById('pf-contato').textContent = p.contato;
  const foto = document.getElementById('pf-foto');
  const fotoVazia = document.getElementById('pf-foto-vazio');
  const fotoSrc = String(p.foto || '').trim();
  if (fotoSrc && !/^\s*(javascript|vbscript):/i.test(fotoSrc) && !/^\s*data:(?!image\/)/i.test(fotoSrc)) {
    foto.src = fotoSrc;
    foto.hidden = false;
    fotoVazia.hidden = true;
  } else {
    foto.removeAttribute('src');
    foto.hidden = true;
    fotoVazia.hidden = false;
  }
  const habilidades = String(p.hardSkills || '').split(',').map(item => item.trim()).filter(Boolean);
  document.getElementById('pf-hard-skills').innerHTML = habilidades.length
    ? habilidades.map(item => `<span class="etiqueta">${esc(item)}</span>`).join('')
    : '<span class="portfolio-sem-skills">Adicione suas habilidades ao editar o perfil.</span>';
  const redes = [
    { nome: 'GitHub', url: p.github },
    { nome: 'LinkedIn', url: p.linkedin },
  ].filter(item => linkSeguro(item.url));
  document.getElementById('pf-redes').innerHTML = redes
    .map(item => `<a href="${esc(item.url)}" target="_blank" rel="noopener">${item.nome}</a>`).join('');
}

async function baixarPortfolioHtml() {
  const filtroAnterior = categoriaAtiva;
  categoriaAtiva = '';
  montarProjetos();
  const portfolio = document.querySelector('.portfolio');
  const clone = portfolio.cloneNode(true);
  clone.querySelector('.chips-filtro')?.remove();
  clone.querySelectorAll('img[src]').forEach(imagem => {
    try { imagem.src = new URL(imagem.getAttribute('src'), location.href).href; } catch (erro) { /* mantém o caminho original */ }
  });
  categoriaAtiva = filtroAnterior;
  montarProjetos();
  let estiloExportado = '';
  try {
    const resposta = await fetch('css/style.css');
    if (!resposta.ok) throw new Error('Falha ao carregar CSS');
    estiloExportado = `<style>${await resposta.text()}</style>`;
  } catch (erro) {
    const cssUrl = new URL('css/style.css', location.href).href;
    estiloExportado = `<link rel="stylesheet" href="${esc(cssUrl)}">`;
  }
  const titulo = esc(document.getElementById('pf-nome').textContent || 'Meu portfólio');
  const documento = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${titulo}</title>${estiloExportado}</head><body>${clone.outerHTML}</body></html>`;
  const arquivo = new Blob([documento], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'meu-portfolio.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function imprimirPortfolioCompleto() {
  const filtroAnterior = categoriaAtiva;
  categoriaAtiva = '';
  montarProjetos();
  window.print();
  categoriaAtiva = filtroAnterior;
  montarProjetos();
}

function montarProjetos() {
  const todos = pegarRegistros().sort((a, b) => b.id - a.id);
  const projetos = categoriaAtiva ? todos.filter(p => p.categoria === categoriaAtiva) : todos;

  // números: quantidade de projetos e de tecnologias diferentes
  const tecnologias = new Set(todos.flatMap(p => (p.tecnologias || '').split(',').map(t => t.trim()).filter(Boolean)));
  document.getElementById('pf-numeros').innerHTML = `
    <div><b>${todos.length}</b><span>projetos</span></div>
    <div><b>${tecnologias.size}</b><span>tecnologias</span></div>
    <div><b>${new Set(todos.map(p => p.categoria)).size}</b><span>categorias</span></div>`;

  // botões de filtro por categoria
  const categorias = [...new Set(todos.map(p => p.categoria))];
  document.getElementById('pf-filtros').innerHTML = ['', ...categorias].map(c =>
    `<button class="${c === categoriaAtiva ? 'ativo' : ''}" onclick="categoriaAtiva='${c}'; montarProjetos()">${c || 'Todos'}</button>`
  ).join('');

  document.getElementById('pf-projetos').innerHTML = projetos.length ? projetos.map(p => `
    <section class="projeto" data-portfolio-id="${esc(p.id)}">
      ${imagemDoRegistro(p)}
      <div class="projeto-texto">
        <p class="sobre">${esc(p.categoria)}</p>
        <h2>${esc(p.titulo)}</h2>
        <p>${esc(p.descricao)}</p>
        <div>${etiquetasDoCampo(p, 'tecnologias')}</div>
        <div class="projeto-links">
          ${linkSeguro(p.repositorio) ? `<a href="${esc(p.repositorio)}" target="_blank" rel="noopener">Código ↗</a>` : ''}
          ${linkSeguro(p.demo) ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Ver online ↗</a>` : ''}
        </div>
      </div>
    </section>`).join('')
    : '<p class="vazio">Nenhum projeto ainda. <a href="novo-projeto.html">Cadastre o primeiro!</a></p>';
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarModeloEscolhido();
  montarPerfil();
  montarProjetos();

  const form = document.getElementById('form-perfil');
  document.getElementById('editar-perfil').addEventListener('click', () => {
    const p = pegarPerfil();
    document.getElementById('p-nome').value = p.nome;
    document.getElementById('p-cargo').value = p.cargo;
    document.getElementById('p-bio').value = p.bio;
    document.getElementById('p-contato').value = p.contato;
    document.getElementById('p-hard-skills').value = p.hardSkills || '';
    document.getElementById('p-foto').value = p.foto || '';
    document.getElementById('p-github').value = p.github || '';
    document.getElementById('p-linkedin').value = p.linkedin || '';
    form.hidden = !form.hidden;
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem(CHAVE_PERFIL, JSON.stringify({
      nome: document.getElementById('p-nome').value,
      cargo: document.getElementById('p-cargo').value,
      bio: document.getElementById('p-bio').value,
      contato: document.getElementById('p-contato').value,
      hardSkills: document.getElementById('p-hard-skills').value,
      foto: document.getElementById('p-foto').value,
      github: document.getElementById('p-github').value,
      linkedin: document.getElementById('p-linkedin').value,
    }));
    form.hidden = true;
    montarPerfil();
  });

  document.getElementById('baixar-portfolio-html').addEventListener('click', async evento => {
    const botao = evento.currentTarget;
    botao.disabled = true;
    try {
      await baixarPortfolioHtml();
    } catch (erro) {
      alert(erro.message || 'Não foi possível baixar o arquivo HTML.');
    } finally {
      botao.disabled = false;
    }
  });
});
