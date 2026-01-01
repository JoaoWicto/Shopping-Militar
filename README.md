Shopping Militar - Frontend (projeto estático)

Descrição

Protótipo de loja "Shopping Militar" construído com HTML, CSS e JavaScript puro. Este projeto é um protótipo cliente-side (tudo rodando no navegador, sem backend).

Principais features

- Loja com listagem de produtos, carrinho persistente (localStorage).
- Checkout via WhatsApp + instruções PIX (sem QR).
- Admin simples: painel com gráfico de vendas (doughnut), CRUD de produtos, export CSV/PDF, e opção de marcar pedido como entregue com nota.
- Tema escuro estilo militar (verde-oliva).

Onde alterar configurações importantes

- Número do WhatsApp usado no checkout: abra `script/script.js` e altere a constante `WA_NUMBER` no início do arquivo.
- Chave PIX exibida no checkout: abra `script/script.js` e altere a constante `PIX_KEY` no início do arquivo.
- Senha do admin: abra `script/admin.js` e altere `ADMIN_PASSWORD` (atualmente: `admin@123`).

Publicar no GitHub Pages

1. Inicialize um repositório Git na pasta do projeto (se ainda não):

   git init
   git add .
   git commit -m "Initial commit - Shopping Militar prototype"

2. Crie um repositório no GitHub e empurre o código.
3. No repositório GitHub, ative GitHub Pages apontando para a branch `main` / `master` (ou use a pasta `docs/`).
4. Acessar a URL do GitHub Pages exibida nas configurações.

Limitações e recomendações

- Autenticação e persistência são feitas somente no navegador (localStorage). Para produção, implemente um backend (API + banco) para gerenciar usuários, pedidos e arquivos.
- A integração com WhatsApp é feita via link `wa.me` que abre o app do usuário; para envio automático de arquivos é necessário usar a API do WhatsApp Business (requer servidor.
- Ao publicar no GitHub Pages, os dados salvos em localStorage permanecem no navegador do usuário (não são compartilhados entre visitantes).

Contribuições

Se quiser, posso:
- Adicionar um backend simples (Node/Express + JSON file ou SQLite) para persistência.
- Implementar autenticação segura e upload de imagens para produtos.
- Reativar geração de PDF com o gráfico embutido de forma robusta.

Contato

Edite os arquivos diretamente no repositório ou me diga o que deseja melhorar a seguir.
