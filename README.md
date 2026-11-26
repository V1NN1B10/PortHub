# PortHub — Portfólio Fácil

O PortHub ajuda estudantes a organizar seus projetos e montar um portfólio para apresentar seus trabalhos. O site reúne cadastro de projetos, edição de perfil, prévia em tempo real e exportação em PDF e HTML.

## Equipe do Grupo 3

| Integrante | Função |
| --- | --- |
| Vinicius Almeida Reis | Product Owner |
| Jaqueline Victoria Dos Santos Thomaz | Scrum Master |
| Joel Josue Nina Nina | Dev |
| Kaiky Mateus Oliveira da Silva | Dev |
| Agatha Ribeiro Silva | Front-end |
| Marina Sousa Rocha | Front-end |
| Iago de Jesus Silva | Dev |
| Kauã José Cardoso dos Santos | Dev |

## Como abrir o site

1. Baixe a pasta do projeto ou clone o repositório com o Git.

   ```bash
   git clone https://github.com/V1NN1B10/PortHub.git
   ```

2. Abra a pasta `PortHub` no VS Code e instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` e selecione **Open with Live Server**. A página inicial abrirá no navegador.

## Como usar o PortHub

1. **Crie uma conta.** Na página inicial, selecione **Entrar** e depois **Criar conta grátis**. Preencha o cadastro e faça login para abrir **Meus projetos**.
2. **Cadastre um projeto.** Em **Meus projetos**, clique em **+ Cadastrar projeto**. Informe o nome, a categoria, as tecnologias e a descrição. Você também pode enviar uma imagem de capa ou informar um link. Clique em **Adicionar projeto à lista**. Use a busca, o filtro por categoria e os botões **Editar** e **Excluir** para organizar a lista.
3. **Monte o portfólio.** Abra **Novo projeto** no menu principal. Em **Seu perfil**, preencha seus dados. Na etapa **Projetos**, confira a lista ou adicione outro trabalho com links opcionais para GitHub, LinkedIn e demonstração. Em **Modelo e visualização**, escolha a paleta **Aurora**, **Lume** ou **Noite** e o formato **Perfil profissional**, **Perfil acadêmico** ou **Portfólio tech**. A prévia acompanha suas escolhas.
4. **Finalize e exporte.** Clique em **Finalizar e guardar em Meus projetos**. No cartão **Projeto concluído**, use **Ver portfólio**. Selecione **Baixar HTML** para gerar `meu-portfolio.html` ou **Salvar em PDF / Imprimir** e escolha a opção de PDF na janela de impressão do navegador.

Para acrescentar trabalhos ao portfólio atual, use a etapa **Projetos**. O botão **↻ Novo projeto** dentro do assistente reinicia o portfólio e remove o perfil, o visual escolhido e os projetos salvos após a confirmação.

## Atualizações recentes

- As seis páginas foram ajustadas para celular, tablet e computador. O menu é recolhível em telas menores, os campos têm áreas maiores para toque e os cartões acomodam textos longos.
- A página inicial ganhou um carrossel 3D para comparar Aurora, Lume e Noite com as setas na tela ou no teclado. A escolha é gravada ao clicar em **Usar este modelo**.
- A animação abaixo de **Tudo para mostrar seu melhor trabalho** inicia automaticamente e se repete com uma transição suave. Ela respeita a preferência **Reduzir movimento** do dispositivo.
- Os avisos do login e do cadastro foram compactados para manter os campos visíveis. O rodapé do login ficou transparente, com texto e ícones em cores de maior contraste.
- O site inclui um painel de acessibilidade com opções de tamanho do texto e contraste, além do VLibras.

## Tecnologias e armazenamento

O site usa HTML, CSS e JavaScript. No modo local de demonstração, contas, perfis e projetos são guardados no `localStorage` do navegador para o endereço em que você abriu o site. Use uma conta de teste e mantenha o mesmo endereço para reencontrar seus dados. Para compartilhar o portfólio, exporte uma cópia.

As opções do projeto ficam em [js/config.js](js/config.js). A proposta de integração com API está em [docs/API-FUTURA.md](docs/API-FUTURA.md).

## Licença

[MIT](LICENSE)

