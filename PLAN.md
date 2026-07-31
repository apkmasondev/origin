# ORIGIN — plan zjawiskowej strony scroll-driven

## 1. Założenie

Zbuduj jedną, pełnoekranową opowieść sterowaną scrollem, opartą wyłącznie na dwóch dostarczonych filmach:

**biały punkt → eksplozja wielobarwnej materii → narodziny świetlistego kolibra**

Strona nie może wyglądać jak klasyczny landing page. Nie twórz osobnych sekcji, kart, galerii, stopki ani dodatkowych ekranów. Od początku do końca użytkownik pozostaje w jednej przypiętej scenie filmowej.

Robocza nazwa: **ORIGIN**  
Hasło finałowe: **FROM A POINT TO LIFE**  
Alternatywa po polsku: **WSZYSTKO ZACZYNA SIĘ OD PUNKTU**

---

## 2. Materiały

### Desktop

- `assets/video/scene-01-point-explosion-1080p-gop1.mp4`
- `assets/video/scene-02-hummingbird-1080p-gop1.mp4`

### Mobile / wolniejsze urządzenia

- `assets/video/scene-01-point-explosion-720p-gop1.mp4`
- `assets/video/scene-02-hummingbird-720p-gop1.mp4`

### Postery

- `assets/posters/poster-start.webp`
- `assets/posters/poster-final-hummingbird.webp`

Każdy film ma 1920×1080 lub 1280×720, 24 fps, 10 sekund i GOP 1. Każda klatka jest klatką kluczową, co umożliwia precyzyjne sterowanie `currentTime` podczas scrollowania.

**Nie łącz filmów w jeden plik.** Mają pozostać dwoma osobnymi źródłami, a przejście należy wykonać w kodzie.

---

## 3. Konstrukcja strony

Cały dokument powinien składać się z jednego wysokiego kontenera, np. `620vh–720vh`.

Wewnątrz:

- jedna scena `position: sticky; top: 0; height: 100svh`,
- pełnoekranowy canvas lub dwa nakładające się canvasy,
- dwa ukryte elementy `<video>`,
- oszczędne warstwy typograficzne,
- dyskretny wskaźnik postępu.

Nie dodawaj niczego pod filmem ani nad nim jako osobnej sekcji. Finał również pozostaje wewnątrz tej samej przypiętej sceny.

---

## 4. Narracja i mapa scrolla

### 0–7% — cisza

- Pokazuj pierwszą klatkę filmu 1.
- Czarne tło i mały biały punkt w centrum.
- Delikatnie pojawia się tekst:
  - `EVERYTHING BEGINS`
  - `FROM A POINT`
- Mały napis przy dolnej krawędzi: `SCROLL TO UNFOLD`.
- Bez dodatkowych cząsteczek, bloom i ozdobników w kodzie.

### 7–45% — eksplozja koloru

- Steruj filmem 1 od około `0.2 s` do `9.7 s`.
- Tekst początkowy powinien zniknąć przed właściwą eksplozją.
- Opcjonalnie, krótko około 25–31%:
  - `COLOR BECOMES ENERGY`
- Napis nie może zasłaniać środka kompozycji.

### 45–51% — płynne przejście między filmami

To kluczowy fragment. Nie wykonuj twardego przełączenia źródła.

- Film 1: od `9.65 s` do `10.0 s`.
- Film 2: od `0.0 s` do około `0.35 s`.
- Oba źródła renderuj jednocześnie.
- Zastosuj crossfade:
  - alfa filmu 1: `1 → 0`,
  - alfa filmu 2: `0 → 1`.
- Użyj łagodnego easing, np. `smoothstep` lub `power2.inOut`.
- Nie dodawaj białego flasha, blur transition ani czarnej planszy.
- Przejście ma być niewidoczne również przy przewijaniu wstecz.

### 51–91% — narodziny kolibra

- Steruj filmem 2 od około `0.35 s` do `9.6 s`.
- Opcjonalny krótki tekst przy 62–70%:
  - `ENERGY FINDS A FORM`
- Tekst ma zniknąć, zanim koliber stanie się w pełni czytelny.
- Nie przykrywaj głowy, skrzydeł ani środka kompozycji.

### 91–100% — finał

- Doprowadź film 2 do ostatniej klatki i utrzymaj ją.
- Nie zapętlaj filmu.
- Na końcowym obrazie pojawia się:
  - mały nadtytuł: `ORIGIN`,
  - główne hasło: `FROM A POINT TO LIFE`,
  - opcjonalnie jeden dyskretny link, np. `VIEW PROJECTS`.
- Tekst powinien pojawić się spokojnie przez opacity i niewielkie przesunięcie pionowe.
- Bez osobnej sekcji końcowej i bez stopki.

---

## 5. Zalecana implementacja wideo

Preferowany stack:

- Vite,
- React,
- TypeScript,
- GSAP + ScrollTrigger albo własny lekki mechanizm scroll progress,
- Canvas 2D.

### Elementy wideo

Dwa ukryte elementy `<video>`:

```html
<video muted playsinline preload="auto"></video>
<video muted playsinline preload="auto"></video>
```

Nie uruchamiaj ich przez `play()`. Ustawiaj `currentTime` na podstawie scrolla.

### Renderowanie

Najlepiej użyć jednego canvasa:

1. wyczyść canvas,
2. narysuj odpowiednio wykadrowany film 1,
3. podczas przejścia narysuj film 2 z kontrolowanym `globalAlpha`,
4. po przejściu renderuj wyłącznie film 2.

Canvas ma działać jak `object-fit: cover`, zachowując środek obrazu w centrum ekranu. Uwzględnij `devicePixelRatio`, ale ogranicz je np. do `2`, aby nie przeciążać GPU.

Do odświeżania użyj `requestVideoFrameCallback` z fallbackiem do `requestAnimationFrame`.

### Seeking

- Nie ustawiaj `currentTime` na każdej mikro-zmianie bez ograniczenia.
- Aktualizuj go tylko, gdy różnica przekracza niewielki próg, np. `1/48 s`.
- Przewijanie do góry musi działać równie płynnie jak w dół.
- Po osiągnięciu końca zachowaj ostatnią klatkę bez migania i resetu.

---

## 6. Ładowanie

Ładowanie ma być częścią projektu:

- czarne tło,
- `poster-start.webp`,
- mały punkt w środku,
- subtelny licznik procentowy,
- wejście do doświadczenia dopiero po gotowości obu filmów lub wystarczającego bufora.

Nie zakładaj, że pliki zawsze załadują się poprawnie. Dodaj:

- obsługę błędu,
- przycisk ponowienia,
- timeout,
- brak domyślnych kontrolek wideo.

Film 2 powinien rozpocząć preload jeszcze przed osiągnięciem przejścia.

---

## 7. Dobór źródła

Przed pobraniem plików wybierz wariant:

- desktop i większe tablety: 1080p,
- telefon, mały ekran lub wolniejsze połączenie: 720p.

Nie podmieniaj źródła po rozpoczęciu doświadczenia. Wybór wykonaj raz przy starcie.

---

## 8. Styl wizualny

- idealnie czarne tło,
- kolory pochodzą wyłącznie z filmów,
- interfejs biały lub lekko złamany,
- nowoczesna, elegancka typografia,
- duży tracking w małych podpisach,
- dużo oddechu,
- brak neonowego UI, gradientowych nagłówków i cyberpunkowych ozdobników.

Dopuszczalna jest bardzo subtelna winieta na krawędziach, ale bez filtrowania środka filmu.

Nie dodawaj:

- dodatkowych cząsteczek WebGL,
- sztucznego bloom,
- dużego kursora z poświatą,
- kart projektów,
- navbaru,
- hamburger menu,
- dźwięku,
- osobnych sekcji.

---

## 9. Responsywność

### Desktop

- `100svh`,
- kadrowanie `cover`,
- bezpieczne marginesy tekstów: `clamp(20px, 4vw, 72px)`.

### Mobile

- użyj wersji 720p,
- zachowaj centralne kadrowanie,
- dopuszczalne przycięcie boków,
- teksty przenieś poza sylwetkę kolibra,
- używaj `svh`,
- nie blokuj natywnego scrolla,
- przetestuj iOS Safari oraz Chrome Android.

---

## 10. Dostępność i reduced motion

Dla `prefers-reduced-motion: reduce`:

- nie wykonuj agresywnego scrubowania,
- pokaż poster startowy, następnie poster finałowy po prostym fade,
- zachowaj pełną treść tekstową,
- link finałowy musi działać klawiaturą.

Canvas powinien mieć sensowny opis `aria-label`, a teksty muszą istnieć jako prawdziwe elementy HTML, nie jako część canvasa.

---

## 11. Kryteria odbioru

Przed uznaniem projektu za gotowy dokładnie sprawdź:

1. Czy nie ma widocznego skoku między filmem 1 i 2.
2. Czy crossfade działa także podczas scrollowania wstecz.
3. Czy filmy nie migają przy pierwszym seeku.
4. Czy końcowa klatka pozostaje stabilna.
5. Czy na mobile środek kompozycji nie jest ucięty.
6. Czy tekst nie zakrywa kolibra.
7. Czy ładowanie i obsługa błędów faktycznie działają.
8. Czy nie powstały przypadkowe dodatkowe sekcje, footer lub klasyczny layout strony.
9. Czy scroll jest responsywny i nie ma gumowego opóźnienia.
10. Czy rozwiązanie nie zakłada z góry, że wszystko działa — przetestuj je w Chrome, Firefox, Safari oraz na urządzeniu mobilnym.

Efekt końcowy ma wyglądać jak jedna nieprzerwana, interaktywna sekwencja filmowa, mimo że technicznie korzysta z dwóch osobnych plików.
