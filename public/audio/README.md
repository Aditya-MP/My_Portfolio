# Ambience track

Drop a looping ambient track here as `ambience.mp3`.

Wired up in `src/components/ui/AmbientToggle.jsx`. Until the file exists the
toggle renders nothing — a missing track degrades to silence, not a dead button.

Guidance:
- **Seamless loop.** Any click at the loop point is very audible on repeat.
- **Keep it under ~2 MB.** It only downloads after the user opts in
  (`preload="none"`), but it still costs them.
- **Low, wide, no melody.** Something with a tune competes with reading. Room
  tone, low strings, distant wind.
- **Licensing matters** — this is a public portfolio. Use something you can
  actually use commercially and keep the attribution note below.

## Attribution

<!-- track name / source / licence -->
