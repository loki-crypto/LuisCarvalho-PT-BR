# LuisCarvalho-PT-BR

Página de vendas de **Luís Eduardo** — automação e sistemas para pequenos negócios
de João Pessoa.

No ar em **[luis-carvalho-pt-br.vercel.app](https://luis-carvalho-pt-br.vercel.app)**.

Não confundir com o [portfolio-apple](https://github.com/loki-crypto/portfolio-apple):
aquele é o portfólio técnico em inglês, para recrutador. Este aqui vende para dono de
salão, pet shop e assistência técnica. Público diferente, objetivo diferente — mas o
**mesmo sistema de design**, para a marca ser uma só.

## Stack

Nenhuma. HTML, CSS e JavaScript puro — sem framework, sem build, sem dependência de
runtime, sem script de terceiro. As únicas requisições externas são as duas famílias
IBM Plex do Google Fonts.

```
index.html          página única
css/styles.css      tokens de design → primitivas → componentes
js/main.js          só melhoria progressiva
vercel.json         headers de segurança + cache
og.png              card de compartilhamento (1200×630)
favicon.png         64×64, gerado a partir de images/logo.png
images/
  logo.png                    logo (âmbar, alinhado à paleta)
  logo-green-original.png     logo original em verde — backup
```

## Decisões que valem registrar

**Mesma paleta e mesmas fontes do portfolio-apple** (âmbar/zinc + IBM Plex). Os tokens
têm exatamente os mesmos nomes nos dois repositórios, então dá para copiar componente
de um para o outro sem tradução.

**A página funciona com o JavaScript desligado.** O conteúdo é visível por padrão; a
animação de entrada é liberada pela classe `.js` que o `<head>` adiciona antes do
primeiro paint. Script que falha custa uma animação, nunca o conteúdo.

**Todas as cores de texto passam no WCAG AA.** A razão de contraste de cada token está
anotada em comentário do lado dele no `css/styles.css`. `--subtle` (4,1:1) é só para
borda e enfeite — nunca para texto pequeno.

**`prefers-reduced-motion` é respeitado** em toda animação.

**Layout intrínseco.** Os grids usam `repeat(auto-fit, minmax(...))` e refluem pelo
espaço disponível. A única media query restante controla o menu mobile.

**Headers de segurança no `vercel.json`** — CSP com hash SHA-256 dos scripts inline
(sem `unsafe-inline` no `script-src`), HSTS e `Permissions-Policy` negando câmera,
microfone, localização e USB.

> Se você editar um `<script>` inline, o hash muda e o script passa a ser bloqueado.
> Recalcule com:
> ```sh
> printf '%s' "$CORPO_DO_SCRIPT" | openssl dgst -sha256 -binary | openssl base64
> ```
> e atualize o `script-src` no `vercel.json`.

## Preços que aparecem na página

Vindos do playbook de vendas. Se mudar o preço, mude nos **três** lugares: o card em
`#produtos`, o `makesOffer` do JSON-LD e o texto do link do WhatsApp.

| Produto | Preço | Público |
|---|---|---|
| Agenda Online (StudioFlow) | R$99/mês | salão, pet shop, sobrancelha, barbearia, nail |
| Gerador de Orçamento em PDF | R$97 único | assistência técnica de celular |
| Orçamento para Refrigeração | R$97 único | ar-condicionado |

## Rodar localmente

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Não tem o que instalar nem o que buildar.
