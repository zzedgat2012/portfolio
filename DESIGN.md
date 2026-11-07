---
version: alpha
name: Edgar Ferreira
description: Tema escuro, monocromático e tipográfico do edgar-ferreira.com (WordPress + Sage 11 + Tailwind 4).
colors:
  background: "#121212"
  foreground: "#F5F5F5"
  card: "#3D3D3D"
  card-foreground: "#F5F5F5"
  primary: "#F5F5F5"
  primary-foreground: "#121212"
  secondary: "#3D3D3D"
  secondary-foreground: "#F5F5F5"
  muted-foreground: "#A8A8A8"
  accent: "#A8A8A8"
  accent-foreground: "#121212"
  destructive: "#B91C1C"
  destructive-foreground: "#F5F5F5"
  border: "#3D3D3D"
  input: "#3D3D3D"
  ring: "#A8A8A8"
  off-white: "#F5F5F5"
  slide-panel-from: "#1A1A1A"
  slide-panel-to: "#0F0F0F"
  slide-meta: "oklch(55.1% 0.027 264.364)"
  slide-body: "oklch(70.7% 0.022 261.325)"
  pill-hover: "oklch(96.7% 0.003 264.542)"
  code-surface: "#1E1E1E"
  code-ink: "#D4D4D4"
typography:
  display-hero:
    fontFamily: Fira Code
    fontSize: 96px
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: -0.025em
  display-hero-right:
    fontFamily: Fira Code
    fontSize: 104px
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: -0.025em
  display-section:
    fontFamily: Fira Code
    fontSize: 96px
    fontWeight: 700
    lineHeight: 1
  display-contact:
    fontFamily: Fira Code
    fontSize: 60px
    fontWeight: 700
    lineHeight: 1
  heading-project:
    fontFamily: Fira Code
    fontSize: 36px
    fontWeight: 400
    lineHeight: 40px
  heading-slide:
    fontFamily: Fira Code
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.25
  summary-value:
    fontFamily: Fira Code
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
  heading-company:
    fontFamily: Fira Code
    fontSize: 20px
    fontWeight: 700
    lineHeight: 28px
  heading-card:
    fontFamily: Fira Code
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  label:
    fontFamily: Fira Code
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  eyebrow:
    fontFamily: Fira Code
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.8em
  chip:
    fontFamily: Fira Code
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  lead:
    fontFamily: Open Sans
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.625
  body-lg:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.625
  small:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  button:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  caption:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  meta-caps:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.35em
rounded:
  base: 16px
  lg: 16px
  md: 14px
  sm: 12px
  2xl: 16px
  3xl: 24px
  slide: 40px
  code: 4px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
  12: 48px
  16: 64px
  20: 80px
  container-gutter: 32px
  section-y: 80px
  container-max: 1400px
  content-max: 1152px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 40px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 40px
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: 40px
  button-outline-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    height: 40px
  pill-link:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.background}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 12px 24px
  pill-link-hover:
    backgroundColor: "{colors.pill-hover}"
  hero-cta:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    padding: 24px 40px
    width: 220px
  icon-button:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    size: 48px
  icon-button-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
  skill-chip:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.lg}"
    padding: 6px 12px
  skill-chip-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  project-tag:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.chip}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  social-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  social-tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: 16px
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.foreground}"
  experience-row:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: 32px
  article-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.heading-card}"
    rounded: "{rounded.2xl}"
    padding: 32px
  project-slide:
    backgroundColor: "{colors.slide-panel-from}"
    textColor: "#FFFFFF"
    typography: "{typography.heading-slide}"
    rounded: "{rounded.slide}"
    padding: 32px
    height: 300px
  section-eyebrow:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.eyebrow}"
  section-display:
    textColor: "{colors.foreground}"
    typography: "{typography.display-section}"
  project-slide-gradient-end:
    backgroundColor: "{colors.slide-panel-to}"
  project-slide-meta:
    textColor: "{colors.slide-meta}"
    typography: "{typography.meta-caps}"
  project-slide-description:
    textColor: "{colors.slide-body}"
    typography: "{typography.small}"
  button-outline-border:
    backgroundColor: "{colors.input}"
    width: 1px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  focus-ring:
    backgroundColor: "{colors.ring}"
    size: 2px
  inline-code:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.accent}"
    rounded: "{rounded.code}"
    padding: 2px 8px
  code-block:
    backgroundColor: "{colors.code-surface}"
    textColor: "{colors.code-ink}"
    padding: 16px
---

## Overview

Portfólio pessoal de um engenheiro: escuro, monocromático, tipográfico. Quase tudo é cinza sobre quase-preto; a personalidade vem do contraste entre **Fira Code gigante e apertada** nos títulos e **Open Sans discreta** no corpo, das pílulas brancas de CTA e de círculos de 1px como único ornamento. Tom calmo e técnico, sem cor de marca com matiz.

Voz: copy em inglês e traduzível ("Read more", "Download CV", "View all projects on GitHub →"). Frases curtas, primeira pessoa no About, sem exclamações, sem emoji na interface (exceção: os quatro badges posicionais da lista de projetos). Botões e subtítulos em Title Case; eyebrows de seção em CAIXA ALTA espaçada.

## Colors

Um único tema escuro.

- **background (#121212):** chão de toda a página.
- **foreground (#F5F5F5):** texto principal; ≥9.9:1 sobre `background`, `card`, `popover` e `secondary`.
- **muted-foreground (#A8A8A8):** descrições, eyebrows, links de navegação. 8.5:1 sobre `background`; 4.57:1 sobre `card`.
- **card / secondary (#3D3D3D):** superfícies elevadas — cards de artigo, chips, botões secundários, tiles sociais.
- **primary (#F5F5F5) + primary-foreground (#121212):** botão sólido claro.
- **accent (#A8A8A8):** o "destaque" do sistema — hover de links e títulos, marcador ▸ das listas, filetes. Não é cor de marca; é cinza médio.
- **destructive:** a única cor saturada; só para ações destrutivas (#B91C1C, 5.9:1 com o texto).
- **border / input (#3D3D3D):** toda borda, quase sempre com opacidade (30/40/50/60%). 1.7:1 contra o fundo: nunca é o único indicador de um controle.
- **ring (#A8A8A8):** anel de foco.
- **off-white, pill-hover, slide-\*, code-\*:** valores literais de componentes específicos (CTA do Hero, pílula "Read more", painel do carrossel, blocos de código).

Os tokens `popover`, `popover-foreground` e `muted` do shadcn/ui existem no `app.css`, mas nenhum template os usa; ficaram fora deste arquivo.

Transparências fazem parte do sistema: `card` a 60% nas linhas de experiência, `secondary` a 60–70% em hovers, `background` a 95% com blur no menu mobile.

## Typography

- **Fira Code** (400–700) para todo `h1–h6`, navegação, rótulos, tags, números e o wordmark. **Open Sans** (300–700) para corpo. Ambas via Google Fonts:
  `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Open+Sans:wght@300;400;600;700&display=swap`
- Display enorme e apertado: `display-hero` (96px, line-height 0.9, tracking −0.025em) e `display-section` (96px) alinhado à direita. Responsivo: 36px → 60/72px (sm) → 96px (lg/md).
- Corpo em `body` com line-height 1.625; descrições sempre em `muted-foreground`.
- `eyebrow`: 12px, CAIXA ALTA, tracking 0.8em. `meta-caps`: 12px, CAIXA ALTA, tracking 0.35em, tags separadas por " • ".

## Layout

- `container`: largura total, centrado, gutter 32px, máximo 1400px em 2xl (breakpoints 640/768/1024/1280).
- Seções: `max-w-6xl` (1152px), `px-4`, `py-20` (80px). Cabeçalho de seção a 64px do conteúdo; grids de duas colunas com gap 48px.
- Ritmo esquerda/direita: Hero com título à esquerda e CTA + segundo título à direita; eyebrows à esquerda (About, Projects, Contact) alternando com títulos display à direita (Work, Articles).
- Grade de 4px do Tailwind; valores da fonte são exatos, não arredondar.

## Elevation & Depth

Profundidade por superfície mais clara e borda fina, não por sombra.

- `glow`: `0 0 20px rgb(166 166 166 / 0.15)` — retrato do About e hover de cards.
- `slide`: `0 20px 60px rgba(0,0,0,0.45)` — card do carrossel.
- `cta-inset`: `inset 0 1px 0 rgba(255,255,255,0.3)` — brilho superior do CTA do Hero.
- Ornamento de fundo: círculos de 1px em `border` a 30% (utilitário `circle-accent`) e um brilho branco a 5% com blur.

Movimento: seções entram com opacidade 0→1 e `translateY(40px) scale(.98)`→0 em 0.9s `cubic-bezier(0.16, 1, 0.3, 1)`, com delays de 80–300ms; desligado com `prefers-reduced-motion`. Hovers trocam cor em 150ms; cards e tiles escalam 1.05.

## Shapes

- Raio base 16px. Botões `md` (14px); cards `2xl` (16px); retrato `3xl` (24px); card do carrossel `slide` (40px); `code` inline 4px.
- Todo CTA secundário, tag de projeto, link social ou botão de ícone é pílula/círculo (`full`).
- Ícones Lucide inline, stroke 2px `currentColor`; 16px em botões e pílulas, 20px em botões circulares. Sem logo gráfico: a marca é o nome em Fira Code bold.

## Components

- **button-\*:** port do shadcn/ui Button (`<x-button>`); variantes default, secondary, outline, ghost, link, destructive; tamanhos sm 36px, default 40px, lg 44px, icon 40×40. Foco: anel 2px `ring` com offset 2px.
- **pill-link:** pílula branca "Read more" + círculo branco 48px com `arrow-right`, ambos para o mesmo destino; o círculo leva `aria-label`.
- **hero-cta:** pílula `off-white` em Fira 16px com `cta-inset`, ao lado de um icon-button sólido.
- **icon-button:** círculo 48px com borda `border` a 60%; ícone `muted-foreground` → `foreground`.
- **skill-chip / project-tag:** Fira 12px; chip `rounded.lg` que vira `accent` no hover; tag em pílula com borda a 30%.
- **social-link / social-tile:** pílula com borda a 50% no Hero (só ícone no mobile); tile `card` em grid de 2 colunas no Contact.
- **experience-row:** linha clicável (`mailto:`) em grid 3/4/5; no hover ganha `card` pleno, empresa em `accent`, chevron e filete `accent` de 4px na base.
- **article-card:** `card`, padding 32px, `glow` no hover; botão secondary em pílula que inverte para `foreground`/`background`.
- **project-slide:** imagem 45% + painel em gradiente `slide-panel-from` → `slide-panel-to`; vizinhos a escala 0.85 e opacidade 0.3; indicadores 8px (ativo 32px).
- **divider / button-outline-border / focus-ring:** o formato não tem propriedade de borda, então traços de 1–2px aparecem como componentes: `divider` é o `border-t` (a 30% ou 100%) acima de rodapés de seção; `button-outline-border` é a borda de 1px do botão outline; `focus-ring` é o anel de 2px com offset de 2px em `background`.
- **project-slide-gradient-end / -meta / -description:** fim do gradiente do painel, tags em caixa alta e descrição (`line-clamp-2`) do card do carrossel.
- **Prose (artigos):** corpo `muted-foreground`, títulos mono em `foreground`, listas com ▸ em `accent`, `inline-code` e `code-block` como nos tokens, blockquote com borda `accent` a 50%.

## Do's and Don'ts

- **Do** manter o sistema monocromático; o único "destaque" é `accent` cinza.
- **Do** usar Fira Code para títulos, rótulos e números; Open Sans só para corpo.
- **Do** usar pílulas (`rounded.full`) para CTAs e tags, e bordas de 1px com opacidade para separar superfícies.
- **Do** alternar eyebrow à esquerda e display à direita entre seções.
- **Don't** introduzir cores com matiz fora de `destructive`, gradientes coloridos ou sombras pesadas.
- **Don't** clarear superfícies além de `card` sem rechecar `muted-foreground`: a folga sobre `card` é pequena (4.57:1).
- **Don't** usar o Alert do boilerplate do Sage (paleta indigo/green/yellow/red do Tailwind, contraste < 3:1) em telas novas.
- **Don't** desenhar um logo: a marca é o nome do site em tipo.
