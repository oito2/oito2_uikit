---
'@oito2/ui': minor
'@oito2/ui-syntax': minor
---

`Button` rendered as a link gets a `rel` prop, which defaults to `noopener` when `target` is `_blank`. `CodeBlock` gets `onLanguageDetected`, called with the language `autoDetect` picked (or `null`) each time the code is highlighted, so a page can show the detected language without highlighting the code a second time.
