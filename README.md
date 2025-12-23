# SomosUm Goiás - App de Apologética

Uma plataforma dinâmica desenvolvida para jovens explorarem a harmonia entre fé e razão. O app oferece conteúdos rápidos ("Expressos") e estudos aprofundados sobre apologética cristã.

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Estilização)
- **Gemini API** (Geração de imagens e conteúdo via IA)
- **Cloudflare Pages** (Hospedagem)

## 🛠️ Como rodar o projeto

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para gerar a versão de produção:
   ```bash
   npm run build
   ```

## 📄 Estrutura de Conteúdo

O conteúdo é gerenciado através do arquivo `conteudo.json`, permitindo atualizações dinâmicas na interface, categorias e postagens.

## 🤖 Integração com IA

O editor de conteúdo utiliza o modelo `gemini-2.5-flash-image` para gerar capas contextuais baseadas no título das postagens dos usuários.

---
Desenvolvido para o ministério SomosUm Goiás.