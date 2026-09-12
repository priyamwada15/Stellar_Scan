# Stellar Scan — Notes

## Planned: replace session archive with two scan modes

The old "Archives" tab stored every constellation a session had scanned in
`localStorage` so it could be revisited later. That's being replaced with a
different model: instead of browsing history, the user picks how they want
to find a constellation/star up front, via two modes:

1. **Targeted scan** — set a date and location (the existing flow) to find
   what's actually visible tonight from that place.
2. **Surprise me** — a single button that surfaces a random star or
   constellation to learn about, no date/location input required.

Not implemented yet — this is a placeholder for future work.
