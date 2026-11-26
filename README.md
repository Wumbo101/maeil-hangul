# 매일 Maeil

A small daily app for learning to read Hangul. Short lessons take you from the basic vowels through consonants, syllable blocks, compound vowels, batchim, and real words. A streak sits in the middle: finish one lesson or earn 20 XP each day, or the flame goes out.

Readings use Revised Romanization. Every word is shown with its English meaning. The speaker button plays a bundled Korean recording (letters as their sound, words read naturally). The device’s Korean voice is only a fallback. Button taps, right and wrong answers, and lesson or streak celebrations use separate, quieter sound effects. Turn either kind off in Settings.

Progress is stored in `localStorage` on this device (`maeil-progress-v1`). There is no account. Days follow the clock on the device, not UTC.

## Run it

```bash
npm install
npm run dev
```

Open http://127.0.0.1:4731/maeil-hangul/ . The dev server uses the same `/maeil-hangul/` base path as GitHub Pages.

```bash
npm test
npm run build
npm run preview
```

The hosted app is [https://wumbo101.github.io/maeil-hangul/](https://wumbo101.github.io/maeil-hangul/). Pushes to `main` on GitHub build and deploy it with GitHub Actions. Direct links such as `/learn` and `/streak` work because the build copies `index.html` to `404.html`, which GitHub Pages serves for unknown paths, and the client router uses that base path.

`npm test` runs the streak, calendar-date, Hangul, and curriculum checks, then repeats the date and streak tests in `America/New_York` and `Asia/Seoul`.

## What’s in the path

1. Four vowels — ㅏ ㅓ ㅗ ㅜ
2. ㅣ and ㅡ
3. The silent ㅇ, and how blocks are built
4. ㄱ ㄴ ㅁ
5. ㄷ ㄹ ㅂ ㅅ
6. ㅈ and ㅎ
7. Aspirated ㅊ ㅋ ㅌ ㅍ
8. ㅐ and ㅔ
9. Y vowels
10. W vowels and ㅢ
11. Batchim, the final consonant
12. Tense doubles ㄲ ㄸ ㅃ ㅆ ㅉ
13. Real words — greetings, food, places

Each lesson teaches, then practices: character to sound, sound to character, build-a-syllable, and read-a-word. A miss is saved for review and comes back today, then after 1, 3, and 7 days.

## The streak

- The daily goal is one finished lesson **or** 20 XP.
- Practicing again the same day does not add another day.
- If you miss a day, the streak resets the next time the app looks at the calendar.
- A streak freeze covers one missed day. It is spent only when the freezes you hold can cover the whole gap. You start with one and can hold two. Every 7-day streak earns one back, up to that cap.
- Reaching 7, 30, or 100 days plays a short celebration.
- The calendar marks goal days, days you practiced without hitting the goal, and days a freeze covered.

## Install

The production build is a PWA. Run `npm run build && npm run preview`, then use the browser’s install prompt. The dev server does not register the service worker.
