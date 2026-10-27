# categori.se: portfolio and service content refresh

Prepared 27 October 2026.

## Integration boundary

The accessible `aaronkyle/categorise` default branch contains an older Observable homepage. It does not match the currently deployed homepage reviewed at https://categori.se/. These files are a content proposal and reading-order preview, not a deployment or a replacement for the live build.

- `content.json`: structured homepage copy, four full case studies, services, supporting project descriptions and repository destinations.
- `preview.html`: self-contained review of that exact copy. It adds no model calls, account functions or external scripts.
- Preserve the live site's current assets, authentication and archive routes when integrating. Do not deploy this repository's older homepage over the live site.

## Apply to the current build

1. Locate the source and deployment workflow that actually produce the live homepage; compare the current live headline before editing.
2. Replace the introductory copy and service overview with the supplied content. Use Work, Services, About, Notes and Contact navigation; connect Notes to the existing archive rather than inventing a route.
3. Feature OpenGeo Studio, E&S Review and Veggie.Farm, with AI Studio as the fourth full case study. Use each summary on its card and the need/approach/workflow/benefit on its detail view. Use existing verified screenshots or capture actual synthetic/public workflows.
4. Add service links from each case study. Keep implementation status near the project action and retain detailed limits on its project page.
5. Rename the public `esia-ai` card to E&S Review. Route public source links to `categori-se/es-risk-management-core`, not the private `esia-analysis` repository.
6. Route AI Studio visitors to its public synthetic tour and the public Examples, Core and Contracts repositories. Keep private operational repositories out of public source buttons.
7. Link OpenGeo to its public community source and distinguish its public demo from authenticated Studio. Link Veggie.Farm to its current public source.
8. Add the categori-se organization beside Aaron's GitHub profile in the footer. Keep historical notebooks, photography and travel material discoverable through the existing archive; do not relabel them as maintained apps.
9. Preview narrow and wide layouts, keyboard navigation, card-to-detail routes and mail links. Run the actual build's existing checks. Check the deployment artifact before any live release.

## Editorial boundaries

- Berkshire garden digital twins are an evolving effort. The current public Berkshire Botanical Garden reconstruction is incomplete and illustrative. No institutional partnership, live sensor integration, measured plant-health improvement or validated growth prediction is asserted.
- AI Studio is being built to coordinate the team's local workers and online projects. Comparing models within a consistent workflow is a development objective; the public tour uses mock assistants and the operating route is specifically configured. Retaining project context does not imply identical model behavior.
- OpenGeo is for the wider environmental and social community: consultants, financiers, borrowers, communities, stakeholders and governments. Shared methods do not make private datasets public or grant data rights.
- E&S Review preserves evidence and accountable professional review. Software verification is separate from professional acceptance or AI assessment accuracy.
- Supporting project source links identify the repository's role. Map Folio's linked repository is the original experiment; its current publication is on OpenGeo.Tools. Do not present the original as the complete current Studio source.

## Evidence and links

Public source destinations were confirmed through the connected GitHub repository metadata and README files. Product destination URLs come from the live hub and project READMEs; no authenticated sign-in, model execution or production deployment was exercised. Repository existence is separate from testing every external website.

## Review checks performed

JSON parsing; unique case-study IDs; required content fields; HTTPS/mail/internal link validation; no private repository destinations in public links; HTML parser check; exact case-study and link inclusion in the preview. The deployed application's build and visual checks require its current source.
