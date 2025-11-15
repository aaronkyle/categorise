---
style: styles/categori-se.css
toc: false
---


  ```js
        // Data for page content
        const pageContent = {
            "introduction": {
                "title": "Touchdown!",
                "text": "<p>You've landed at <strong>categori.se</strong>&mdash;a container site for several independent web projects.<br />\n\nThanks for visiting this obscure corner of the web<a href=\"https://www.nbcnews.com/tech/internet/internet-world-wide-web-are-not-same-thing-n51011\">*</a>.</p>\n\n<p></p><p>Now that you're here, it'd be great if you would stay awhile and poke around.</p>"
            },
            "closing": {
                "title": "Tack för Besöket",
                "text": "<p>Thanks for visiting <strong>categori.se</strong>.<br> <p>Please <a href='mailto:aaron@categori.se' style='color: #7e93a5ff;''>reach out</a> if you would like to collaborate on a research project—especially those related to <strong>OpenSource software development</strong> or <strong>applied environmental and social science research.</p>"
            }
        };
        //display(pageContent )
  ```

  ```js
        // Data for the projects/cards
        const projectData = [
            {
                "title": "categori.se",
                "repo": "categori.se",
                "description": "The generated output of a now lost Pelican template. Represents many design techniques and page elements I hope to learn how to recreate myself—though first I need just to retake control of the site.",
                "frontEndUrl": "https://categori.se",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/categori.se?region=us-east-1&bucketType=general&tab=objects",
                "imageUrl": ""
            },
            {
                "title": "teknik",
                "repo": "teknik.categori.se",
                "description": "Partially archival. Minimal built site that I am reverse engineering as a learning exercise.",
                "frontEndUrl": "https://teknik.categori.se",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/teknik.categori.se?region=us-east-1&bucketType=general&tab=objects",
                "imageUrl": ""
            },
            {
                "title": "foto",
                "repo": "foto.categori.se",
                "description": "Archival.",
                "frontEndUrl": "https://foto.categori.se",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/foto.categori.se?region=us-east-1&bucketType=general&tab=objects",
                "imageUrl": ""
            },
            {
                "title": "travelogue",
                "repo": "travelogue.categori.se",
                "description": "Archival.",
                "frontEndUrl": "https://travelogue.categori.se",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/travelogue.categori.se?region=us-east-1&bucketType=general&tab=objects",
                "imageUrl": ""
            },
            //{
            //    "title": "aaron-kyle.com",
            //    "repo": "aaron-kyle.com",
            //    "description": "Vanity landing page doubling as online CV (out-of-date).",
            //    "frontEndUrl": "https://aaron-kyle.com",
            //    "githubUrl": "",
            //    "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/aaron-kyle.com?region=us-east-1&bucketType=general&tab=objects",
            //    "imageUrl": ""
            //},
            {
                "title": "applied-anthro.com",
                "repo": "applied-anthro.com",
                "description": "Front end to the 'social-development' repo and a mixed bag of pages from past builds. Lots of clean-up needed.",
                "frontEndUrl": "https://applied-anthro.com/",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/applied-anthro.com?region=us-east-1&bucketType=general&tab=objects",
                "imageUrl": ""
            },
            {
                "title": "iam-research",
                "repo": "iam-research",
                "description": "GitHub.",
                "frontEndUrl": "https://github.com/aaronkyle/iam-research",
                "githubUrl": "https://github.com/aaronkyle/iam-research",
                "s3Url": "",
                "imageUrl": ""
            },
            {
                "title": "umni.design",
                "repo": "umni.design",
                "description": "Anna's business card.",
                "frontEndUrl": "https://umni.design/",
                "githubUrl": "",
                "s3Url": "https://ap-southeast-1.console.aws.amazon.com/s3/buckets/umni.design?region=ap-southeast-1&bucketType=general",
                "imageUrl": ""
            },
            {
                "title": "dataviz",
                "repo": "dataviz",
                "description": "GitHub.",
                "frontEndUrl": "https://github.com/aaronkyle/dataviz/blob/main/README.md",
                "githubUrl": "https://github.com/aaronkyle/dataviz",
                "s3Url": "",
                "imageUrl": ""
            },
            {
                "title": "bhutan-spatial-data-sources/",
                "repo": "bhutan-spatial-data-sources/",
                "description": "",
                "frontEndUrl": "https://s3.amazonaws.com/data.visualization/bhutan-spatial-data-sources/dist/index.html",
                "githubUrl": "",
                "s3Url": "",
                "imageUrl": ""
            },
            {
                "title": "ICIMOD land cover nepal",
                "repo": "ICIMOD_land_cover_nepal",
                "description": "GitHub.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/ICIMOD_land_cover_nepal_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/ICIMOD_land_cover_nepal_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/ac2a53bff67ef946d1da659ad52303de0c6dff92d1f07aaf89df41ade3f7bff8.jpg"
            },
            {
                "title": "nepal household facilities 2011",
                "repo": "nepal-household-facilities-2011",
                "description": "An exported version of an Observable notebook.",
                "frontEndUrl": "https://s3.amazonaws.com/data.visualization/nepal-household-facilities-2011/index.html",
                "githubUrl": "",
                "s3Url": "https://us-east-1.console.aws.amazon.com/s3/buckets/data.visualization?region=us-east-1&bucketType=general&prefix=nepal-household-facilities-2011/&showversions=false",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/2649d3af460e10b6bcf121f2ef6438190c1f2917d97740e5f05ee5e976310576.jpg"
            },
            {
                "title": "massgis aerial photography",
                "repo": "massgis-aerial-photography",
                "description": "GitHub.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/massgis-aerial-photography_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/massgis-aerial-photography_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/9b0e9c4760f21d19cdec2ba0e3ba2e5d848637eb84e260936f1d6959159dd1e2.jpg"
            },
            {
                "title": "3Band CIR 8Bit Imagery",
                "repo": "3Band_CIR_8Bit_Imagery",
                "description": "GitHub + S3.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/3Band_CIR_8Bit_Imagery_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/3Band_CIR_8Bit_Imagery_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/897ad4812ad00f871929c9e9ecdc81e0ad83861b7b4e3cd08b879a559feb348d.jpg"
            },
            {
                "title": "NOAA sea level rise",
                "repo": "noaa-sea-level-rise",
                "description": "GitHub.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/noaa-sea-level-rise_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/noaa-sea-level-rise_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/cfb35958844733c576af24b3c05c30bd4b17ca7d7fe203a8dc0ecd8ae0319efa.jpg"
            },
            {
                "title": "NOAA urban heat island mapping",
                "repo": "noaa-urban-heat-island-mapping",
                "description": "GitHub + S3.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/noaa-urban-heat-island-mapping_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/noaa-urban-heat-island-mapping_src",
                "s3Url": "https://s3.amazonaws.com/data.visualization/noaa-urban-heat-island-mapping/dist/index.html",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/3284ac73992f52c6ade219c6c662df140ffc6801eb6789085ce11430e1c17064.jpg"
            },
            {
                "title": "PAD-US",
                "repo": "PAD-US",
                "description": "GitHub.",
                "frontEndUrl": "https://aaronkyle.github.io/dataviz/PAD-US_dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/PAD-US_src",
                "s3Url": "",
                "imageUrl": ""
            },
            {
                "title": "key biodiversity areas",
                "repo": "key-biodiversity-areas",
                "description": "Mapping the World Database of Key Biodiversity Areas.",
                "frontEndUrl": "https://s3.amazonaws.com/data.visualization/key-biodiversity-areas/dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/kba_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/28f42926010c26a7b59c907d0afbb1f94ba23431144228238a61152361c107e4.jpg"
            },
            {
                "title": "WDPA",
                "repo": "wdpa",
                "description": "Mapping the World Database of Protected Areas.",
                "frontEndUrl": "https://s3.amazonaws.com/data.visualization/wdpa/dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/wpda_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/318c62f7eaa7e42d4eb675ca8bb629e0406e6c3edfd0c733cb5059873b0ce5b2.jpg"
            },
            //{
            //    "title": "protected areas",
            //    "repo": "protected-areas",
            //    "description": "Mapping the Protected Plant World Database on Protected Areas and BirdLife International Key Biodiversity Areas datasets.",
            //    "frontEndUrl": "https://s3.amazonaws.com/data.visualization/protected-areas/dist/index.html",
            //    "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/protected_areas_src",
            //    "s3Url": "",
            //    "imageUrl": ""
            //},
            {
                "title": "World Bank gender data portal",
                "repo": "world-bank-gender-data-portal",
                "description": "A long-form exploration of consuming data from the World Bank's Gender Data Portal and visualizing it using Observable Plot.",
                "frontEndUrl": "https://s3.amazonaws.com/data.visualization/world-bank-gender-data-portal/dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/dataviz/tree/main/world-bank-gender-data-portal_src",
                "s3Url": "",
                "imageUrl": "https://static.observableusercontent.com/thumbnail/7a15abc0399834ca2c82587ec6c701523dfc85a75567cbe10acb6e9c99f18324.jpg"
            },
            {
                "title": "map-folio",
                "repo": "map-folio",
                "description": "A collaborative experiment with Saneef Ansari in creating maps using SVG, HTML, and D3.js. Observable Framework code hosted on GitHub.",
                "frontEndUrl": "https://aaronkyle.github.io/map-folio/dist/index.html",
                "githubUrl": "https://github.com/aaronkyle/map-folio",
                "s3Url": "",
                "imageUrl": ""
            },
            {
                "title": "surveyslate",
                "repo": "surveyslate",
                "description": "Survey generator created in collaboration with Tom Larkworthy and Saneef Ansari. Built on Observablehq and deployed to AWS.",
                "frontEndUrl": "https://observablehq.com/@categorise/surveyslate-docs",
                "githubUrl": "",
                "s3Url": "",
                "imageUrl": ""
            },
        ];
        //display(projectData)
```

```js
    // Data for navigation links
       const navLinks = [
        { "name": "Hej!", "link": "#intro" },
        { "name": "Utforska", "link": "#projects" },
        { "name": "Vi Ses", "link": "#closing" }
      ];
```

```js
const pageNav = html`<nav class="categori-page-nav">
  <div class="categori-page-nav__inner">
    <!--<span class="categori-page-nav__brand">categori.se</span>-->
    <span class="categori-page-nav__brand"></span>
    <div class="categori-page-nav__links">
      ${navLinks.map(d => html`<a href=${d.link}>${d.name}</a>`)}
    </div>
  </div>
</nav>`;

//display(pageNav);
```

```js
const hero = html`<section class="full-bleed hero" id="top">
  <div class="hero__content">
    <header>
      <h2 class="hero__title">categori.se</h2>
    </header>
    <p class="hero__tagline">design, prototyping &amp; development hub</p>
    <nav class="hero__nav">
      ${navLinks.map(
        d => html`<a href=${d.link}>${d.name}</a>`
      )}
    </nav>
  </div>
</section>`;

//display(hero);
```

<!--
## hej!
-->

```js
const introDiv = document.createElement("div");
introDiv.innerHTML = pageContent.introduction.text;

const introSection = html`<section id="intro" class="categori-section categori-intro">
  <h1>${pageContent.introduction.title}</h1>
  ${introDiv}
</section>`;

display(introSection);
```
<!--
## utforska
-->

```js
function projectCard(p) {
  const hasGithub = !!p.githubUrl;

  return html`<article class="categori-card">
    <h3 onclick=${() => window.open(p.frontEndUrl, "_blank")}>${p.title}</h3>
    <div class="categori-card__content">
      ${p.imageUrl
        ? html`<img
            class="categori-card__image"
            src=${p.imageUrl}
            alt=${p.title}
            onclick=${() => window.open(p.frontEndUrl, "_blank")}
          >`
        : null}
      ${hasGithub
        ? html`<div class="categori-card__icons">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
              alt="GitHub"
              title="GitHub Repository"
              onclick=${() => window.open(p.githubUrl, "_blank")}
              style="filter: invert(0.9) contrast(1) brightness(0.55) saturate(8) hue-rotate(-100deg);"
            >
          </div>`
        : null}
    </div>
    <p class="categori-card__description">${p.description}</p>
  </article>`;
}


const projectsSection = html`<section id="projects" class="categori-projects">
  <!--<h1 class="categori-projects__heading">Utforska projekten</h1>-->
  <h1 class="categori-projects__heading">&nbsp;</h1>
  <div class="categori-card-container">
    ${projectData.map(projectCard)}
  </div>
</section>`;
//display(projectsSection);
```
<!--
## vi ses
-->

```js
const closingDiv = document.createElement("div");
closingDiv.innerHTML = pageContent.closing.text;

const closingSection = html`<section id="closing" class="categori-section categori-closing">
  <h1>${pageContent.closing.title}</h1>
  ${closingDiv}
</section>`;

//display(closingSection);
```

```js
const page = html`<div class="categori-page">
  ${pageNav}
  ${hero}
  ${introSection}
  ${projectsSection}
  ${closingSection}
</div>`;

display(page);
```