// Gera a página do portfólio a partir dos projetos cadastrados
const CHAVE_PERFIL = CONFIG.chave + '_perfil';
let categoriaAtiva = '';

function pegarPerfil() {
  const usuario = usuarioLogado() || { nome: 'Seu nome' };
  return JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {
    nome: usuario.nome,
    cargo: 'Estudante de tecnologia',
    bio: 'Escreva aqui um pouco sobre você, o que gosta de criar e o que está aprendendo.',
    contato: usuario.email || 'seu-email@exemplo.com',
  };
}

function montarPerfil() {
  const p = pegarPerfil();
  document.getElementById('pf-nome').textContent = p.nome;
  document.getElementById('pf-cargo').textContent = p.cargo;
  document.getElementById('pf-bio').textContent = p.bio;
  document.getElementById('pf-contato').textContent = p.contato;
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
    <section class="projeto">
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
  montarPerfil();
  montarProjetos();

  const form = document.getElementById('form-perfil');
  document.getElementById('editar-perfil').addEventListener('click', () => {
    const p = pegarPerfil();
    document.getElementById('p-nome').value = p.nome;
    document.getElementById('p-cargo').value = p.cargo;
    document.getElementById('p-bio').value = p.bio;
    document.getElementById('p-contato').value = p.contato;
    form.hidden = !form.hidden;
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem(CHAVE_PERFIL, JSON.stringify({
      nome: document.getElementById('p-nome').value,
      cargo: document.getElementById('p-cargo').value,
      bio: document.getElementById('p-bio').value,
      contato: document.getElementById('p-contato').value,
    }));
    form.hidden = true;
    montarPerfil();
  });
});