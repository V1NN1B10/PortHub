// =========================================================
// REGISTROS: cadastrar, listar, filtrar, alterar status e excluir
// Os campos de cada registro ficam em js/config.js
// =========================================================

const CHAVE_REGISTROS = CONFIG.chave + '_registros';

function pegarRegistros() {
  return JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) || [];
}

function salvarRegistros(lista) {
  localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(lista));
}

// Evita que texto digitado no formulário quebre o HTML da página
function esc(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Só aceita links que começam com http:// ou https://
function linkSeguro(url) {
  return /^https?:\/\//i.test(url || '');
}

function adicionarRegistro(dados) {
  const lista = pegarRegistros();
  dados.id = Date.now();
  dados.criadoEm = new Date().toISOString();
  dados.autor = usuarioLogado() ? usuarioLogado().nome : 'Anônimo';
  lista.push(dados);
  salvarRegistros(lista);
}

function alterarCampo(id, campo, valor) {
  const lista = pegarRegistros();
  const registro = lista.find(r => r.id === id);
  if (registro) registro[campo] = valor;
  salvarRegistros(lista);
  montarLista();
}

function excluirRegistro(id) {
  if (!confirm('Tem certeza que quer excluir?')) return;
  salvarRegistros(pegarRegistros().filter(r => r.id !== id));
  montarLista();
}

function formatarData(iso) {
  if (!iso) return '-';
  const data = new Date(iso.length === 10 ? iso + 'T00:00' : iso);
  return data.toLocaleDateString('pt-BR');
}

function acharCampo(id) {
  return CONFIG.campos.find(c => c.id === id);
}

function comprimirImagemPortfolio(arquivo, limitePersonalizado = 1400, qualidade = .82) {
  return new Promise((resolve, reject) => {
    const extensaoImagem = /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(arquivo.name || '');
    if (!String(arquivo.type || '').toLowerCase().startsWith('image/') && !extensaoImagem) {
      reject(new Error('Escolha um arquivo de imagem.'));
      return;
    }
    if (arquivo.size > 12 * 1024 * 1024) {
      reject(new Error('A imagem precisa ter menos de 12 MB.'));
      return;
    }

    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();
    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível abrir esta imagem.'));
    };
    imagem.onload = () => {
      const limite = limitePersonalizado;
      const escala = Math.min(1, limite / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.width * escala));
      canvas.height = Math.max(1, Math.round(imagem.height * escala));
      const contexto = canvas.getContext('2d');
      if (!contexto) {
        URL.revokeObjectURL(url);
        reject(new Error('Este navegador não conseguiu preparar a imagem.'));
        return;
      }
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Não foi possível preparar esta imagem.'));
          return;
        }
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error('Não foi possível carregar esta imagem.'));
        leitor.readAsDataURL(blob);
      }, 'image/jpeg', qualidade);
    };
    imagem.src = url;
  });
}

// ---------- Monta o formulário automaticamente ----------
function montarFormulario() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  let html = '';
  CONFIG.campos.forEach(c => {
    const obrig = c.obrigatorio ? 'required' : '';
    let entrada = '';
    if (c.tipo === 'select') {
      entrada = `<select id="${c.id}" ${obrig}>
        <option value="">Selecione...</option>
        ${c.opcoes.map(o => `<option>${o}</option>`).join('')}
      </select>`;
    } else if (c.tipo === 'textarea') {
      entrada = `<textarea id="${c.id}" placeholder="${c.dica || ''}" ${obrig}></textarea>`;
    } else if (form.dataset.wizardForm === 'true' && c.id === CONFIG.campoImagem) {
      entrada = `<input type="${c.tipo}" id="${c.id}" placeholder="Link de imagem ou envie uma captura" ${obrig} ${c.extra || ''}>
        <input class="montar-input-arquivo" type="file" id="${c.id}-arquivo" accept="image/*" data-imagem-upload>
        <label class="montar-upload-imagem" for="${c.id}-arquivo"><span>＋</span><b>Enviar imagem do projeto</b><small data-imagem-nome>JPG, PNG ou WebP · otimizada para a prévia</small></label>`;
    } else {
      entrada = `<input type="${c.tipo}" id="${c.id}" placeholder="${c.dica || ''}" ${obrig} ${c.extra || ''}>`;
    }
    const rotulo = form.dataset.wizardForm === 'true' && c.id === CONFIG.campoImagem
      ? 'Imagem de capa (opcional)'
      : c.rotulo;
    html += `<div class="campo"><label for="${c.id}">${rotulo}</label>${entrada}</div>`;
  });
  html += `<button class="botao" type="submit">Salvar</button>`;
  form.innerHTML = html;

  const uploadImagem = form.querySelector('[data-imagem-upload]');
  if (uploadImagem) {
    uploadImagem.addEventListener('change', async () => {
      const arquivo = uploadImagem.files && uploadImagem.files[0];
      if (!arquivo) return;
      const msg = document.getElementById('mensagem');
      const nome = form.querySelector('[data-imagem-nome]');
      try {
        if (nome) nome.textContent = 'Preparando imagem...';
        const imagem = await comprimirImagemPortfolio(arquivo);
        const campoImagem = document.getElementById(CONFIG.campoImagem);
        campoImagem.value = imagem;
        campoImagem.dispatchEvent(new Event('input', { bubbles: true }));
        if (nome) nome.textContent = `${arquivo.name} · pronta para a prévia`;
        uploadImagem.value = '';
        if (msg) msg.className = 'mensagem';
      } catch (erro) {
        if (nome) nome.textContent = 'JPG, PNG ou WebP · otimizada para a prévia';
        uploadImagem.value = '';
        if (msg) {
          msg.className = 'mensagem erro';
          msg.textContent = erro.message || 'Não foi possível usar esta imagem.';
        }
      }
    });
  }

  // MODO EDIÇÃO: se a página abrir com ?editar=123, carrega o registro no formulário
  const idEditar = Number(new URLSearchParams(location.search).get('editar'));
  const emEdicao = pegarRegistros().find(r => r.id === idEditar);
  if (emEdicao) {
    CONFIG.campos.forEach(c => (document.getElementById(c.id).value = emEdicao[c.id] || ''));
    const titulo = document.querySelector('.caixa-form h1, .montar-projetos-topo h2');
    if (titulo) titulo.textContent = 'Editar projeto';
  }
  window.dispatchEvent(new CustomEvent('porthub:projeto-form-pronto'));

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const dados = {};
    CONFIG.campos.forEach(c => (dados[c.id] = document.getElementById(c.id).value));
    if (emEdicao) {
      // atualiza o registro que já existe
      const lista = pegarRegistros();
      Object.assign(lista.find(r => r.id === idEditar), dados);
      salvarRegistros(lista);
    } else {
      if (CONFIG.campoStatus) dados[CONFIG.campoStatus] = CONFIG.statusOpcoes[0];
      adicionarRegistro(dados);
    }
    const msg = document.getElementById('mensagem');
    msg.className = 'mensagem sucesso';
    msg.textContent = emEdicao ? 'Alterações salvas!' : 'Registro salvo com sucesso!';
    form.reset();
    const nomeImagem = form.querySelector('[data-imagem-nome]');
    if (nomeImagem) nomeImagem.textContent = 'JPG, PNG ou WebP · até 12 MB';
    if (form.dataset.wizardForm === 'true') {
      if (emEdicao) {
        window.location.href = `${CONFIG.paginaNovo}?etapa=2`;
      } else {
        window.dispatchEvent(new CustomEvent('porthub:projeto-salvo'));
      }
      return;
    }
    setTimeout(() => (window.location.href = CONFIG.paginaLista), 1000);
  });
}

// Cadastro compacto disponível diretamente na página "Meus projetos".
function montarFormularioProjetoRapido() {
  const form = document.getElementById('form-projeto-rapido');
  if (!form) return;

  const campoCategoria = acharCampo('categoria');
  const seletorCategoria = form.querySelector('[data-campo-rapido="categoria"]');
  if (seletorCategoria && campoCategoria?.opcoes) {
    seletorCategoria.innerHTML = `<option value="">Selecione uma categoria</option>${campoCategoria.opcoes.map(opcao => `<option value="${esc(opcao)}">${esc(opcao)}</option>`).join('')}`;
  }

  const campoTecnologias = form.querySelector('[data-campo-rapido="tecnologias"]');
  const areaTecnologias = form.querySelector('[data-skills-rapidas]');
  const campoTitulo = form.querySelector('[data-campo-rapido="titulo"]');
  const campoImagem = form.querySelector(`[data-campo-rapido="${CONFIG.campoImagem}"]`);
  const arquivoImagem = form.querySelector('[data-imagem-rapida]');
  const imagemPreview = form.querySelector('[data-capa-rapida-imagem]');
  const capaPlaceholder = form.querySelector('[data-capa-rapida-placeholder]');
  const capaTitulo = form.querySelector('[data-capa-rapida-titulo]');
  const mensagem = form.querySelector('[data-mensagem-rapida]');

  function desenharSkills() {
    if (!areaTecnologias) return;
    const skills = String(campoTecnologias?.value || '').split(',').map(item => item.trim()).filter(Boolean);
    areaTecnologias.innerHTML = skills.length
      ? skills.map((skill, indice) => `<span class="tecnologia-chip tecnologia-cor-${indice % 3}">${esc(skill)}</span>`).join('')
      : '<span class="skills-rapidas-dica">As skills aparecem como etiquetas coloridas.</span>';
  }

  function desenharCapa() {
    if (!imagemPreview || !campoImagem) return;
    const origem = String(campoImagem.value || '').trim();
    const permitida = origem && !/^(javascript|vbscript):/i.test(origem) && !/^\/\//.test(origem)
      && (!/^[a-z][a-z0-9+.-]*:/i.test(origem) || /^https?:\/\//i.test(origem) || /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(origem));
    if (permitida) {
      imagemPreview.src = origem;
      imagemPreview.hidden = false;
      if (capaPlaceholder) capaPlaceholder.hidden = true;
      imagemPreview.onerror = () => {
        imagemPreview.hidden = true;
        if (capaPlaceholder) capaPlaceholder.hidden = false;
      };
    } else {
      imagemPreview.removeAttribute('src');
      imagemPreview.hidden = true;
      if (capaPlaceholder) capaPlaceholder.hidden = false;
    }
    if (capaTitulo) capaTitulo.textContent = campoTitulo?.value.trim() || 'Seu projeto';
  }

  campoTecnologias?.addEventListener('input', desenharSkills);
  campoTitulo?.addEventListener('input', desenharCapa);
  campoImagem?.addEventListener('input', desenharCapa);
  form.querySelector('[data-campo-rapido="categoria"]')?.addEventListener('change', desenharCapa);
  desenharSkills();
  desenharCapa();

  arquivoImagem?.addEventListener('change', async () => {
    const arquivo = arquivoImagem.files && arquivoImagem.files[0];
    if (!arquivo) return;
    const nome = form.querySelector('[data-imagem-rapida-nome]');
    try {
      if (nome) nome.textContent = 'Preparando imagem...';
      campoImagem.value = await comprimirImagemPortfolio(arquivo);
      campoImagem.dispatchEvent(new Event('input', { bubbles: true }));
      if (nome) nome.textContent = `${arquivo.name} · pronta para a capa`;
    } catch (erro) {
      if (nome) nome.textContent = 'JPG, PNG ou WebP · até 12 MB';
      if (mensagem) {
        mensagem.className = 'mensagem erro';
        mensagem.textContent = erro.message || 'Não foi possível usar esta imagem.';
      }
    } finally {
      arquivoImagem.value = '';
    }
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const dados = {};
    CONFIG.campos.forEach(campo => {
      const entrada = form.querySelector(`[data-campo-rapido="${campo.id}"]`);
      dados[campo.id] = entrada ? entrada.value.trim() : '';
    });
    if (CONFIG.campoStatus) dados[CONFIG.campoStatus] = CONFIG.statusOpcoes[0];
    adicionarRegistro(dados);
    montarLista();
    form.reset();
    if (mensagem) {
      mensagem.className = 'mensagem sucesso';
      mensagem.textContent = 'Projeto adicionado à sua lista.';
    }
    const nomeImagem = form.querySelector('[data-imagem-rapida-nome]');
    if (nomeImagem) nomeImagem.textContent = 'JPG, PNG ou WebP · até 12 MB';
    desenharSkills();
    desenharCapa();
  });
}

// ---------- Monta os filtros ----------
function montarFiltros() {
  const area = document.getElementById('filtros');
  if (!area) return;
  let html = `<input type="search" id="busca" placeholder="Buscar...">`;
  CONFIG.filtros.forEach(idCampo => {
    const campo = acharCampo(idCampo);
    const ehStatus = idCampo === CONFIG.campoStatus;
    // se o campo não tiver opções fixas, usa os valores já cadastrados
    const opcoes = ehStatus
      ? CONFIG.statusOpcoes
      : campo.opcoes || [...new Set(pegarRegistros().map(r => r[idCampo]).filter(Boolean))].sort();
    const rotulo = ehStatus ? CONFIG.rotuloStatus : campo.rotulo;
    html += `<select data-filtro="${idCampo}">
      <option value="">${rotulo}: todos</option>
      ${opcoes.map(o => `<option>${o}</option>`).join('')}
    </select>`;
  });
  area.innerHTML = html;
  area.querySelectorAll('select, input').forEach(el => el.addEventListener('input', montarLista));

  // permite abrir a página já filtrada: ocorrencias.html?categoria=Lixo
  const parametros = new URLSearchParams(location.search);
  area.querySelectorAll('[data-filtro]').forEach(sel => {
    const valor = parametros.get(sel.dataset.filtro);
    if (valor) sel.value = valor;
  });
}

// ---------- Aplica filtros e busca ----------
function registrosFiltrados() {
  let lista = pegarRegistros();
  document.querySelectorAll('[data-filtro]').forEach(sel => {
    if (sel.value) lista = lista.filter(r => r[sel.dataset.filtro] === sel.value);
  });
  const busca = document.getElementById('busca');
  if (busca && busca.value) {
    const termo = busca.value.toLowerCase();
    lista = lista.filter(r => JSON.stringify(r).toLowerCase().includes(termo));
  }
  return lista.sort((a, b) => b.id - a.id); // mais novos primeiro
}

function seletorStatus(r) {
  if (!CONFIG.campoStatus) return '';
  return `<select class="seletor-status" onchange="alterarCampo(${r.id}, '${CONFIG.campoStatus}', this.value)">
    ${CONFIG.statusOpcoes.map(s => `<option ${s === r[CONFIG.campoStatus] ? 'selected' : ''}>${s}</option>`).join('')}
  </select>`;
}

function botaoEditar(r) {
  if (!CONFIG.permitirEditar) return '';
  return `<a class="botao botao-contorno botao-pequeno" href="${CONFIG.paginaNovo}?editar=${r.id}">Editar</a>`;
}

// Campos com "separarPorVirgula": "HTML, CSS, JS" vira três etiquetas
function etiquetasDoCampo(r, id) {
  const campo = acharCampo(id);
  if (!r[id]) return '';
  const valores = campo && campo.separarPorVirgula ? r[id].split(',') : [r[id]];
  return valores.map((v, indice) => {
    const cor = id === 'tecnologias' ? ` tecnologia-cor-${indice % 3}` : '';
    return `<span class="etiqueta${cor}">${esc(v.trim())}</span>`;
  }).join('');
}

function imagemDoRegistro(r) {
  if (!CONFIG.campoImagem) return '';
  return r[CONFIG.campoImagem]
    ? `<img class="registro-imagem" src="${esc(r[CONFIG.campoImagem])}" alt="${esc(r[CONFIG.campoTitulo])}">`
    : `<div class="registro-imagem sem-imagem portfolio-capa-default" data-categoria="${esc(r.categoria || 'Projeto')}" aria-label="Capa visual para ${esc(r[CONFIG.campoTitulo] || 'projeto')}" role="img"><span>${esc(r.categoria || 'Projeto')}</span><strong>${esc(r[CONFIG.campoTitulo] || 'Seu projeto')}</strong><i></i></div>`;
}

function botaoExcluir(r) {
  return `<button class="botao botao-perigo botao-pequeno" onclick="excluirRegistro(${r.id})">Excluir</button>`;
}

// ---------- Um card de registro ----------
function cardRegistro(r) {
  const etiquetas = CONFIG.camposEtiqueta.map(c => etiquetasDoCampo(r, c)).join('');
  const detalhes = CONFIG.camposDetalhe.map(id => {
    const campo = acharCampo(id);
    let valor = esc(r[id]);
    if (campo.tipo === 'date') valor = formatarData(r[id]);
    if (campo.tipo === 'url' && linkSeguro(r[id])) valor = `<a href="${valor}" target="_blank" rel="noopener">abrir link</a>`;
    return valor ? `<div class="info"><strong>${campo.rotulo}:</strong> ${valor}</div>` : '';
  }).join('');
  const destaque = CONFIG.campoDestaque ? r[CONFIG.campoDestaque] : '';

  return `<article class="registro" data-destaque="${esc(destaque)}">
    ${imagemDoRegistro(r)}
    <div class="registro-topo">${etiquetas}</div>
    <h3>${esc(r[CONFIG.campoTitulo])}</h3>
    ${detalhes}
    <div class="info autor">Por ${esc(r.autor)} em ${formatarData(r.criadoEm)}</div>
    <div class="acoes">${seletorStatus(r)} ${botaoEditar(r)} ${botaoExcluir(r)}</div>
  </article>`;
}

// ---------- Modos de exibição (escolhidos em CONFIG.modoLista) ----------
function listaEmTabela(lista) {
  const colunas = [CONFIG.campoTitulo, ...CONFIG.camposEtiqueta, ...CONFIG.camposDetalhe.filter(c => acharCampo(c).tipo !== 'textarea')];
  return `<div class="tabela-rolagem"><table class="tabela">
    <thead><tr>
      ${colunas.map(c => `<th>${acharCampo(c).rotulo}</th>`).join('')}
      ${CONFIG.campoStatus ? `<th>${CONFIG.rotuloStatus}</th>` : ''}<th></th>
    </tr></thead>
    <tbody>
      ${lista.map(r => `<tr>
        ${colunas.map(c => {
          let v = r[c] || '-';
          if (acharCampo(c).tipo === 'date') v = formatarData(r[c]);
          if (acharCampo(c).tipo === 'url' && r[c]) v = `<a href="${r[c]}" target="_blank">abrir</a>`;
          return `<td>${v}</td>`;
        }).join('')}
        ${CONFIG.campoStatus ? `<td>${seletorStatus(r)}</td>` : ''}
        <td>${botaoEditar(r)} ${botaoExcluir(r)}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

function listaPorDia(lista) {
  const dias = [...new Set(lista.map(r => r[CONFIG.campoDia]))].sort().reverse();
  return dias.map(dia => {
    const doDia = lista.filter(r => r[CONFIG.campoDia] === dia);
    const soma = CONFIG.campoSoma ? doDia.reduce((s, r) => s + Number(r[CONFIG.campoSoma]), 0) : doDia.length;
    return `<section class="grupo-dia">
      <h2>${formatarData(dia)} <span>${soma} ${CONFIG.unidadeSoma || 'registros'}</span></h2>
      <div class="lista-dia">${doDia.map(cardRegistro).join('')}</div>
    </section>`;
  }).join('');
}

// ---------- Monta a lista ----------
function cartaoPortfolioConcluido() {
  let conclusao;
  let perfil = {};
  try {
    conclusao = JSON.parse(localStorage.getItem(`${CONFIG.chave}_concluido`) || 'null');
    perfil = JSON.parse(localStorage.getItem(`${CONFIG.chave}_perfil`) || '{}') || {};
  } catch (erro) {
    return null;
  }
  if (!conclusao || !conclusao.concluido) return null;

  const modelos = { aurora: 'Aurora', lume: 'Lume', noite: 'Noite' };
  const layouts = { profissional: 'Profissional', academico: 'Acadêmico', tech: 'Tech' };
  const modelo = modelos[conclusao.modelo] || modelos.aurora;
  const layout = layouts[conclusao.layout] || layouts.profissional;
  const nome = String(perfil.nome || '').trim();
  const card = document.createElement('article');
  card.className = 'registro portfolio-projeto-finalizado';
  card.id = 'portfolio-concluido';

  const capa = document.createElement('div');
  capa.className = 'portfolio-projeto-finalizado-capa';
  const foto = String(perfil.foto || '').trim();
  const fotoPermitida = /^https?:\/\//i.test(foto)
    || /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(foto)
    || (foto && !/^[a-z][a-z0-9+.-]*:/i.test(foto) && !/^\/\//.test(foto));
  const avatar = () => {
    const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase() || 'PH';
    const bloco = document.createElement('span');
    bloco.className = 'portfolio-projeto-finalizado-avatar';
    bloco.textContent = iniciais;
    return bloco;
  };
  if (fotoPermitida) {
    const imagem = document.createElement('img');
    imagem.src = foto;
    imagem.alt = nome ? `Foto de ${nome}` : 'Foto do perfil';
    imagem.addEventListener('error', () => imagem.replaceWith(avatar()), { once: true });
    capa.appendChild(imagem);
  } else {
    capa.appendChild(avatar());
  }

  const conteudo = document.createElement('div');
  conteudo.className = 'portfolio-projeto-finalizado-conteudo';
  const selo = document.createElement('span');
  selo.className = 'portfolio-projeto-finalizado-selo';
  selo.textContent = '✓ Projeto concluído';
  const titulo = document.createElement('h3');
  titulo.textContent = nome ? `Portfólio de ${nome}` : 'Meu portfólio';
  const resumo = document.createElement('p');
  resumo.textContent = `${perfil.cargo || 'Perfil profissional'} · Formato ${layout} · Paleta ${modelo}`;
  const data = document.createElement('small');
  const instante = new Date(conclusao.finalizadoEm || '');
  data.textContent = Number.isNaN(instante.getTime()) ? 'Salvo no seu PortHub' : `Finalizado em ${instante.toLocaleDateString('pt-BR')}`;
  const acoes = document.createElement('div');
  acoes.className = 'portfolio-projeto-finalizado-acoes';
  acoes.innerHTML = '<a class="botao" href="portfolio.html">Ver portfólio</a><a class="botao botao-contorno" href="novo-projeto.html?etapa=3">Editar</a>';
  const excluir = document.createElement('button');
  excluir.type = 'button';
  excluir.className = 'botao botao-perigo';
  excluir.textContent = 'Excluir';
  excluir.addEventListener('click', () => {
    const confirmou = window.confirm('Excluir o portfólio salvo? O perfil e o modelo serão removidos, mas os projetos cadastrados serão mantidos.');
    if (!confirmou) return;
    ['_concluido', '_perfil', '_modelo', '_layout'].forEach(sufixo => localStorage.removeItem(`${CONFIG.chave}${sufixo}`));
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    montarLista();
  });
  acoes.appendChild(excluir);
  conteudo.append(selo, titulo, resumo, data, acoes);
  card.append(capa, conteudo);
  return card;
}

function montarLista() {
  const area = document.getElementById('lista');
  if (!area) return;
  const lista = registrosFiltrados();
  const portfolioConcluido = cartaoPortfolioConcluido();

  if (lista.length === 0) {
    area.innerHTML = portfolioConcluido ? '' : `<div class="vazio">Nada por aqui ainda. <a href="${CONFIG.paginaNovo}">Cadastre o primeiro!</a></div>`;
  } else if (CONFIG.modoLista === 'tabela') area.innerHTML = listaEmTabela(lista);
  else if (CONFIG.modoLista === 'dias') area.innerHTML = listaPorDia(lista);
  else area.innerHTML = lista.map(cardRegistro).join('');

  if (portfolioConcluido) {
    area.prepend(portfolioConcluido);
    if (window.location.hash === '#portfolio-concluido') {
      requestAnimationFrame(() => portfolioConcluido.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  montarFormulario();
  montarFormularioProjetoRapido();
  montarFiltros();
  montarLista();
});
