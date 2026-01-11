1. Pure browser heuristics

This is a real, buildable approach.

What you can do locally in one HTML page

Unzip the PPTX with JSZip.

Parse slide XML for text runs, font names, font sizes, colors, shape fills, and positions.

Extract images from relationships.

Infer a design token set from the deck.

Infer layout using geometry and grouping rules.

Generate HTML and CSS that follows the deck’s design DNA.

This can produce a strong bespoke site, but it will never have the same “creative editorial” feel as Manus unless you put a lot of human-like rules into the heuristics.

It is engineering, not magic.

What it cannot do as well as Manus

Invent “Problem, Risk, Answer” framing unless you explicitly build rules for it.

Rewrite hierarchy or reorganize content with taste beyond the rules you wrote.

Make a dozen subtle aesthetic decisions that are not strictly implied by the slide data.

2. Browser plus a local model

If you want Manus-like interpretation without uploads, you would need local inference.

Reality check

Running a strong model inside the browser is possible but heavy.

You would likely rely on WebGPU, WASM, or a local server.

Model quality will be below Manus unless the user has a powerful machine and you bundle a large model.

This violates the “simple one HTML page” vibe, but it keeps privacy.

3. Browser tool that calls an API

This would be the closest to Manus quality.
But it violates your privacy rule unless it is opt-in and clearly labeled.

So yes, it is doable in HTML.

But the reason Manus can produce that “index_gold.html” style output is that it is doing a creative authoring step that a pure browser parser does not magically get for free.

The cleanest mental model

Manus pipeline

Parse PPTX

Understand slide intent

Choose structure and hierarchy

Write a designed website

Browser-only pipeline

Parse PPTX

Infer structure and hierarchy from geometry and patterns

Write a designed website

Both are possible. The difference is the “understand intent” piece.

If you want browser-only and still want Manus-like results, you have to replace “LLM taste” with one of these

Very strong heuristics and layout composition rules

A local model option

An optional “enhance with AI” step that is explicitly opt-in

The actual blocker is not HTML

The blocker is this question
How do you create the editorial and design decisions that Manus makes without using a model or a human.

That is solvable, but it means you are building a conversion engine that is closer to a layout system than a file exporter.

Straight answer

Yes, you can build a single HTML page that takes a PPTX and outputs a bespoke scrollytelling site.

You just cannot expect the same quality as Manus unless you

encode taste into rules, or

bring a model into the loop.

If you want, I can rewrite your project spec into a “browser-only, no templates, no AI” version that is honest about what it will do, while still hitting your acceptance criteria like Titillium Web and palette matching.

SO, I like 1. Pure browser heuristics

Good. Pure browser heuristics can get you very close to the Manus vibe if you treat it like a design system extractor plus a layout composer, not a slide exporter.

The build you want in one sentence

A single-page web app that unzips PPTX, extracts design DNA plus content blocks, composes web sections using geometry rules, and downloads a ZIP with index.html, assets/, and ACCESSIBILITY_REPORT.txt.

What you build, in three modules
Module A. PPTX reader

Goal is to produce a clean, predictable JSON model.

What it must extract

Slides, order, and page size

Text runs with

font family

font size

bold, italic

color

Shapes with

fill color

stroke color and width

corner radius if present

bounding box in slide coordinates

Images with

relationship id to actual file

bounding box

file extension, and EMF WMF detection

Grouping hints

elements that overlap

elements with similar y bands

elements inside filled rectangles

Implementation basics

Use JSZip to unzip PPTX

Parse ppt/slides/slideN.xml

Parse ppt/slides/_rels/slideN.xml.rels for image relationships

Parse ppt/theme/theme1.xml and ppt/presentation.xml for theme colors and slide size

Module B. Design DNA extractor

Goal is to generate a deck-specific design system every time.

Outputs

Font system

primary font, secondary font

CSS variables and font stacks

Google Fonts import if available

mapping report if not

Color token system

background, surface, text, muted, primary, secondary, border

derived from theme plus dominant fills

contrast enforcement with logging

Rhythm

base spacing unit from common distances

container max width and gutters

default card radius, border weight, shadow usage based on detected shapes

This is where bespoke comes from. If this is good, the site feels like the deck even when layouts shift.

Module C. Section composer

Goal is to turn each slide into a readable section with flow.

Do not “pick templates.” Instead do this per slide

Build a reading order

cluster by y bands

within a band, sort by x

preserve groups where a filled shape sits behind text

Detect layout intent from geometry

hero candidate if there is a dominant title plus a dominant background image or full-bleed fill

split if content is strongly left right separated

grid if repeated blocks exist

gallery if multiple images are present

callouts if text sits on multiple similar filled rectangles

Render using a small set of layout primitives only

stack, split, grid, overlay, gallery
These are CSS mechanics, not a menu of templates.

Apply deck tokens consistently

background and surfaces

type scale and line length

spacing and section rhythm

Add web affordances

optional scroll progress

reveal-on-scroll that respects reduced motion

lazy loading images

Hard rules that keep it from feeling like a slide export

Never position everything absolutely.

Only use absolute positioning for overlays on a background media block.

Prefer a single consistent container and spacing rhythm across sections.

Promote hierarchy. One slide title becomes an H2 or H1. Body becomes paragraphs or cards.

Convert bullets to lists or card sets, not line-broken text.

Handling EMF and WMF cleanly

Detect extensions from image target in rels.

Skip EMF and WMF files in output.

Insert a placeholder note in the section only if the missing image likely carried meaning, otherwise skip silently in the HTML but log it.

Log warnings in UI plus ACCESSIBILITY_REPORT.

Accessibility defaults in generated site

Skip link

Header, main, section landmarks

Heading normalization

Visible focus styles

Reduced motion support

Alt text rules exactly as you wrote

What Copilot can do for you here

Copilot is perfect as an implementer if you feed it small, bounded tasks.

Use it like this

One file per module

One prompt per function

You review output for “web-first” and “no absolute slide rebuild”

Copilot prompt pack you can paste into your repo issues

PPTX unzip and slide list
Write browser-only JS using JSZip to load a user selected PPTX file, list slide XML files in order, and expose a function getSlideXml(n) returning XML text. No Node APIs.

Slide size and theme colors
Parse ppt/presentation.xml and ppt/theme/theme1.xml to extract slide size and theme color scheme. Return a normalized RGB map.

Extract text runs
Parse a slide XML and return text blocks with runs including font name, size, bold, color, and bounding box. Use robust XML namespace handling.

Extract shapes and fills
Parse p:sp nodes and return rectangles and other shapes with bounding box, fill color, stroke, and corner radius when present.

Extract images via relationships
Parse slide rels, map rId to actual media target, detect file extension, and return image blocks with bbox and asset path.

Build deck design tokens
Given all extracted fonts and colors, compute primary and secondary font, a type scale, and color tokens with WCAG AA contrast checks. Provide mapping to Google Fonts when possible and log mapping decisions.

Compose section layout
Given one slide model and deck tokens, output HTML for a section using only CSS grid and flex with responsive rules. No absolute positioning except overlay on backgrounds.

Generate site shell and accessibility report
Generate index.html with semantic landmarks, skip link, focus styles, reduced motion support, and write ACCESSIBILITY_REPORT.txt listing fonts, mappings, contrast adjustments, and skipped EMF WMF assets.

ZIP export
Package index.html, assets extracted from ppt/media, and ACCESSIBILITY_REPORT.txt into a downloadable ZIP using JSZip.

Your fastest path to a working v1

Build in this order

PPTX unzip, slide list, image extraction, ZIP export

Render a basic site with stack layout only

Add font mapping and Google Fonts loading

Add color token extraction plus contrast enforcement

Add layout inference for split, grid, overlay, gallery

Add polish like reveal, progress, and consistent rhythm
