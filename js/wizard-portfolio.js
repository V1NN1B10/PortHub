// Controla as etapas de perfil, projetos e visualização do PortHub.
(() => {
  const wizard = document.querySelector('[data-montar-wizard]');
  if (!wizard || typeof CONFIG === 'undefined') return;

  const chavePerfil = `${CONFIG.chave}_perfil`;
  const chaveProjetos = `${CONFIG.chave}_registros`;
  const chaveModelo = `${CONFIG.chave}_modelo`;
  const chaveLayout = `${CONFIG.chave}_layout`;
  const chaveConclusao = `${CONFIG.chave}_concluido`;
  const chaveNovoVazio = `${CONFIG.chave}_novo_vazio`;
  const modelos = { aurora: 'Aurora', lume: 'Lume', noite: 'Noite' };
  const layouts = {
    profissional: 'Perfil profissional',
    academico: 'Perfil acadêmico',
    tech: 'Portfólio tech',
  };
  const contexto = wizard.dataset.contexto;
  const listaProjetos = wizard.querySelector('[data-lista-projetos]');
  const botoesEtapa = [...wizard.querySelectorAll('[data-etapa]')];
  const paineis = [...wizard.querySelectorAll('[data-painel]')];

  if (
    contexto === 'novo-projeto' &&
    new URLSearchParams(window.location.search).get('novo') === '1'
  ) {
    sessionStorage.setItem(chaveNovoVazio, '1');
  }

  function escapar(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    if (
      !perfil.nome &&
      sessionStorage.getItem(chaveNovoVazio) !== '1' &&
      typeof usuarioLogado === 'function'
    ) {
      const usuario = usuarioLogado();
      if (usuario && usuario.nome) perfil.nome = usuario.nome;
    }
    return perfil;
  }

  function preencherPerfil() {
    const perfil = lerPerfil();
    wizard.querySelectorAll('[data-perfil]').forEach((campo) => {
      campo.value = perfil[campo.dataset.perfil] || '';
    });
    atualizarFotoPerfil();
  }

  function salvarPerfil() {
    const perfil = lerJSON(chavePerfil, {});
    wizard.querySelectorAll('[data-perfil]').forEach((campo) => {
      perfil[campo.dataset.perfil] = campo.value.trim();
    });
    localStorage.setItem(chavePerfil, JSON.stringify(perfil));
    if (perfil.nome) sessionStorage.removeItem(chaveNovoVazio);
  }

  function atualizarFotoPerfil(nomeArquivo) {
    const foto = wizard.querySelector('[data-perfil="foto"]');
    const area = wizard.querySelector('[data-perfil-foto-area]');
    const imagem = wizard.querySelector('[data-perfil-foto-preview]');
    const nome = wizard.querySelector('[data-perfil-foto-nome]');
    const remover = wizard.querySelector('[data-remover-perfil-foto]');
    if (!foto || !area || !imagem) return;
    const origem = imagemSegura(foto.value);
    if (origem) {
      imagem.src = origem;
      imagem.hidden = false;
      area.hidden = false;
      if (nome) nome.textContent = nomeArquivo || 'Foto selecionada · clique para trocar';
      if (remover) remover.disabled = false;
    } else {
      imagem.removeAttribute('src');
      imagem.hidden = true;
      area.hidden = true;
      if (nome) nome.textContent = 'JPG, PNG ou WebP · até 12 MB';
      if (remover) remover.disabled = true;
    }
  }

  function linkSeguro(endereco) {
    return /^https?:\/\//i.test(String(endereco || '').trim());
  }

  function normalizarUrl(endereco) {
    const valor = String(endereco || '').trim();
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

  function prepararFotoPerfil(arquivo) {
    if (typeof comprimirImagemPortfolio === 'function') {
      return comprimirImagemPortfolio(arquivo, 800, 0.76);
    }
    return new Promise((resolve, reject) => {
      const extensaoImagem = /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(arquivo.name || '');
      if (
        !String(arquivo.type || '')
          .toLowerCase()
          .startsWith('image/') &&
        !extensaoImagem
      ) {
        reject(new Error('Escolha um arquivo de imagem.'));
        return;
      }
      if (arquivo.size > 12 * 1024 * 1024) {
        reject(new Error('A imagem precisa ter menos de 12 MB.'));
        return;
      }

      const origem = URL.createObjectURL(arquivo);
      const foto = new Image();
      foto.onerror = () => {
        URL.revokeObjectURL(origem);
        reject(new Error('Não foi possível abrir esta imagem.'));
      };
      foto.onload = () => {
        const escala = Math.min(1, 800 / Math.max(foto.width, foto.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(foto.width * escala));
        canvas.height = Math.max(1, Math.round(foto.height * escala));
        const contexto = canvas.getContext('2d');
        if (!contexto) {
          URL.revokeObjectURL(origem);
          reject(new Error('Este navegador não conseguiu preparar a imagem.'));
          return;
        }
        contexto.fillStyle = '#fff';
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.drawImage(foto, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(origem);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Não foi possível preparar esta imagem.'));
              return;
            }
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = () => reject(new Error('Não foi possível carregar esta imagem.'));
            leitor.readAsDataURL(blob);
          },
          'image/jpeg',
          0.76,
        );
      };
      foto.src = origem;
    });
  }

  function lerProjetos() {
    const projetos = lerJSON(chaveProjetos, []);
    return Array.isArray(projetos) ? projetos.sort((a, b) => Number(b.id) - Number(a.id)) : [];
  }

  function projetoEmEdicao() {
    const form = wizard.querySelector('#form-registro');
    if (!form || !form.elements.length) return null;
    const dados = {};
    CONFIG.campos.forEach((campo) => {
      const entrada = form.querySelector(`#${campo.id}`);
      if (entrada) dados[campo.id] = entrada.value.trim();
    });
    const titulo = dados[CONFIG.campoTitulo];
    if (!titulo) return null;
    const idEditar = Number(new URLSearchParams(window.location.search).get('editar'));
    return { ...dados, id: idEditar || 'rascunho', autor: '', criadoEm: '' };
  }

  function projetosParaPreview() {
    if (contexto === 'inicio') return [];
    const projetos = lerProjetos();
    const rascunho = projetoEmEdicao();
    if (!rascunho) return projetos;
    const editarId = String(rascunho.id);
    const semProjetoAtual = projetos.filter((projeto) => String(projeto.id) !== editarId);
    return [rascunho, ...semProjetoAtual];
  }

  function montarCartaoProjetoPreview(projeto, indice) {
    const titulo = projeto[CONFIG.campoTitulo] || 'Projeto sem título';
    const imagem = imagemSegura(projeto[CONFIG.campoImagem]);
    const categoria = projeto.categoria || 'Projeto';
    const capa = imagem
      ? `<img
          class="registro-imagem"
          src="${escapar(imagem)}"
          alt="Imagem de ${escapar(titulo)}"
          data-capa-categoria="${escapar(categoria)}"
          data-capa-titulo="${escapar(titulo)}"
          data-capa-indice="${indice % 4}"
        >`
      : `<div class="registro-imagem sem-imagem montar-preview-capa montar-capa-${indice % 4}">
          <span>${escapar(categoria)}</span>
          <b>${String(indice + 1).padStart(2, '0')}</b>
          <i></i>
        </div>`;
    const habilidades = (
      Array.isArray(projeto.tecnologias)
        ? projeto.tecnologias
        : String(projeto.tecnologias || '').split(',')
    )
      .map((habilidade) => String(habilidade).trim())
      .filter(Boolean)
      .slice(0, 4);
    const etiquetasHabilidades = habilidades
      .map(
        (habilidade, indiceHabilidade) =>
          `<span class="etiqueta tecnologia-cor-${indiceHabilidade % 3}">${escapar(habilidade)}</span>`,
      )
      .join('');
    const linksProjeto = [
      { texto: 'Código ↗', endereco: projeto.repositorio },
      { texto: 'LinkedIn ↗', endereco: projeto.linkedin },
      { texto: 'Ver projeto ↗', endereco: projeto.demo },
    ]
      .filter((link) => linkSeguro(link.endereco))
      .map(
        (link) =>
          `<a href="${escapar(link.endereco)}" target="_blank" rel="noopener">${link.texto}</a>`,
      )
      .join('');

    return `<section class="projeto montar-preview-projeto">
      ${capa}
      <div class="projeto-texto">
        <p class="sobre">${escapar(categoria)}</p>
        <h2>${escapar(titulo)}</h2>
        <p>${escapar(projeto.descricao || 'Conte o que este projeto faz e como você o construiu.')}</p>
        <div class="projeto-tecnologias montar-preview-tags">
          ${etiquetasHabilidades || '<span class="etiqueta">Adicione tecnologias</span>'}
        </div>
        <div class="projeto-links">${linksProjeto}</div>
      </div>
    </section>`;
  }

  function atualizarPrevia() {
    const areaPrevia = wizard.querySelector('[data-preview-portfolio]');
    if (!areaPrevia) return;

    const perfil = lerPerfil();
    wizard.querySelectorAll('[data-perfil]').forEach((campo) => {
      perfil[campo.dataset.perfil] = campo.value.trim();
    });
    const nome = perfil.nome || 'Seu Nome';
    const iniciais =
      nome
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase() || 'SN';
    const valorOu = (valor, padrao) => valor || padrao;
    const texto = (seletor, valor, padrao = '') => {
      const elemento = areaPrevia.querySelector(seletor);
      if (elemento) elemento.textContent = valorOu(valor, padrao);
    };

    texto('[data-preview-nome]', nome, 'Seu Nome');
    texto('[data-preview-iniciais]', iniciais, 'SN');
    texto('[data-preview-cargo]', perfil.cargo, 'Seu título profissional');
    texto('[data-preview-localizacao]', perfil.localizacao, 'Adicione sua cidade ou região');
    texto(
      '[data-preview-bio]',
      perfil.bio,
      'Uma apresentação curta sobre você, suas ideias e o que gosta de construir.',
    );
    texto('[data-preview-contato]', perfil.contato, 'voce@email.com');
    texto(
      '[data-preview-objetivo]',
      perfil.objetivo,
      'Conte que tipo de oportunidade você está buscando.',
    );
    texto('[data-preview-formacao]', perfil.formacao, 'Seu curso ou área de formação');
    texto('[data-preview-instituicao]', perfil.instituicao, 'Sua instituição de ensino');

    const foto = imagemSegura(perfil.foto);
    const fotoElemento = areaPrevia.querySelector('[data-preview-foto]');
    const avatar = areaPrevia.querySelector('[data-preview-iniciais]');
    if (foto && fotoElemento) {
      fotoElemento.src = foto;
      fotoElemento.hidden = false;
      if (avatar) avatar.hidden = true;
      fotoElemento.onerror = () => {
        fotoElemento.hidden = true;
        if (avatar) avatar.hidden = false;
      };
    } else if (fotoElemento) {
      fotoElemento.removeAttribute('src');
      fotoElemento.hidden = true;
      if (avatar) avatar.hidden = false;
    }

    const objetivo = areaPrevia.querySelector('[data-preview-objetivo-bloco]');
    if (objetivo) objetivo.classList.toggle('tem-conteudo', Boolean(perfil.objetivo));
    const educacao = areaPrevia.querySelector('[data-preview-formacao-bloco]');
    if (educacao)
      educacao.classList.toggle('tem-conteudo', Boolean(perfil.formacao || perfil.instituicao));

    const habilidades = (valor, textoAlternativo) => {
      const itens = String(valor || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      return itens.length
        ? itens
            .map(
              (item, indice) =>
                `<span class="etiqueta tecnologia-cor-${indice % 3}">${escapar(item)}</span>`,
            )
            .join('')
        : `<span class="montar-preview-dica">${textoAlternativo}</span>`;
    };
    const areaHabilidadesTecnicas = areaPrevia.querySelector('[data-preview-hard-skills]');
    const areaHabilidadesSociais = areaPrevia.querySelector('[data-preview-soft-skills]');
    if (areaHabilidadesTecnicas)
      areaHabilidadesTecnicas.innerHTML = habilidades(perfil.hardSkills, 'Inclua suas tecnologias');
    if (areaHabilidadesSociais)
      areaHabilidadesSociais.innerHTML = habilidades(perfil.softSkills, 'Inclua suas habilidades');
    const blocoHabilidadesSociais = areaPrevia.querySelector('[data-preview-soft-bloco]');
    if (blocoHabilidadesSociais)
      blocoHabilidadesSociais.classList.toggle('tem-conteudo', Boolean(perfil.softSkills));

    const redes = [
      { nome: 'GitHub', endereco: normalizarUrl(perfil.github) },
      { nome: 'LinkedIn', endereco: normalizarUrl(perfil.linkedin) },
      { nome: 'Site', endereco: normalizarUrl(perfil.website) },
    ].filter((rede) => linkSeguro(rede.endereco));
    const areaRedes = areaPrevia.querySelector('[data-preview-redes]');
    if (areaRedes)
      areaRedes.innerHTML = redes
        .map(
          (rede) =>
            `<a href="${escapar(rede.endereco)}" target="_blank" rel="noopener">${rede.nome} ↗</a>`,
        )
        .join('');

    const projetos = projetosParaPreview();
    const tecnologias = new Set(
      projetos.flatMap((projeto) =>
        (Array.isArray(projeto.tecnologias)
          ? projeto.tecnologias
          : String(projeto.tecnologias || '').split(',')
        )
          .map((item) => String(item).trim())
          .filter(Boolean),
      ),
    );
    const categorias = new Set(projetos.map((projeto) => projeto.categoria).filter(Boolean));
    const indicadores = areaPrevia.querySelector('[data-preview-numeros]');
    if (indicadores)
      indicadores.innerHTML = `
        <div><b>${projetos.length}</b><span>projetos</span></div>
        <div><b>${tecnologias.size}</b><span>tecnologias</span></div>
        <div><b>${categorias.size}</b><span>categorias</span></div>
      `;
    const totalProjetos = areaPrevia.querySelector('[data-preview-projeto-count]');
    if (totalProjetos)
      totalProjetos.textContent =
        contexto === 'inicio'
          ? 'Veja seus trabalhos em Meus projetos'
          : projetos.length
            ? `${projetos.length} ${projetos.length === 1 ? 'projeto' : 'projetos'}`
            : 'Adicione seu primeiro';
    const filtros = areaPrevia.querySelector('[data-preview-filtros]');
    if (filtros) {
      const nomes = ['Todos', ...[...categorias].slice(0, 3)];
      if (nomes.length === 1) nomes.push('Front-end', 'Mobile', 'Dados');
      filtros.innerHTML =
        contexto === 'inicio'
          ? ''
          : nomes
              .map(
                (nome, indice) =>
                  `<span class="montar-preview-filtro${indice === 0 ? ' ativo' : ''}">${escapar(nome)}</span>`,
              )
              .join('');
    }

    const areaProjetosPrevia = areaPrevia.querySelector('[data-preview-projetos]');
    if (!areaProjetosPrevia) return;
    if (!projetos.length) {
      areaProjetosPrevia.innerHTML =
        contexto === 'inicio'
          ? `<div class="montar-preview-sem-projetos">
              <span>SEUS PROJETOS</span>
              <h3>Organize seus trabalhos em um só lugar</h3>
              <p>Cadastre e edite seus projetos na área exclusiva para isso.</p>
              <a href="projetos.html#adicionar-projeto">Ir para Meus projetos →</a>
            </div>`
          : `<div class="montar-preview-vazio">
              <div class="montar-preview-capa">
                <span>SEU PRÓXIMO PROJETO</span>
                <b>01</b>
                <i></i>
              </div>
              <div>
                <span>Seu espaço de destaque</span>
                <h3>Seu primeiro projeto</h3>
                <p>Cadastre um projeto para vê-lo aparecer aqui com imagem, tecnologias e links.</p>
                <small>Projeto · suas tecnologias</small>
              </div>
            </div>`;
      return;
    }

    areaProjetosPrevia.innerHTML = projetos.slice(0, 4).map(montarCartaoProjetoPreview).join('');

    areaProjetosPrevia.querySelectorAll('img[data-capa-titulo]').forEach((imagem) => {
      imagem.addEventListener(
        'error',
        () => {
          const capa = document.createElement('div');
          capa.className = `registro-imagem sem-imagem montar-preview-capa montar-capa-${imagem.dataset.capaIndice || 0}`;
          const categoria = document.createElement('span');
          categoria.textContent = imagem.dataset.capaCategoria || 'Projeto';
          const numero = document.createElement('b');
          numero.textContent = String(Number(imagem.dataset.capaIndice || 0) + 1).padStart(2, '0');
          const detalhe = document.createElement('i');
          capa.append(categoria, numero, detalhe);
          imagem.replaceWith(capa);
        },
        { once: true },
      );
    });
  }

  function renderizarProjetos() {
    if (!listaProjetos) return;
    if (contexto === 'inicio') {
      listaProjetos.innerHTML = `<div class="montar-vazio montar-vazio-meus-projetos">
          <span>Os projetos cadastrados ficam na área exclusiva de Meus projetos.</span>
          <a href="projetos.html#adicionar-projeto">Acessar Meus projetos →</a>
        </div>`;
      return;
    }
    const projetos = lerProjetos();
    if (!projetos.length) {
      const acao =
        contexto === 'novo-projeto'
          ? 'Preencha o formulário acima para cadastrar o primeiro.'
          : 'Adicione seu primeiro projeto para continuar.';
      listaProjetos.innerHTML = `<div class="montar-vazio">${acao}</div>`;
      return;
    }

    listaProjetos.innerHTML = projetos
      .map((projeto) => {
        const titulo = projeto[CONFIG.campoTitulo] || 'Projeto sem título';
        const imagem = imagemSegura(projeto[CONFIG.campoImagem]);
        const habilidades = (
          Array.isArray(projeto.tecnologias)
            ? projeto.tecnologias
            : String(projeto.tecnologias || '').split(',')
        )
          .map((item) => String(item).trim())
          .filter(Boolean);
        const categoria = projeto.categoria || 'Projeto';
        const miniatura = imagem
          ? `<img
              src="${escapar(imagem)}"
              alt="Prévia de ${escapar(titulo)}"
              data-imagem-projeto
              data-capa-categoria="${escapar(categoria)}"
              data-capa-titulo="${escapar(titulo)}"
            >`
          : `<div
              class="montar-projeto-sem-imagem"
              data-categoria="${escapar(categoria)}"
              aria-hidden="true"
            >
              <span>${escapar(categoria)}</span>
              <strong>${escapar(titulo)}</strong>
              <i></i>
            </div>`;
        return `<article class="montar-projeto-card">
        ${miniatura}
        <div class="montar-projeto-info">
          <span>${escapar(projeto.categoria || 'Projeto')}</span>
          <h4>${escapar(titulo)}</h4>
          <p>${escapar(projeto.descricao || 'Projeto adicionado ao portfólio.')}</p>
          <div class="montar-projeto-tags">
            ${habilidades
              .map(
                (habilidade, indice) =>
                  `<span class="tecnologia-chip tecnologia-cor-${indice % 3}">${escapar(habilidade)}</span>`,
              )
              .join('')}
          </div>
          <div class="montar-projeto-acoes">
            <a href="novo-projeto.html?editar=${encodeURIComponent(projeto.id)}&etapa=2">Editar</a>
            <button type="button" data-apagar-projeto="${escapar(projeto.id)}">Excluir</button>
          </div>
        </div>
      </article>`;
      })
      .join('');

    listaProjetos.querySelectorAll('img[data-imagem-projeto]').forEach((imagem) => {
      imagem.addEventListener(
        'error',
        () => {
          const capaAlternativa = document.createElement('div');
          capaAlternativa.className = 'montar-projeto-sem-imagem';
          capaAlternativa.dataset.categoria = imagem.dataset.capaCategoria || 'Projeto';
          capaAlternativa.setAttribute('aria-hidden', 'true');
          const categoria = document.createElement('span');
          categoria.textContent = imagem.dataset.capaCategoria || 'Projeto';
          const titulo = document.createElement('strong');
          titulo.textContent = imagem.dataset.capaTitulo || 'Seu projeto';
          const detalhe = document.createElement('i');
          capaAlternativa.append(categoria, titulo, detalhe);
          imagem.replaceWith(capaAlternativa);
        },
        { once: true },
      );
    });
  }

  function atualizarModelo() {
    const valor = localStorage.getItem(chaveModelo);
    const nome = modelos[valor] || modelos.aurora;
    const modelo = modelos[valor] ? valor : 'aurora';
    wizard.querySelectorAll('[data-modelo-atual]').forEach((elemento) => {
      elemento.textContent = nome;
    });
    const areaPrevia = wizard.querySelector('[data-preview-portfolio]');
    if (areaPrevia) {
      Object.keys(modelos).forEach((chave) => areaPrevia.classList.remove(`modelo-${chave}`));
      areaPrevia.classList.add(`modelo-${modelo}`);
    }
    wizard.querySelectorAll('[data-escolher-modelo]').forEach((botao) => {
      botao.setAttribute('aria-pressed', String(botao.dataset.escolherModelo === modelo));
    });
  }

  function atualizarLayout() {
    const guardado = localStorage.getItem(chaveLayout);
    const layout = layouts[guardado] ? guardado : 'profissional';
    const areaPrevia = wizard.querySelector('[data-preview-portfolio]');
    if (areaPrevia) {
      Object.keys(layouts).forEach((chave) => areaPrevia.classList.remove(`layout-${chave}`));
      areaPrevia.classList.add(`layout-${layout}`);
    }
    wizard.querySelectorAll('[data-layout-portfolio]').forEach((botao) => {
      botao.setAttribute('aria-pressed', String(botao.dataset.layoutPortfolio === layout));
    });
    wizard.querySelectorAll('[data-layout-atual]').forEach((elemento) => {
      elemento.textContent = layouts[layout];
    });
  }

  function irParaEtapa(numero) {
    const etapa = String(numero);
    botoesEtapa.forEach((botao) => {
      const ativo = botao.dataset.etapa === etapa;
      botao.classList.toggle('ativa', ativo);
      if (ativo) botao.setAttribute('aria-current', 'step');
      else botao.removeAttribute('aria-current');
    });
    paineis.forEach((painel) => {
      painel.hidden = painel.dataset.painel !== etapa;
    });
    if (etapa === '2') renderizarProjetos();
    if (etapa === '3') {
      atualizarModelo();
      atualizarLayout();
    }
    atualizarPrevia();
  }

  const perfilForm = wizard.querySelector('.montar-perfil-form');
  if (perfilForm) {
    perfilForm.addEventListener('submit', (evento) => {
      evento.preventDefault();
      salvarPerfil();
      irParaEtapa(2);
    });
  }

  botoesEtapa.forEach((botao) =>
    botao.addEventListener('click', () => {
      if (botao.dataset.etapa !== '1') salvarPerfil();
      irParaEtapa(botao.dataset.etapa);
    }),
  );

  wizard.addEventListener('input', (evento) => {
    if (evento.target.matches('[data-perfil]')) salvarPerfil();
    atualizarPrevia();
  });
  wizard.addEventListener('change', atualizarPrevia);
  wizard.addEventListener('click', (evento) => {
    const botaoModelo = evento.target.closest('[data-escolher-modelo]');
    if (!botaoModelo) return;
    const modelo = botaoModelo.dataset.escolherModelo;
    if (!modelos[modelo]) return;
    localStorage.setItem(chaveModelo, modelo);
    atualizarModelo();
  });
  wizard.addEventListener('click', (evento) => {
    const botaoLayout = evento.target.closest('[data-layout-portfolio]');
    if (!botaoLayout) return;
    const layout = botaoLayout.dataset.layoutPortfolio;
    if (!layouts[layout]) return;
    localStorage.setItem(chaveLayout, layout);
    atualizarLayout();
  });
  wizard.addEventListener('click', (evento) => {
    const novoProjeto = evento.target.closest('[data-reiniciar-portfolio]');
    if (novoProjeto) {
      const confirmou = window.confirm(
        'Começar um portfólio do zero? O perfil, a paleta e os projetos salvos serão removidos. Esta ação não pode ser desfeita.',
      );
      if (!confirmou) return;
      [chavePerfil, chaveProjetos, chaveModelo, chaveLayout, chaveConclusao].forEach((chave) =>
        localStorage.removeItem(chave),
      );
      sessionStorage.setItem(chaveNovoVazio, '1');
      window.location.replace('novo-projeto.html?novo=1');
      return;
    }
    const removerFoto = evento.target.closest('[data-remover-perfil-foto]');
    if (removerFoto) {
      const campoFoto = wizard.querySelector('[data-perfil="foto"]');
      const arquivoFoto = wizard.querySelector('[data-perfil-foto-upload]');
      if (campoFoto) campoFoto.value = '';
      if (arquivoFoto) arquivoFoto.value = '';
      salvarPerfil();
      atualizarFotoPerfil();
      atualizarPrevia();
      return;
    }
    const finalizar = evento.target.closest('[data-finalizar-portfolio]');
    if (!finalizar) return;
    salvarPerfil();
    localStorage.setItem(
      chaveConclusao,
      JSON.stringify({
        concluido: true,
        finalizadoEm: new Date().toISOString(),
        modelo: localStorage.getItem(chaveModelo) || 'aurora',
        layout: localStorage.getItem(chaveLayout) || 'profissional',
      }),
    );
    window.location.href = 'projetos.html#portfolio-concluido';
  });

  const arquivoFotoPerfil = wizard.querySelector('[data-perfil-foto-upload]');
  arquivoFotoPerfil?.addEventListener('change', async () => {
    const arquivo = arquivoFotoPerfil.files && arquivoFotoPerfil.files[0];
    if (!arquivo) return;
    const feedback = wizard.querySelector('[data-perfil-foto-feedback]');
    const nome = wizard.querySelector('[data-perfil-foto-nome]');
    const campoFoto = wizard.querySelector('[data-perfil="foto"]');
    try {
      if (nome) nome.textContent = 'Preparando sua foto...';
      if (feedback) feedback.textContent = '';
      campoFoto.value = await prepararFotoPerfil(arquivo);
      salvarPerfil();
      atualizarFotoPerfil(arquivo.name);
      atualizarPrevia();
      if (feedback) feedback.textContent = 'Foto adicionada ao seu perfil.';
    } catch (erro) {
      atualizarFotoPerfil();
      if (feedback)
        feedback.textContent =
          erro.name === 'QuotaExceededError'
            ? 'O armazenamento está cheio. Remova uma imagem de projeto e tente novamente.'
            : erro.message || 'Não foi possível adicionar esta foto.';
    } finally {
      arquivoFotoPerfil.value = '';
    }
  });

  wizard.querySelectorAll('[data-ir-etapa]').forEach((botao) => {
    botao.addEventListener('click', () => irParaEtapa(botao.dataset.irEtapa));
  });

  wizard.addEventListener('click', (evento) => {
    const excluir = evento.target.closest('[data-apagar-projeto]');
    if (!excluir) return;
    if (!window.confirm('Tem certeza que quer excluir este projeto?')) return;
    const id = excluir.dataset.apagarProjeto;
    const projetos = lerProjetos().filter((projeto) => String(projeto.id) !== id);
    localStorage.setItem(chaveProjetos, JSON.stringify(projetos));
    renderizarProjetos();
  });

  window.addEventListener('porthub:projeto-salvo', () => {
    renderizarProjetos();
    atualizarPrevia();
    const mensagem = wizard.querySelector('#mensagem');
    if (mensagem) {
      mensagem.className = 'mensagem sucesso';
      mensagem.textContent = 'Projeto salvo com sucesso!';
    }
  });
  window.addEventListener('porthub:projeto-form-pronto', atualizarPrevia);
  window.addEventListener('porthub:modelo-alterado', () => {
    atualizarModelo();
    atualizarPrevia();
  });
  window.addEventListener('porthub:layout-alterado', atualizarLayout);
  window.addEventListener('storage', (evento) => {
    if (
      evento.key === chaveProjetos ||
      evento.key === chavePerfil ||
      evento.key === chaveModelo ||
      evento.key === chaveLayout
    ) {
      preencherPerfil();
      renderizarProjetos();
      atualizarModelo();
      atualizarLayout();
      atualizarPrevia();
    }
  });

  preencherPerfil();
  renderizarProjetos();
  atualizarModelo();
  atualizarLayout();
  atualizarPrevia();
  const parametros = new URLSearchParams(window.location.search);
  irParaEtapa(parametros.has('editar') || parametros.get('etapa') === '2' ? 2 : 1);
})();
