---
name: publicar-landing-page
description: Publica, sobe ou atualiza uma landing page no Seven (menu "Landing Pages", link /lp/<slug>) direto do Claude Code, sem GitHub. Use quando o usuário pedir para publicar, subir, enviar, fazer deploy ou atualizar uma landing page/site/página no Seven.
---

# Publicar landing page no Seven

O script `seven.mjs` fica em `../../scripts/seven.mjs` a partir do diretório base desta skill
(informado quando a skill é carregada). Nos comandos abaixo, `<SEVEN_CLI>` é esse caminho absoluto.
Ele fala com a API do Seven usando as variáveis de ambiente `SEVEN_URL` e `SEVEN_TOKEN`. A saída é sempre JSON; código 1 = erro (campo `error`).

## Passos

1. **Descubra o que publicar.**
   - Se o projeto tem `package.json` com script `build`, rode o build e use a pasta de saída
     (`dist/`, `out/` ou `build/`).
   - A pasta publicada precisa ter `index.html` na raiz. Um único `.html` também pode ser enviado.
   - Arquivos ocultos, `.env*`, `.git` e `node_modules` nunca são enviados.

2. **Veja se o slug já existe.** Rode:
   ```bash
   node "<SEVEN_CLI>" list
   ```
   O slug final é sempre minúsculo, sem acentos, com hífens (`Promo Natal` → `promo-natal`).

3. **Decida e confirme.**
   - **Slug novo:** precisa de um título. Se o usuário não deu, pergunte.
   - **Slug existente:** mostre o título e o link da página atual e **peça confirmação explícita**
     antes de continuar — a versão publicada será substituída por completo (o link, as permissões
     e os leads continuam).

4. **Publique:**
   ```bash
   node "<SEVEN_CLI>" publish <pasta|arquivo.html> --slug <slug> --title "<título>" [--description "<descrição>"]
   ```
   Responda com o `url` retornado e diga se a página foi criada (`created`) ou atualizada (`updated`).

5. **Erros comuns:**
   - `SEVEN_URL e SEVEN_TOKEN` / status 401: o usuário precisa gerar um token no Seven
     (Perfil → Integrações · Claude Code) e colocá-lo no `env` do `~/.claude/settings.json`,
     depois reiniciar o Claude Code. **Nunca peça para o usuário colar o token no chat.**
   - Status 403: o usuário não tem acesso àquela página (ou é cliente tentando criar). Sugira outro slug.
   - `Arquivo maior que 50 MB.`: reduza imagens/vídeos ou hospede-os fora da página.
