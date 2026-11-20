# Histora Originals: production rules

Channel: Histora Originals (@HistoraOriginals). English, global audience. Vertical cartoon history Shorts.

## Topics
History, wars, strange discoveries, great explorers, great statesmen, turning points that changed history.
Every claim must be true and checkable; flag legends or disputed points explicitly.

## Daily package (one per video)
1. Hook: the first 3 seconds (one line, max ~10 words, a surprising true claim).
2. Voiceover script: 35-45 seconds (~90-110 words), plain spoken English, short sentences, ending with a punchline or twist.
3. Description: first-person, human voice (see template below). No AI phrasing ("delve", "this recount explores", "you gain perspective").
4. Tags: under 480 characters.
5. Thumbnails: 1280x720 and 1080x1920, same layout as the Emu War thumbnail:
   red date badge, big white Luckiest Guy text, gold key word, short punchline at the bottom.
   The scene and characters change with the topic (no wheat field, no emus unless relevant).
   Famous people are drawn as recognizable caricatures, using costume, hat and moustache cues, never photos.
   Atatürk and other national founders must always be respectful (never mocking). Turkish law 5816 applies.

## Description template
```
[Hook line]

[2-3 sentences: what actually happened]

Why I picked this one: [one honest sentence]

Sources I checked:
- [source 1]
- [source 2]

Which story should I animate next? Tell me in the comments.
Subscribe: https://www.youtube.com/@HistoraOriginals?sub_confirmation=1

#history #shorts #[topic]
```

## Engine
- web/: three.js toon renderer (main.js, story.js, cast.js, eras.js).
- thumb.mjs renders a scene still; thumbtxt.py / thumb_shorts.py add the text.
- Setup: `npm ci && npx playwright install chromium` (or use an existing Chromium).
