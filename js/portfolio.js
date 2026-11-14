// Monta a página do portfólio com os projetos cadastrados.
const CHAVE_PERFIL = CONFIG.chave + '_perfil';
const CHAVE_MODELO = CONFIG.chave + '_modelo';
const CHAVE_LAYOUT = CONFIG.chave + '_layout';
const CHAVE_CONCLUSAO = CONFIG.chave + '_concluido';
let categoriaAtiva = '';

function aplicarModeloEscolhido() {
  const modelo = localStorage.getItem(CHAVE_MODELO);
  const portfolio = document.querySelector('.portfolio');
  const valido = ['aurora', 'lume', 'noite'].includes(modelo) ? modelo : 'aurora';
  if (portfolio) {
    ['aurora', 'lume', 'noite'].forEach((nome) => portfolio.classList.remove(`modelo-${nome}`));
    portfolio.classList.add(`modelo-${valido}`);
  }
  const seletor = document.getElementById('modelo-portfolio');
  if (seletor) seletor.value = valido;
}

function aplicarLayoutEscolhido() {
  const layoutGuardado = localStorage.getItem(CHAVE_LAYOUT);
  const layout = ['profissional', 'academico', 'tech'].includes(layoutGuardado)
    ? layoutGuardado
    : 'profissional';
  const portfolio = document.querySelector('.portfolio');
  if (portfolio) {
    ['profissional', 'academico', 'tech'].forEach((nome) =>
      portfolio.classList.remove(`layout-${nome}`),
    );
    portfolio.classList.add(`layout-${layout}`);
  }
  const seletor = document.getElementById('layout-portfolio');
  if (seletor) seletor.value = layout;
}

function pegarPerfil() {
  const usuario = usuarioLogado() || { nome: 'Seu nome' };
  return (
    JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {
      nome: usuario.nome,
      cargo: 'Estudante de tecnologia',
      bio: 'Escreva aqui um pouco sobre você, o que gosta de criar e o que está aprendendo.',
      contato: usuario.email || 'seu-email@exemplo.com',
      hardSkills: '',
      softSkills: '',
      foto: '',
      github: '',
      linkedin: '',
      website: '',
      localizacao: '',
      objetivo: '',
      formacao: '',
      instituicao: '',
    }
  );
}

function normalizarUrlPerfil(endereco) {
  const valor = String(endereco || '').trim();
  if (!valor || /^https?:\/\//i.test(valor) || /^[a-z][a-z0-9+.-]*:/i.test(valor)) return valor;
  return /^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:[/?#].*)?$/i.test(valor) ? `https://${valor}` : valor;
}

function atualizarFotoDoFormulario(valor, nomeArquivo) {
  const imagemPrevia = document.getElementById('p-foto-preview');
  const area = document.getElementById('p-foto-area');
  const nome = document.getElementById('p-foto-nome');
  const remover = document.getElementById('p-remover-foto');
  const foto = String(valor || '').trim();
  const permitida =
    foto &&
    !/^\s*(javascript|vbscript):/i.test(foto) &&
    !/^\/\//.test(foto) &&
    (!/^[a-z][a-z0-9+.-]*:/i.test(foto) ||
      /^https?:\/\//i.test(foto) ||
      /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(foto));
  if (permitida) {
    imagemPrevia.src = foto;
    imagemPrevia.hidden = false;
    area.hidden = false;
    nome.textContent = nomeArquivo || 'Foto atual · clique para trocar';
    remover.disabled = false;
  } else {
    imagemPrevia.removeAttribute('src');
    imagemPrevia.hidden = true;
    area.hidden = true;
    nome.textContent = 'JPG, PNG ou WebP · até 12 MB';
    remover.disabled = true;
  }
}

function prepararFotoDoPerfil(arquivo) {
  if (typeof comprimirImagemPortfolio === 'function')
    return comprimirImagemPortfolio(arquivo, 800, 0.76);
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
    const imagem = new Image();
    imagem.onerror = () => {
      URL.revokeObjectURL(origem);
      reject(new Error('Não foi possível abrir esta imagem.'));
    };
    imagem.onload = () => {
      const escala = Math.min(1, 800 / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.width * escala));
      canvas.height = Math.max(1, Math.round(imagem.height * escala));
      const contexto = canvas.getContext('2d');
      if (!contexto) {
        URL.revokeObjectURL(origem);
        reject(new Error('Este navegador não conseguiu preparar a imagem.'));
        return;
      }
      contexto.fillStyle = '#fff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
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
    imagem.src = origem;
  });
}

function montarPerfil() {
  const perfil = pegarPerfil();
  document.getElementById('pf-nome').textContent = perfil.nome;
  document.getElementById('pf-cargo').textContent = perfil.cargo;
  document.getElementById('pf-bio').textContent = perfil.bio;
  document.getElementById('pf-contato').textContent = perfil.contato;
  const localizacao = document.getElementById('pf-localizacao');
  localizacao.textContent = perfil.localizacao ? `⌖ ${perfil.localizacao}` : '';
  localizacao.hidden = !perfil.localizacao;
  const objetivo = document.getElementById('pf-objetivo');
  const objetivoBloco = document.getElementById('pf-objetivo-bloco');
  objetivo.textContent = perfil.objetivo || '';
  objetivoBloco.hidden = !perfil.objetivo;
  const formacao = document.getElementById('pf-formacao');
  const instituicao = document.getElementById('pf-instituicao');
  const formacaoBloco = document.getElementById('pf-formacao-bloco');
  formacao.textContent = perfil.formacao || '';
  instituicao.textContent = perfil.instituicao || '';
  formacaoBloco.hidden = !perfil.formacao && !perfil.instituicao;
  const foto = document.getElementById('pf-foto');
  const fotoVazia = document.getElementById('pf-foto-vazio');
  const iniciais =
    String(perfil.nome || 'Seu Nome')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase() || 'SN';
  fotoVazia.textContent = iniciais;
  const origemFoto = String(perfil.foto || '').trim();
  if (
    origemFoto &&
    !/^\s*(javascript|vbscript):/i.test(origemFoto) &&
    !/^\s*data:(?!image\/)/i.test(origemFoto)
  ) {
    foto.src = origemFoto;
    foto.hidden = false;
    fotoVazia.hidden = true;
  } else {
    foto.removeAttribute('src');
    foto.hidden = true;
    fotoVazia.hidden = false;
  }
  const habilidadesTecnicas = String(perfil.hardSkills || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  document.getElementById('pf-hard-skills').innerHTML = habilidadesTecnicas.length
    ? habilidadesTecnicas
        .map(
          (item, indice) =>
            `<span class="etiqueta tecnologia-cor-${indice % 3}">${escaparHtml(item)}</span>`,
        )
        .join('')
    : '<span class="portfolio-sem-skills">Adicione suas habilidades ao editar o perfil.</span>';
  const habilidadesInterpessoais = String(perfil.softSkills || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  document.getElementById('pf-soft-skills').innerHTML = habilidadesInterpessoais
    .map(
      (item, indice) =>
        `<span class="etiqueta tecnologia-cor-${indice % 3}">${escaparHtml(item)}</span>`,
    )
    .join('');
  document.getElementById('pf-soft-bloco').hidden = habilidadesInterpessoais.length === 0;
  const redes = [
    { nome: 'GitHub', endereco: normalizarUrlPerfil(perfil.github) },
    { nome: 'LinkedIn', endereco: normalizarUrlPerfil(perfil.linkedin) },
    { nome: 'Site pessoal', endereco: normalizarUrlPerfil(perfil.website) },
  ].filter((rede) => linkSeguro(rede.endereco));
  document.getElementById('pf-redes').innerHTML = redes
    .map(
      (rede) =>
        `<a href="${escaparHtml(rede.endereco)}" target="_blank" rel="noopener">${rede.nome}</a>`,
    )
    .join('');
}

async function baixarPortfolioHtml() {
  const filtroAnterior = categoriaAtiva;
  categoriaAtiva = '';
  montarProjetos();
  const portfolio = document.querySelector('.portfolio');
  const portfolioClonado = portfolio.cloneNode(true);
  portfolioClonado.querySelector('.chips-filtro')?.remove();
  portfolioClonado.querySelectorAll('img[src]').forEach((imagem) => {
    try {
      imagem.src = new URL(imagem.getAttribute('src'), location.href).href;
    } catch (erro) {
      /* Mantém o caminho original da imagem. */
    }
  });
  categoriaAtiva = filtroAnterior;
  montarProjetos();
  let estiloExportado = '';
  try {
    const resposta = await fetch('css/style.css');
    if (!resposta.ok) throw new Error('Não foi possível carregar os estilos.');
    estiloExportado = `<style>${await resposta.text()}</style>`;
  } catch (erro) {
    const enderecoCss = new URL('css/style.css', location.href).href;
    estiloExportado = `<link rel="stylesheet" href="${escaparHtml(enderecoCss)}">`;
  }
  const titulo = escaparHtml(document.getElementById('pf-nome').textContent || 'Meu portfólio');
  const documento = `<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo}</title>
        ${estiloExportado}
      </head>
      <body>${portfolioClonado.outerHTML}</body>
    </html>`;
  const arquivo = new Blob([documento], { type: 'text/html;charset=utf-8' });
  const enderecoTemporario = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = enderecoTemporario;
  link.download = 'meu-portfolio.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(enderecoTemporario), 1000);
}

function imprimirPortfolioCompleto() {
  const portfolio = document.querySelector('.portfolio');
  if (!portfolio) return;

  const filtroAnterior = categoriaAtiva;
  categoriaAtiva = '';
  montarProjetos();

  const corpo = document.body;
  const areaPrincipal = document.querySelector('main');
  if (!areaPrincipal) {
    categoriaAtiva = filtroAnterior;
    montarProjetos();
    return;
  }

  const larguraAnterior = areaPrincipal.style.width;
  corpo.classList.add('preparando-pdf');
  const larguraUtilDaFolha = 210;
  const alturaUtilDaFolha = (297 * 96) / 25.4;
  let escala = 1;

  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    areaPrincipal.style.width = `${larguraUtilDaFolha / escala}mm`;
    const alturaAtual = portfolio.getBoundingClientRect().height;
    const proximaEscala = alturaUtilDaFolha / alturaAtual;
    if (Math.abs(proximaEscala - escala) < 0.005) {
      escala = proximaEscala;
      break;
    }
    escala = proximaEscala;
  }

  areaPrincipal.style.width = `${larguraUtilDaFolha / escala}mm`;
  corpo.style.setProperty('--escala-portfolio-pdf', String(escala));

  try {
    window.print();
  } finally {
    corpo.classList.remove('preparando-pdf');
    corpo.style.removeProperty('--escala-portfolio-pdf');
    areaPrincipal.style.width = larguraAnterior;
    categoriaAtiva = filtroAnterior;
    montarProjetos();
  }
}

function montarProjetos() {
  const todosProjetos = pegarRegistros().sort((projetoA, projetoB) => projetoB.id - projetoA.id);
  const projetos = categoriaAtiva
    ? todosProjetos.filter((projeto) => projeto.categoria === categoriaAtiva)
    : todosProjetos;

  // Conta os projetos e as tecnologias diferentes.
  const tecnologias = new Set(
    todosProjetos.flatMap((projeto) =>
      (projeto.tecnologias || '')
        .split(',')
        .map((tecnologia) => tecnologia.trim())
        .filter(Boolean),
    ),
  );
  document.getElementById('pf-numeros').innerHTML = `
    <div><b>${todosProjetos.length}</b><span>projetos</span></div>
    <div><b>${tecnologias.size}</b><span>tecnologias</span></div>
    <div><b>${new Set(todosProjetos.map((projeto) => projeto.categoria)).size}</b><span>categorias</span></div>`;

  // Cria os botões de filtro por categoria.
  const categorias = [...new Set(todosProjetos.map((projeto) => projeto.categoria))];
  document.getElementById('pf-filtros').innerHTML = ['', ...categorias]
    .map(
      (categoria) => `<button
        class="${categoria === categoriaAtiva ? 'ativo' : ''}"
        onclick="categoriaAtiva='${categoria}'; montarProjetos()"
      >${categoria || 'Todos'}</button>`,
    )
    .join('');

  const areaProjetos = document.getElementById('pf-projetos');
  areaProjetos.innerHTML = projetos.length
    ? projetos
        .map(
          (projeto) => `
    <section class="projeto" data-portfolio-id="${escaparHtml(projeto.id)}">
      ${imagemDoRegistro(projeto)}
      <div class="projeto-texto">
        <p class="sobre">${escaparHtml(projeto.categoria)}</p>
        <h2>${escaparHtml(projeto.titulo)}</h2>
        <p>${escaparHtml(projeto.descricao)}</p>
        <div class="projeto-tecnologias">${etiquetasDoCampo(projeto, 'tecnologias')}</div>
        <div class="projeto-links">
          ${
            linkSeguro(projeto.repositorio)
              ? `<a
                  href="${escaparHtml(projeto.repositorio)}"
                  target="_blank"
                  rel="noopener"
                >Código ↗</a>`
              : ''
          }
          ${
            linkSeguro(projeto.linkedin)
              ? `<a
                  href="${escaparHtml(projeto.linkedin)}"
                  target="_blank"
                  rel="noopener"
                >LinkedIn ↗</a>`
              : ''
          }
          ${
            linkSeguro(projeto.demo)
              ? `<a
                  href="${escaparHtml(projeto.demo)}"
                  target="_blank"
                  rel="noopener"
                >Ver online ↗</a>`
              : ''
          }
        </div>
      </div>
    </section>`,
        )
        .join('')
    : '<p class="vazio">Nenhum projeto ainda. <a href="novo-projeto.html">Cadastre o primeiro!</a></p>';

  areaProjetos.querySelectorAll('img.registro-imagem').forEach((imagem) => {
    imagem.addEventListener(
      'error',
      () => {
        const projeto = imagem.closest('.projeto');
        const categoria = projeto?.querySelector('.sobre')?.textContent || 'Projeto';
        const titulo = projeto?.querySelector('h2')?.textContent || 'Seu projeto';
        const capa = document.createElement('div');
        capa.className = 'registro-imagem sem-imagem portfolio-capa-default';
        capa.dataset.categoria = categoria;
        capa.setAttribute('role', 'img');
        capa.setAttribute('aria-label', `Capa visual para ${titulo}`);
        const rotulo = document.createElement('span');
        rotulo.textContent = categoria;
        const nome = document.createElement('strong');
        nome.textContent = titulo;
        const detalhe = document.createElement('i');
        capa.append(rotulo, nome, detalhe);
        imagem.replaceWith(capa);
      },
      { once: true },
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarModeloEscolhido();
  aplicarLayoutEscolhido();
  montarPerfil();
  montarProjetos();

  document.getElementById('modelo-portfolio')?.addEventListener('change', (evento) => {
    localStorage.setItem(CHAVE_MODELO, evento.target.value);
    aplicarModeloEscolhido();
  });
  document.getElementById('layout-portfolio')?.addEventListener('change', (evento) => {
    localStorage.setItem(CHAVE_LAYOUT, evento.target.value);
    aplicarLayoutEscolhido();
  });
  document.querySelectorAll('[data-finalizar-portfolio]').forEach((botao) =>
    botao.addEventListener('click', () => {
      if (form && !form.hidden) {
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
      localStorage.setItem(
        CHAVE_CONCLUSAO,
        JSON.stringify({
          concluido: true,
          finalizadoEm: new Date().toISOString(),
          modelo: localStorage.getItem(CHAVE_MODELO) || 'aurora',
          layout: localStorage.getItem(CHAVE_LAYOUT) || 'profissional',
        }),
      );
      window.location.href = 'projetos.html#portfolio-concluido';
    }),
  );

  const form = document.getElementById('form-perfil');
  document.getElementById('editar-perfil').addEventListener('click', () => {
    const p = pegarPerfil();
    document.getElementById('p-nome').value = p.nome;
    document.getElementById('p-cargo').value = p.cargo;
    document.getElementById('p-bio').value = p.bio;
    document.getElementById('p-contato').value = p.contato;
    document.getElementById('p-hard-skills').value = p.hardSkills || '';
    document.getElementById('p-soft-skills').value = p.softSkills || '';
    document.getElementById('p-localizacao').value = p.localizacao || '';
    document.getElementById('p-website').value = p.website || '';
    document.getElementById('p-objetivo').value = p.objetivo || '';
    document.getElementById('p-formacao').value = p.formacao || '';
    document.getElementById('p-instituicao').value = p.instituicao || '';
    document.getElementById('p-foto').value = p.foto || '';
    document.getElementById('p-foto-arquivo').value = '';
    atualizarFotoDoFormulario(p.foto);
    document.getElementById('p-github').value = p.github || '';
    document.getElementById('p-linkedin').value = p.linkedin || '';
    form.hidden = !form.hidden;
  });
  const arquivoFotoPerfil = document.getElementById('p-foto-arquivo');
  arquivoFotoPerfil.addEventListener('change', async () => {
    const arquivo = arquivoFotoPerfil.files && arquivoFotoPerfil.files[0];
    if (!arquivo) return;
    const mensagemFoto = document.getElementById('p-foto-feedback');
    const nomeFoto = document.getElementById('p-foto-nome');
    try {
      nomeFoto.textContent = 'Preparando sua foto...';
      mensagemFoto.textContent = '';
      const foto = await prepararFotoDoPerfil(arquivo);
      document.getElementById('p-foto').value = foto;
      atualizarFotoDoFormulario(foto, arquivo.name);
      mensagemFoto.textContent = 'Foto adicionada ao seu perfil.';
    } catch (erro) {
      atualizarFotoDoFormulario(document.getElementById('p-foto').value);
      mensagemFoto.textContent =
        erro.name === 'QuotaExceededError'
          ? 'O armazenamento está cheio. Remova uma imagem de projeto e tente novamente.'
          : erro.message || 'Não foi possível adicionar esta foto.';
    } finally {
      arquivoFotoPerfil.value = '';
    }
  });
  document.getElementById('p-remover-foto').addEventListener('click', () => {
    document.getElementById('p-foto').value = '';
    arquivoFotoPerfil.value = '';
    atualizarFotoDoFormulario('');
    document.getElementById('p-foto-feedback').textContent =
      'Foto removida. Clique em Salvar perfil para confirmar.';
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem(
      CHAVE_PERFIL,
      JSON.stringify({
        nome: document.getElementById('p-nome').value,
        cargo: document.getElementById('p-cargo').value,
        bio: document.getElementById('p-bio').value,
        contato: document.getElementById('p-contato').value,
        hardSkills: document.getElementById('p-hard-skills').value,
        softSkills: document.getElementById('p-soft-skills').value,
        localizacao: document.getElementById('p-localizacao').value,
        website: document.getElementById('p-website').value,
        objetivo: document.getElementById('p-objetivo').value,
        formacao: document.getElementById('p-formacao').value,
        instituicao: document.getElementById('p-instituicao').value,
        foto: document.getElementById('p-foto').value,
        github: document.getElementById('p-github').value,
        linkedin: document.getElementById('p-linkedin').value,
      }),
    );
    form.hidden = true;
    montarPerfil();
  });

  document.getElementById('baixar-portfolio-html').addEventListener('click', async (evento) => {
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
