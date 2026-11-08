# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone curious about Elvish, for any reason: a Tolkien reader who wants to understand the languages, someone who
searched "Elvish language" wondering whether anyone actually wrote one, a D&D player giving their Elf character real
lines, or someone at the start of a deep interest in Tolkien's languages. Most arrive knowing little; many are
skeptical that Elvish is a real, learnable thing.

## Product Purpose

Pedo Edhellen ("Speak Elvish!") teaches Tolkien's Sindarin and Quenya, plus a Roleplay phrasebook, in short lessons
with spaced review. Its companion, Lam Edhellen ("the Elvish tongue"), is a translator between English and Elvish.
The website exists so a visitor understands what these are and why they can be trusted, then chooses a way in:
open the web app, download the Windows app, or try the translator. Success is understanding first; opening the
translator or app is the hoped-for next step.

## Positioning

Honest to Tolkien. Every word is labelled as Tolkien's own, built from his words, from his early drafts, or
fan-made, and every claim that he left no word for something is checked against Eldamo across every stage of his
languages. The translator refuses rather than invents, and says why. The course is built on spacing and retrieval
research, with a streak that has five rest days a week instead of guilt.

## Operating Context

- The learning app runs as a Windows desktop app (portable .exe, unsigned), an installable web app (PWA, works
  offline), and a private claude.ai page.
- The translator is public at https://hoodedhacker32.github.io/elvish-translator/.
- The site is served locally for now (tools/serve-site.mjs, http://localhost:5196) with the download at
  /download/PedoEdhellen-portable.exe and the web app at /app/. It should work as a static site when hosted later.
- The site has several pages, not one long page.

## Capabilities and Constraints

- Courses: Sindarin (19 lessons), Quenya (16), Roleplay phrasebook (7). Exercises: recognition, typing, sentence
  tiles, stress, plural drills, matching, Tengwar reading. Spaced review, optional daily challenges, goals quiz,
  reading room of Tolkien's lines, notebook, local profiles, one daily reminder.
- Translator: English to Sindarin or Quenya and back, trust ratings, sources, Tengwar, plain pronunciation, all of
  Tolkien's known lines searchable, everyday phrases with literal meanings.
- Names: Pedo Edhellen = "Speak Elvish!" (pedo "speak!", edhellen "Elvish"); Lam Edhellen = "Elvish tongue"
  (lam "tongue, language"); Sindarin = "Grey-elven"; Quenya = "Elvish, High-elven", oldest sense "speech";
  Tengwar = "letters" (plural of tengwa). All verified in Eldamo.
- Phone use needs the web app hosted online; there is no native phone app yet.

## Brand Commitments

- Names: Pedo Edhellen (the course) and Lam Edhellen (the translator), always explained with their meanings.
- Every Elvish word shown must be correct and labelled honestly; Tengwar and pronunciation come from the
  translator's own engine.
- Credits required: Eldamo by Paul Strack (CC BY 4.0); Alcarin Tengwar by Toshi Omagari (SIL OFL); unofficial fan
  project, not affiliated with the Tolkien Estate.

## Evidence on Hand

- Real screenshots of the learning app and the translator may be used (to be captured from the actual apps).
- Research basis with sources: docs/RESEARCH.md (Dunlosky 2013, Cepeda 2008, Kim & Webb 2022, Webb 2005,
  Silverman & Barasch 2023, Kuo et al., Monge Roffarello CHI 2023).
- No users, testimonials, ratings, download counts or press exist. None may be invented.

## Product Principles

1. Honesty over impressiveness: say what is Tolkien's and what is not, every time.
2. Understanding first: a visitor should leave knowing what Elvish is and what these tools do.
3. Every door open: translator, web app and download are all reachable from anywhere, without pressure.
4. Calm engagement: no guilt, urgency or manipulation, on the site or in the apps.
