# PortHub — Portfólio Fácil

## Nome do projeto

**PortHub (Portfólio Fácil)** é uma plataforma para estudantes organizarem projetos e apresentarem seus trabalhos em um portfólio.

## Integrantes

- Vinicius Almeida Reis
- Joel Josue Nina Nina
- Kaiky Mateus Oliveira da Silva
- Jaqueline Victoria Dos Santos Thomaz
- Agatha Ribeiro Silva
- Marina Sousa Rocha

## Problema

Estudantes desenvolvem projetos, mas nem sempre têm um lugar simples e organizado para registrar o que fizeram, apresentar as tecnologias usadas e compartilhar seus trabalhos com outras pessoas.

## Solução

O PortHub reúne cadastro e organização de projetos em uma plataforma web. Cada estudante pode criar uma conta, cadastrar seus trabalhos com descrição, categoria, tecnologias, imagem e links, e montar uma página de portfólio para apresentar esses projetos.

## Tecnologias utilizadas

- **HTML5** para a estrutura das páginas.
- **CSS3** para estilos e layout responsivo.
- **JavaScript** para cadastro, login e gerenciamento dos projetos no navegador.
- **localStorage** para armazenar os dados no modo local de demonstração.
- **Google Fonts** para as fontes usadas na interface.

## Funcionalidades

- Criar conta, entrar e sair.
- Recuperar senha (requer configuração do serviço de e-mail em `js/config.js`).
- Cadastrar, editar e excluir projetos.
- Informar categoria, tecnologias, descrição, imagem e links do GitHub e da demonstração.
- Filtrar projetos por categoria.
- Gerar uma página de portfólio com os projetos cadastrados e opção de salvar em PDF pelo navegador.
- Apresentar a equipe na página inicial.

## Como executar

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto no VS Code.
3. Inicie um servidor local, por exemplo com a extensão **Live Server**: clique com o botão direito em `index.html` e escolha **Open with Live Server**.
4. Acesse o endereço aberto no navegador. O modo de autenticação local já está selecionado em `js/config.js`.

> Como o projeto usa páginas e scripts locais, execute-o por um servidor local em vez de abrir os arquivos diretamente pelo navegador.

