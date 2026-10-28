# Seven · plugin para o Claude Code

Publica e atualiza Landing Pages no **Seven** (menu "Landing Pages", link `/lp/<slug>`) direto do Claude Code, sem GitHub e sem upload manual.

Este repositório tem só o plugin: nenhum código do Seven e nenhum segredo. O endereço do Seven e o seu token ficam na sua máquina.

## 1. Gere seu token

No Seven, abra **Perfil → Integrações · Claude Code**, dê um nome ao token e clique em **Gerar token**. Copie o valor: ele aparece uma única vez.

## 2. Configure o Claude Code

Adicione ao `~/.claude/settings.json` (Windows: `C:\Users\<você>\.claude\settings.json`), dentro do objeto principal:

```json
"env": {
  "SEVEN_URL": "https://seven.googlar.com.br",
  "SEVEN_TOKEN": "seven_..."
}
```

Nunca cole o token no chat do Claude.

## 3. Instale o plugin

Dentro do Claude Code (no chat):

```
/plugin marketplace add AzmuthDev/seven-claude-plugin
/plugin install seven@seven
```

Ou no terminal (PowerShell, Terminal do Mac etc.):

```bash
claude plugin marketplace add AzmuthDev/seven-claude-plugin
claude plugin install seven@seven
```

Reinicie o Claude Code.

## 4. Use

Numa pasta com `index.html`, peça ao Claude:

> publica essa pasta no Seven com o slug minha-pagina e o título Minha Página

Se o slug já existir, o Claude pede confirmação antes de substituir a página. O link, as permissões e os leads continuam os mesmos.

Para testar só o token, sem publicar nada:

```bash
curl -H "Authorization: Bearer $SEVEN_TOKEN" https://seven.googlar.com.br/api/integrations/landing-pages
```

## Atualizar o plugin

```bash
claude plugin marketplace update seven
```

## Desenvolvimento

```bash
npm install
npm test
```
