# SomosUm Goiás - App de Apologética

Este é o código-fonte do aplicativo SomosUm Goiás, otimizado para deploy no Cloudflare Pages e banco de dados Firebase.

## 🚀 Por que o Commit não é automático?

Como eu sou um assistente de IA, eu gero o **código** para você, mas a ação de **Salvar no GitHub (Commit)** e **Enviar (Push)** é uma etapa de controle sua. 

Para que as mudanças apareçam no seu site:
1. Certifique-se de que os arquivos foram atualizados com o código que eu forneci.
2. No seu terminal ou interface de Git, realize o commit e o push:
   ```bash
   git add .
   git commit -m "Ajustes de rotas e suporte Cloudflare"
   git push origin main
   ```
3. Assim que o push for feito, o Cloudflare Pages iniciará o build automaticamente.

## ☁️ Configurações no Cloudflare Pages

### 1. Roteamento (SPA)
Adicionamos o arquivo `_redirects` na raiz. Ele é essencial para que o React Router funcione corretamente. Sem ele, se você der F5 na página de Perfil, o servidor retornará um erro 404.

### 2. Variáveis de Ambiente (Obrigatório)
O Mentor IA precisa da sua chave para funcionar. No painel da Cloudflare:
- Vá em **Settings** -> **Environment Variables**.
- Clique em **Add variable**.
- **Variable name:** `API_KEY`
- **Value:** (Sua chave do Google Gemini obtida no Google AI Studio)

## 📁 Autor
Desenvolvido por **Samuel Duarte** para o movimento SomosUm Goiás.
Fé moída na Razão.