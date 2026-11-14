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

  function linkSeguro(url) {
    return /^https?:\/\//i.test(String(url || '').trim());
  }

  function normalizarUrl(url) {
    const valor = String(url || '').trim();
    if (!valor || /^https?:\/\//i.test(valor) || /^[a-z][a-z0-9+.-]*:/i.test(valor)) return valor;
    return /^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:[/?#].*)?$/i.test(valor) ? `https://${valor}` : valor;
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

  function projetoEmEdicao() {
    const form = wizard.querySelector('#form-registro');
    if (!form || !form.elements.length) return null;
    const dados = {};
    CONFIG.campos.forEach(campo => {
      const entrada = form.querySelector(`#${campo.id}`);
      if (entrada) dados[campo.id] = entrada.value.trim();
    });
    const titulo = dados[CONFIG.campoTitulo];
    if (!titulo) return null;
    const idEditar = Number(new URLSearchParams(window.location.search).get('editar'));
    return { ...dados, id: idEditar || 'rascunho', autor: '', criadoEm: '' };
  }

  function projetosParaPreview() {
    const projetos = lerProjetos();
    const rascunho = projetoEmEdicao();
    if (!rascunho) return projetos;
    const editarId = String(rascunho.id);
    const semProjetoAtual = projetos.filter(projeto => String(projeto.id) !== editarId);
    return [rascunho, ...semProjetoAtual];
  }

  function atualizarPreview() {
    const preview = wizard.querySelector('[data-preview-portfolio]');
    if (!preview) return;

    const perfil = lerPerfil();
    wizard.querySelectorAll('[data-perfil]').forEach(campo => {
      perfil[campo.dataset.perfil] = campo.value.trim();
    });
    const nome = perfil.nome || 'Seu Nome';
    const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase() || 'SN';
    const valorOu = (valor, padrao) => valor || padrao;
    const texto = (seletor, valor, padrao = '') => {
      const elemento = preview.querySelector(seletor);
      if (elemento) elemento.textContent = valorOu(valor, padrao);
    };

    texto('[data-preview-nome]', nome, 'Seu Nome');
    texto('[data-preview-iniciais]', iniciais, 'SN');
    texto('[data-preview-cargo]', perfil.cargo, 'Seu título profissional');
    texto('[data-preview-localizacao]', perfil.localizacao, 'Adicione sua cidade ou região');
    texto('[data-preview-bio]', perfil.bio, 'Uma apresentação curta sobre você, suas ideias e o que gosta de construir.');
    texto('[data-preview-contato]', perfil.contato, 'voce@email.com');
    texto('[data-preview-objetivo]', perfil.objetivo, 'Conte que tipo de oportunidade você está buscando.');

    const foto = imagemSegura(perfil.foto);
    const fotoElemento = preview.querySelector('[data-preview-foto]');
    const avatar = preview.querySelector('[data-preview-iniciais]');
    if (foto && fotoElemento) {
      fotoElemento.src = foto;
      fotoElemento.hidden = false;
      if (avatar) avatar.hidden = true;
      fotoElemento.onerror = () => { fotoElemento.hidden = true; if (avatar) avatar.hidden = false; };
    } else if (fotoElemento) {
      fotoElemento.removeAttribute('src');
      fotoElemento.hidden = true;
      if (avatar) avatar.hidden = false;
    }

    const objetivo = preview.querySelector('[data-preview-objetivo-bloco]');
    if (objetivo) objetivo.classList.toggle('tem-conteudo', Boolean(perfil.objetivo));

    const habilidades = (valor, placeholder) => {
      const itens = String(valor || '').split(',').map(item => item.trim()).filter(Boolean);
      return itens.length
        ? itens.map(item => `<span class="etiqueta">${escapar(item)}</span>`).join('')
        : `<span class="montar-preview-dica">${placeholder}</span>`;
    };
    const hard = preview.querySelector('[data-preview-hard-skills]');
    const soft = preview.querySelector('[data-preview-soft-skills]');
    if (hard) hard.innerHTML = habilidades(perfil.hardSkills, 'Inclua suas tecnologias');
    if (soft) soft.innerHTML = habilidades(perfil.softSkills, 'Inclua suas habilidades');
    const softBloco = preview.querySelector('[data-preview-soft-bloco]');
    if (softBloco) softBloco.classList.toggle('tem-conteudo', Boolean(perfil.softSkills));

    const redes = [
      { nome: 'GitHub', url: normalizarUrl(perfil.github) },
      { nome: 'LinkedIn', url: normalizarUrl(perfil.linkedin) },
      { nome: 'Site', url: normalizarUrl(perfil.website) },
    ].filter(item => linkSeguro(item.url));
    const redesEl = preview.querySelector('[data-preview-redes]');
    if (redesEl) redesEl.innerHTML = redes.map(item => `<a href="${escapar(item.url)}" target="_blank" rel="noopener">${item.nome} ↗</a>`).join('');

    const projetos = projetosParaPreview();
    const tecnologias = new Set(projetos.flatMap(projeto => (Array.isArray(projeto.tecnologias) ? projeto.tecnologias : String(projeto.tecnologias || '').split(',')).map(item => String(item).trim()).filter(Boolean)));
    const categorias = new Set(projetos.map(projeto => projeto.categoria).filter(Boolean));
    const numeros = preview.querySelector('[data-preview-numeros]');
    if (numeros) numeros.innerHTML = `<div><b>${projetos.length}</b><span>projetos</span></div><div><b>${tecnologias.size}</b><span>tecnologias</span></div><div><b>${categorias.size}</b><span>categorias</span></div>`;
    const totalProjetos = preview.querySelector('[data-preview-projeto-count]');
    if (totalProjetos) totalProjetos.textContent = projetos.length ? `${projetos.length} ${projetos.length === 1 ? 'projeto' : 'projetos'}` : 'Adicione seu primeiro';
    const filtros = preview.querySelector('[data-preview-filtros]');
    if (filtros) {
      const nomes = ['Todos', ...[...categorias].slice(0, 3)];
      if (nomes.length === 1) nomes.push('Front-end', 'Mobile', 'Dados');
      filtros.innerHTML = nomes.map((nome, indice) => `<span class="montar-preview-filtro${indice === 0 ? ' ativo' : ''}">${escapar(nome)}</span>`).join('');
    }

    const projetosEl = preview.querySelector('[data-preview-projetos]');
    if (!projetosEl) return;
    if (!projetos.length) {
      projetosEl.innerHTML = `<div class="montar-preview-vazio"><div class="montar-preview-capa"><span>SEU PRÓXIMO PROJETO</span><b>01</b><i></i></div><div><span>Seu espaço de destaque</span><h3>Seu primeiro projeto</h3><p>Cadastre um projeto para vê-lo aparecer aqui com imagem, tecnologias e links.</p><small>Projeto · suas tecnologias</small></div></div>`;
      return;
    }

    projetosEl.innerHTML = projetos.slice(0, 4).map((projeto, indice) => {
      const titulo = projeto[CONFIG.campoTitulo] || 'Projeto sem título';
      const imagem = imagemSegura(projeto[CONFIG.campoImagem]);
      const categoria = projeto.categoria || 'Projeto';
      const capa = imagem
        ? `<img class="registro-imagem" src="${escapar(imagem)}" alt="Imagem de ${escapar(titulo)}" data-capa-categoria="${escapar(categoria)}" data-capa-titulo="${escapar(titulo)}" data-capa-indice="${indice % 4}">`
        : `<div class="registro-imagem sem-imagem montar-preview-capa montar-capa-${indice % 4}"><span>${escapar(categoria)}</span><b>${String(indice + 1).padStart(2, '0')}</b><i></i></div>`;
      const skills = (Array.isArray(projeto.tecnologias) ? projeto.tecnologias : String(projeto.tecnologias || '').split(',')).map(item => String(item).trim()).filter(Boolean).slice(0, 4);
      return `<section class="projeto montar-preview-projeto">${capa}<div class="projeto-texto"><p class="sobre">${escapar(categoria)}</p><h2>${escapar(titulo)}</h2><p>${escapar(projeto.descricao || 'Conte o que este projeto faz e como você o construiu.')}</p><div class="montar-preview-tags">${skills.map(skill => `<span class="etiqueta">${escapar(skill)}</span>`).join('') || '<span class="etiqueta">Adicione tecnologias</span>'}</div><div class="projeto-links">${linkSeguro(projeto.repositorio) ? '<span>Código ↗</span>' : ''}${linkSeguro(projeto.demo) ? '<span>Ver projeto ↗</span>' : ''}</div></div></section>`;
    }).join('');

    projetosEl.querySelectorAll('img[data-capa-titulo]').forEach(imagem => {
      imagem.addEventListener('error', () => {
        const capa = document.createElement('div');
        capa.className = `registro-imagem sem-imagem montar-preview-capa montar-capa-${imagem.dataset.capaIndice || 0}`;
        const categoria = document.createElement('span');
        categoria.textContent = imagem.dataset.capaCategoria || 'Projeto';
        const numero = document.createElement('b');
        numero.textContent = String(Number(imagem.dataset.capaIndice || 0) + 1).padStart(2, '0');
        const detalhe = document.createElement('i');
        capa.append(categoria, numero, detalhe);
        imagem.replaceWith(capa);
      }, { once: true });
    });
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
      const categoria = projeto.categoria || 'Projeto';
      const miniatura = imagem
        ? `<img src="${escapar(imagem)}" alt="Prévia de ${escapar(titulo)}" data-imagem-projeto data-capa-categoria="${escapar(categoria)}" data-capa-titulo="${escapar(titulo)}">`
        : `<div class="montar-projeto-sem-imagem" data-categoria="${escapar(categoria)}" aria-hidden="true"><span>${escapar(categoria)}</span><strong>${escapar(titulo)}</strong><i></i></div>`;
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
        placeholder.dataset.categoria = imagem.dataset.capaCategoria || 'Projeto';
        placeholder.setAttribute('aria-hidden', 'true');
        const categoria = document.createElement('span');
        categoria.textContent = imagem.dataset.capaCategoria || 'Projeto';
        const titulo = document.createElement('strong');
        titulo.textContent = imagem.dataset.capaTitulo || 'Seu projeto';
        const detalhe = document.createElement('i');
        placeholder.append(categoria, titulo, detalhe);
        imagem.replaceWith(placeholder);
      }, { once: true });
    });
  }

  function atualizarModelo() {
    const valor = localStorage.getItem(chaveModelo);
    const nome = modelos[valor] || modelos.aurora;
    const modelo = modelos[valor] ? valor : 'aurora';
    wizard.querySelectorAll('[data-modelo-atual]').forEach(elemento => {
      elemento.textContent = nome;
    });
    const preview = wizard.querySelector('[data-preview-portfolio]');
    if (preview) {
      Object.keys(modelos).forEach(chave => preview.classList.remove(`modelo-${chave}`));
      preview.classList.add(`modelo-${modelo}`);
    }
    wizard.querySelectorAll('[data-escolher-modelo]').forEach(botao => {
      botao.setAttribute('aria-pressed', String(botao.dataset.escolherModelo === modelo));
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
    atualizarPreview();
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

  wizard.addEventListener('input', evento => {
    if (evento.target.matches('[data-perfil]')) salvarPerfil();
    atualizarPreview();
  });
  wizard.addEventListener('change', atualizarPreview);
  wizard.addEventListener('click', evento => {
    const botaoModelo = evento.target.closest('[data-escolher-modelo]');
    if (!botaoModelo) return;
    const modelo = botaoModelo.dataset.escolherModelo;
    if (!modelos[modelo]) return;
    localStorage.setItem(chaveModelo, modelo);
    atualizarModelo();
  });

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
    atualizarPreview();
    const mensagem = wizard.querySelector('#mensagem');
    if (mensagem) {
      mensagem.className = 'mensagem sucesso';
      mensagem.textContent = 'Projeto salvo com sucesso!';
    }
  });
  window.addEventListener('porthub:projeto-form-pronto', atualizarPreview);
  window.addEventListener('porthub:modelo-alterado', () => {
    atualizarModelo();
    atualizarPreview();
  });
  window.addEventListener('storage', evento => {
    if (evento.key === chaveProjetos || evento.key === chavePerfil || evento.key === chaveModelo) {
      preencherPerfil();
      renderizarProjetos();
      atualizarModelo();
      atualizarPreview();
    }
  });

  preencherPerfil();
  renderizarProjetos();
  atualizarModelo();
  atualizarPreview();
  const parametros = new URLSearchParams(window.location.search);
  irParaEtapa(parametros.has('editar') || parametros.get('etapa') === '2' ? 2 : 1);
})();
