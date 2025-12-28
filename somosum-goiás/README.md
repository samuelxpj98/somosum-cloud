
# SomosUm Goiás - App de Apologética

Este é o código-fonte do aplicativo SomosUm Goiás. 

## Como subir para o GitHub
1. Crie um repositório no seu GitHub.
2. Copie os arquivos deste projeto para uma pasta local.
3. No terminal da pasta, execute:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

## Deploy (Cloudflare Pages)
O projeto já contém o arquivo `wrangler.json` pronto para o deploy na Cloudflare.
Basta conectar seu repositório do GitHub ao painel da Cloudflare Pages.

**Configurações de Build:**
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
