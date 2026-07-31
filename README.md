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

Projekt pozostaje lokalny. Komenda `npm run build` wykonuje produkcyjną
walidację bez publikowania strony.

Przed wdrożeniem skopiuj `.env.example` do konfiguracji hostingu i ustaw
`NEXT_PUBLIC_SITE_URL` na publiczny adres strony. Zmienna nie jest sekretem.

## Materiały

- desktop: trzy filmy 1080p, 24 fps, GOP 1,
- mobile i wolniejsze połączenia: trzy filmy 720p, 24 fps, GOP 1,
- wszystkie filmy bez audio,
- tryb ograniczonego ruchu: poster startowy i kosmiczny poster finałowy WebP.

Filmy pozostają osobnymi plikami. Oba przejścia są wykonywane w kodzie jako
odwracalne crossfade’y na jednym canvasie.

## Git

Repozytorium nie zawiera sekretów ani plików środowiskowych. Każdy film ma
mniej niż 30 MB, więc mieści się w limicie pojedynczego pliku GitHub. Przy
dłuższym utrzymywaniu historii projektu warto rozważyć Git LFS dla `*.mp4`.

## Identyfikacja wizualna

- favicon: monogram `O` w `app/icon.svg`,
- intro: tekst kadruje prawdziwy punkt światła zamiast go zasłaniać,
- interfejs: oszczędny indeks faz i typografia inspirowana planszami filmowymi.
