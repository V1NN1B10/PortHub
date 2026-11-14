// =========================================================
// CONFIGURAÇÃO DO PROJETO
// Para incluir um campo no formulário, adicione uma opção em "campos".
// Os tipos seguem os nomes aceitos pelo HTML: text, number, date, time, url, select e textarea.
// =========================================================

const CONFIG = {
  chave: 'portfolioFacil',
  // O EmailJS exige esses identificadores e os nomes dos campos configurados no modelo de e-mail.
  // Mantenha os nomes literais do serviço: to_email, verification_code, app_name e expiration_minutes.
  emailjs: {
    serviceId: '',
    templateId: '',
    publicKey: '',
  },
  recuperacaoSenha: {
    validadeMinutos: 10,
    maxTentativas: 5,
  },
  // "local" usa os dados do navegador; "api" ativa a integração descrita em docs/API-FUTURA.md.
  auth: {
    mode: 'local',
    apiBaseUrl: '',
  },
  redesSociais: {
    instagramUrl: '',
    tiktokUrl: '',
    whatsappNumber: '',
  },
  paginaAposLogin: 'projetos.html',
  modoLista: 'grade',
  permitirEditar: true,
  campoImagem: 'imagem',
  campos: [
    {
      id: 'titulo',
      rotulo: 'Nome do projeto',
      tipo: 'text',
      dica: 'Ex.: Site da padaria do bairro',
      obrigatorio: true,
    },
    {
      id: 'categoria',
      rotulo: 'Categoria',
      tipo: 'select',
      opcoes: ['Site', 'Aplicativo', 'Design / UX', 'Jogo', 'Dados', 'Automação', 'Outros'],
      obrigatorio: true,
    },
    {
      id: 'tecnologias',
      rotulo: 'Tecnologias e habilidades usadas (separe por vírgula)',
      tipo: 'text',
      dica: 'Ex.: HTML, CSS, JavaScript',
      obrigatorio: true,
      separarPorVirgula: true,
    },
    {
      id: 'descricao',
      rotulo: 'Descrição',
      tipo: 'textarea',
      dica: 'Qual problema o projeto resolve? O que você aprendeu?',
      obrigatorio: true,
    },
    {
      id: 'imagem',
      rotulo: 'Imagem (caminho ou link)',
      tipo: 'text',
      dica: 'Ex.: img/meu-projeto.jpg',
    },
    {
      id: 'repositorio',
      rotulo: 'Link do código (GitHub)',
      tipo: 'url',
      dica: 'https://github.com/...',
    },
    {
      id: 'linkedin',
      rotulo: 'Publicação ou perfil no LinkedIn',
      tipo: 'url',
      dica: 'https://linkedin.com/...',
    },
    {
      id: 'demo',
      rotulo: 'Link do projeto online',
      tipo: 'url',
      dica: 'https://...',
    },
  ],
  campoTitulo: 'titulo',
  camposEtiqueta: ['categoria', 'tecnologias'],
  camposDetalhe: ['descricao', 'repositorio', 'linkedin', 'demo'],
  campoDestaque: null,
  campoStatus: null,
  statusOpcoes: [],
  rotuloStatus: '',
  filtros: ['categoria'],
  paginaLista: 'projetos.html',
  paginaNovo: 'novo-projeto.html',
};
