# Stellar Scan

## What it does

Stellar Scan tells you which constellation is actually overhead tonight, from wherever you are. Pick a date and a location and it calculates real star positions for that exact time and place, then hands you back the constellation that's most visible right then: real magnitudes, spectral classes, distances, how it's been used and named across different cultures, and whether clouds will even let you see it.

## From Gemini to real astronomy

It started as a much smaller idea. My first prototype came out of Google AI Studio and used Gemini to generate constellation descriptions on demand. It looked fine, but the content was made up on the spot every time, so identical scans could describe the same constellation differently, and there was no real astronomy underneath any of it. I rebuilt the core around `astronomy-engine` and a local database of 38 constellations, computing actual star positions instead of asking a model to describe them.

## Building the CRT look

Most of the early work after that went into how the thing looked. I wanted a retro terminal feel: phosphor green on black, bracket-style buttons, scanlines, a boot sequence, a CRT bezel that curves at the edges like an old monitor. Getting that aesthetic right took a while on its own, before I'd touched most of the actual astronomy content.

## Fixing the accuracy bug

The content is where I spent the most time working with Claude. At one point I noticed something was wrong: scanning Jabalpur and scanning Bloomington, Indiana, two cities on opposite sides of the world, kept returning the same constellation. Claude ran the actual selection logic against both locations and traced the real cause. The algorithm picked whichever constellation had the single brightest star anywhere above the horizon, so a handful of extremely bright stars like Vega and Sirius ended up winning for an entire hemisphere at a time, for months, regardless of where you were standing in it. The fix weights how close a constellation sits to your zenith alongside its brightness, and we checked the new logic against a spread of latitudes and months before I trusted it.

## Replacing fake data with real data

Around the same time I realized a lot of the data on the star detail card was fake. Magnitude was a random number generated on click. Class cycled through a fixed list based on array index. Claude sourced real magnitude, spectral class, distance and star type for all 248 stars across the 38 constellations, cross-checked against Wikipedia, and flagged a few duplicate-name stars that turned out to be the same physical star listed twice under different names. It also wrote the practical-use and cultural-significance copy for every constellation, looking past the Greek mythology to find things like Vega showing up as Zhīnǚ the Weaver Girl in Chinese tradition.

## Simplifying

After that I went through a simplification pass. I cut the Archives tab and the footer nav, since storing session history didn't fit where I want the app to go next: a "surprise me" mode that surfaces a random star or constellation with no date or location required, sitting alongside the targeted scan. I redesigned the export card so the screen behind it stays visible, added real click-to-close behavior, and brought every button in the app onto the same visual treatment and the same SNAKE_CASE copy convention instead of whatever felt right in the moment.

It's still a personal project I'm actively changing my mind about. The two-mode search idea isn't built yet. But it's more honest now about what it shows.

## Built with

- React, TypeScript, Vite, Tailwind
- `astronomy-engine` for real sky positions
- Open-Meteo for cloud cover
- A Vercel serverless function for the scan endpoint

## Running it locally

```
npm install
npm run dev
```

No API key needed. The astronomy is computed locally.
