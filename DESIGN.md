---
name: Pedo Edhellen site
description: The Pedo Edhellen web pages, set as a scholarly page in the Lorien cloak, with one gold Elvish word as each page's figure and a ruled margin of numbered source notes.
colors:
  ground: "#2b352f"
  ground-deep: "#222a25"
  panel: "#35413a"
  line: "#56655a"
  line-soft: "#46544a"
  silver: "#e6ece3"
  silver-2: "#bccab9"
  silver-3: "#98a896"
  enamel: "#8fcf96"
  enamel-hi: "#a6dcab"
  enamel-ink: "#10251a"
  gold: "#dcb862"
  gold-dim: "#b8995a"
  gold-hover: "#ecd08a"
typography:
  specimen:
    fontFamily: "Marcellus, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3.5rem, 9vw, 6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Marcellus, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.15rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  lede:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.6
  note:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.55
  tengwar:
    fontFamily: "Alcarin Tengwar, serif"
    fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)"
    lineHeight: 1.4
rounded:
  leaf-sharp: "3px"
  leaf-round: "16px"
  plate: "6px"
spacing:
  gap: "clamp(2rem, 5vw, 4.5rem)"
  leaf-pad: "5rem"
  note-gap: "1.35rem"
  door-gap: "0.9rem"
components:
  press:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.leaf-sharp} {rounded.leaf-round} {rounded.leaf-sharp} {rounded.leaf-round}"
    padding: "0 1.3rem"
    height: "2.9rem"
  press-hover:
    backgroundColor: "{colors.enamel-hi}"
  quiet:
    backgroundColor: "transparent"
    textColor: "{colors.silver}"
    rounded: "{rounded.leaf-sharp} {rounded.leaf-round} {rounded.leaf-sharp} {rounded.leaf-round}"
    padding: "0 1.15rem"
    height: "2.9rem"
  masthead:
    backgroundColor: "{colors.ground-deep}"
    textColor: "{colors.silver-2}"
    height: "4.5rem"
  note-call-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ground-deep}"
---

# Design System: Pedo Edhellen site

## Overview

**Creative North Star: "The Annotated Page"**

The site is the Lorien cloak set as a scholarly page. It shares the visual family of the Pedo Edhellen app (src/styles.css) and the Lam Edhellen translator: a twilight green ground with a fine diagonal weave, silver text, gold for Elvish, enamel green only for things you press. What is new here is the apparatus. A reading column sits beside a ruled margin of numbered notes, and each page opens with one Elvish word at display scale as its figure, its words carrying superscript citation numerals that answer in the margin.

The mood is quiet, dense with provenance and unhurried. Trust comes from showing the source, not from decoration. Sections are separated by hairline rules, not boxes. There are no cards, no icon tiles and no eyebrow labels; the build uses none, and the world has no use for them.

**Key Characteristics:**
- One reading measure (64ch) plus a 17.5rem ruled margin of notes, in a two-column leaf.
- Gold is Elvish (and its footnote numerals); silver is everything read; enamel green is only what you press.
- A figure word in Marcellus gold, with Tengwar inked beneath and a pronunciation line, opens each page.
- Flat surfaces separated by 1px rules; the only shadow is under screenshot plates.
- Tokens inherited from the app: all colors, the font stack, `--leaf-r` and `--ease` are the app's values. The site adds the layout tokens (`--measure`, `--margin`, `--gap`) and the gold-dim and gold-hover tones; the app's `--panel-hi`, `--gold-soft`, `--rust` and `--spring` are not used here.

## Colors

A cool, mossy green-black ground, silver in three strengths, one gold and one enamel green. Nothing else.

### Primary
- **Enamel Green** (#8fcf96): the fill of the one press action on a screen, the current-page underline in the masthead, and the focus ring. Hover lifts to Pale Enamel (#a6dcab). Text on it is Enamel Ink (#10251a).

### Secondary
- **Elvish Gold** (#dcb862): Elvish words (specimen, `.elv`, entry headings), links, selection tint, and the lit state of a footnote. Dim Gold (#b8995a) is for footnote numerals, note counters and ladder numerals; link hover is Bright Gold (#ecd08a).

### Neutral
- **Cloak Ground** (#2b352f): page background, overlaid with a 45deg and -45deg 2px/5px weave at 1.6% white and 4.5% black.
- **Deep Ground** (#222a25): masthead, colophon, scrollbar track; the page's frame, one step darker than the ground.
- **Moss Panel** (#35413a): declared, inherited from the app, not currently used on the site.
- **Silver** (#e6ece3): primary text. **Silver 2** (#bccab9): ledes, notes, nav. **Silver 3** (#98a896): captions, metadata, pronunciation.
- **Cloak Line** (#56655a): borders on controls, plates and the review scale. **Soft Line** (#46544a): every hairline rule between leaves, notes and table rows.

### Named Rules
**The Three Voices Rule.** Gold means Elvish, enamel means press, silver means read. A color never takes a second job.

**The Press Is One Rule.** Each screen has one enamel `press` action; the other doors are `quiet` outlined.

## Typography

**Display Font:** Marcellus (with Cormorant Garamond, Georgia)
**Body Font:** Figtree (with system-ui)
**Script:** Alcarin Tengwar (self-hosted woff2), for the Tengwar line only.

**Character:** a classical inscriptional serif for Elvish and headings against a clean humanist sans for reading. Marcellus and Figtree load from Google Fonts in the shared page shell; Tengwar loads locally.

### Hierarchy
- **Specimen** (400, clamp 3.5-6rem, 1.0): the figure word, gold. On names, entry heads use clamp 2.4-3.6rem.
- **Headline** (400, h1 clamp 1.7-2.45rem / h2 clamp 1.6-2.15rem, 1.2): page and section titles in Marcellus; h1 capped at 30ch.
- **Title** (600, 1.15rem, 1.35): h3 in Figtree.
- **Body** (400, 1.0625rem, 1.65): reading text, measure 64ch. **Lede** 1.2rem in Silver 2, 54ch.
- **Note** (400, 0.9rem, 1.55): margin notes and captions; the Elvish term inside a note is 1.25rem gold Marcellus on its own line.
- **Label** (600, 0.72em superscript for calls; 0.8rem numeral for note counters; 0.97rem pronunciation at 0.02em tracking): sentence case, no uppercase labels.

### Named Rules
**The Figure Word Rule.** Every page opens with one Elvish word or name in gold specimen type, its Tengwar beneath in Silver 2, and how to say it.

**The Cited Word Rule.** An Elvish word that needs a source takes a superscript numeral; its note sits in the margin beside it.

## Layout

A centered `.wrap` of width measure + margin + gap (about 64ch + 17.5rem + clamp(2rem, 5vw, 4.5rem)), 20px minimum side padding with safe-area insets. Each page is a stack of `leaf` sections, each a two-column grid: reading column `minmax(0, 64ch)` and a 17.5rem margin separated by the gap. The margin has a 1px Soft Line on its left and 1.25rem inner padding, aligned to the top. A `wide` leaf lets its content span both columns (used for plates). Leaves are 5rem top and bottom and divided by a hairline; the closing leaf takes 6rem below. The same two-column grid is reused by lexicon entries, the three ways in on get, plate rows and the colophon. Alignment to this one measure is the layout's discipline.

Responsive: at 920px and below the margin collapses beneath the text (`--margin` goes to 100%) with its left rule turned into a top rule and 1.6rem space above; the course scale goes from 8 to 4 columns; label rows lose their middle column. At 560px and below leaf padding drops to 3rem, the masthead nav wraps on its own full-width row, the doors fill the width, and the course table stacks into grid rows. Screen widths checked in review: 1440 and 390.

### Components detail: the doors, the scale, the ladder
- **Doors** are a list, not cards: each item is a button at min-width 19rem (space-between, arrow icon) with a Silver 3 one-line explanation beside it; gap 0.9rem.
- **Scale** (course): eight columns under a 1px Cloak Line rule, each with a 0.9rem tick and a Marcellus 1.5rem numeral.
- **Ladder** (translator): ordered ratings with Marcellus counter numerals in Dim Gold, divided by hairlines.

## Elevation & Depth

Flat and tonal. Depth is conveyed by Deep Ground for frame (masthead, colophon) against Cloak Ground for the page, and by 1px rules. The single shadow belongs to screenshot plates.

### Shadow Vocabulary
- **Plate** (`box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.6)`): beneath screenshots only, with a 1px Cloak Line border.

### Named Rules
**The Rules Not Boxes Rule.** Separate with a hairline in Soft Line; do not enclose in a filled or shadowed container.

## Shapes

The leaf corner is the family signature: `3px 16px 3px 16px` (sharp top-left and bottom-right, round the other pair) on every press and quiet action. Screenshot plates are 6px, bordered. Focus ring is 2px enamel with 3px offset and 3px radius. Footnote calls have a 3px radius on hover. Everything else is square and ruled. Icons are 1em outline SVGs, stroke 1.8, round caps.

## Components

### Buttons
- **Press:** Enamel Green fill, Enamel Ink text, 600 weight, 2.9rem min-height, leaf corner. Hover: Pale Enamel and 1px lift (250ms, ease). 
- **Quiet:** transparent, 1px Cloak Line border, Silver text; hover brightens the border to Silver 3 with a 3% white wash.
- **More link:** gold 600 inline link with an arrow that shifts 3px right on hover.

### Navigation
Masthead on Deep Ground, 4.5rem tall: leaf mark in Marcellus 1.35rem, then plain text links in Silver 2 (0.97rem, 500); the current page is Silver with a 2px enamel underline. The press action sits right (`margin-left: auto`). On mobile the links drop to their own row.

### Footnote apparatus
Calls are 0.72em superscript Figtree 600 in Dim Gold; on hover or when `is-lit` they invert to Deep Ground text on Gold. The linked note in the margin gains a gold rule and Silver text (rule transitions in 300-500ms). Notes are a numbered, auto-counted list, each with a hairline drawn at its top; a section that continues numbering sets the counter offset.

### Plates
Screenshots in a `figure` with 6px radius, Cloak Line border and the plate shadow, lazy-loaded with a narrow crop swapped in at 560px. The caption sits in the margin column, bottom-aligned, with a left rule.

### Tables, labels and lexicon entries
Plain tables use Soft Line row rules and tabular numerals; label rows pair a small provenance mark with a bold name and gloss. Entries (names) put a gold specimen head, Tengwar, a Marcellus 1.45rem gloss and a parts list, with notes beside.

### Motion
Ease is `cubic-bezier(0.16, 1, 0.3, 1)`. The figure word settles on load: letter-spacing from 0.06em to normal over 1.2s, the second word delayed 0.12s. Hover transitions are 200-300ms; smooth scroll on anchors. Under `prefers-reduced-motion` all animation and transition are off.

## Do's and Don'ts

### Do:
- **Do** open each page with one gold Elvish figure word, its Tengwar and a pronunciation line.
- **Do** put sources in the margin of notes and link them with superscript numerals.
- **Do** keep one enamel `press` per screen and draw other actions as `quiet`.
- **Do** separate with 1px Soft Line rules and keep text to the 64ch measure.
- **Do** keep Marcellus for Elvish and headings, Figtree for reading, and honor reduced motion.

### Don't:
- **Don't** use cards, icon tiles, glows or filled containers for grouping; use the leaf, the rule and the list.
- **Don't** spend gold on anything that is not Elvish, a citation or a link, or enamel on anything not pressable.
- **Don't** add shadows beyond the plate.
- **Don't** restyle the shared tokens here; change them in the app and carry them across.
