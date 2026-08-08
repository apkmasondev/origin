# ORIGIN — The Cycle of Becoming

Jedna, pełnoekranowa opowieść filmowa sterowana scrollem: biały punkt przechodzi
w eksplozję wielobarwnej materii, świetlistego kolibra, a następnie rozpuszcza
się z powrotem w kosmicznym wirze.

## Uruchomienie lokalne

Wymagany jest Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Pozostałe komendy:

```bash
npm run lint     # ESLint
npm test         # build + testy renderowanego HTML
npm run export   # build + statyczny eksport do ./out
```

## Wdrożenie

`.github/workflows/deploy.yml` publikuje zawartość `./out` na GitHub Pages przy
każdym pushu do `main`. Workflow uruchamia kolejno lint, build, testy i eksport,
więc nieudany lint lub test zatrzymuje wdrożenie.

Wszystkie ścieżki do zasobów są względne, dzięki czemu strona działa również pod
podkatalogiem (np. `https://uzytkownik.github.io/origin/`).

Ustaw zmienną repozytorium `NEXT_PUBLIC_SITE_URL` (Settings → Secrets and
variables → Actions → Variables) na publiczny adres strony — jest używana
wyłącznie do zbudowania bezwzględnych adresów `og:image` i `og:url`, których
wymagają podglądy linków w mediach społecznościowych. Zmienna nie jest sekretem;
bez niej strona działa, ale podglądy linków nie pokażą obrazka. Lokalnie można ją
ustawić kopiując `.env.example` do `.env.local`.

## Materiały

- desktop: trzy filmy 1080p, 24 fps, GOP 1,
- mobile i wolniejsze połączenia: trzy filmy 720p, 24 fps, GOP 1,
- wszystkie filmy bez audio,
- tryb ograniczonego ruchu: poster startowy i kosmiczny poster finałowy WebP.

Filmy pozostają osobnymi plikami. Każdy z nich jest osobnym elementem `<video>`,
a oba przejścia to odwracalne crossfade’y sterowane przezroczystością tych
elementów — bez `<canvas>` i bez przerysowywania klatek w JS.

W trybie ograniczonego ruchu filmy nie są w ogóle pobierane; scenę zastępują
statyczne postery.

## Git

Repozytorium nie zawiera sekretów ani plików środowiskowych. Każdy film ma
mniej niż 30 MB, więc mieści się w limicie pojedynczego pliku GitHub. Przy
dłuższym utrzymywaniu historii projektu warto rozważyć Git LFS dla `*.mp4`.

## Identyfikacja wizualna

- favicon: monogram `O` w `public/favicon.svg`,
- intro: tekst kadruje prawdziwy punkt światła zamiast go zasłaniać,
- interfejs: oszczędny indeks faz i typografia inspirowana planszami filmowymi.
