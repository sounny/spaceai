# AI in Space Interactive Poster Session

This repository contains the skeleton website for the **AI&nbsp;in&nbsp;Space** interactive poster session hosted by the International&nbsp;Space&nbsp;University (ISU).  The site is designed for deployment on GitHub&nbsp;Pages and follows ISU’s branding guidelines (blue and white palette and clean sans‑serif typography)【691809823335624†L62-L76】.  It is intended as a starting point that student teams can fork and extend with their own interactive posters.

## How to use this repository

1. **Fork the repository.**  Each team should create their own fork so that their changes don’t interfere with other groups.  Rename your fork using your team number or topic, e.g. `team-1-engineering`.
2. **Create a subdirectory for your poster.**  Inside your fork, add a folder under `posters/` named after your topic or team.  Place a single `index.html` file (plus any assets such as scripts, style sheets, data or images) inside this folder.  Your poster must be a single HTML page – scrolling down is allowed, but multiple pages are **not**.  The main `index.html` file in the root of the repository should not be modified except to add links to your poster.
3. **Use vanilla HTML, CSS and JavaScript.**  Frameworks such as React or Vue are not allowed.  Feel free to include libraries like [Chart.js](https://www.chartjs.org/), [Leaflet](https://leafletjs.com/) or D3.js to add interactivity.  If you include external libraries, use a CDN (Content Delivery Network) link.
4. **Follow the design guidelines.**  Use ISU’s blue (RGB 0 20 84) and white palette【691809823335624†L62-L76】.  For typography, choose a legible sans‑serif font such as Calibri【691809823335624†L122-L128】.  Keep your layout clean and uncluttered – leave space between sections and avoid overcrowding with too much text.
5. **Tell a story.**  Your poster is a narrative tool, not just a data dump.  Start with a clear problem statement, explain your methods and findings, and finish with the impact and next steps【85768455204319†L131-L168】.  Use visuals (charts, diagrams, timelines, maps) to illustrate your story【85768455204319†L108-L124】.  Avoid jargon and tailor the level of detail to a broad audience【85768455204319†L50-L87】.  Keep your message concise – focus on two or three key findings【541728466999463†L146-L148】.
6. **Use accessible fonts and sizes.**  Titles should be at least 40‑80 px tall, section headers 24‑28 px, main text 14‑18 px, and footnotes or captions 8‑12 px【924871956520733†L85-L93】.  Provide sufficient contrast between text and background colours for readability.
7. **Submit your poster by the deadline.**  Final posters are due by **12 November 2025** so that we can review them before the main event.  Open a pull request from your fork to this repository to submit your poster.

## Repository structure

```
ai_in_space_posters/
├── index.html          # Landing page for the poster session
├── style.css           # Shared styles for the site
├── scripts/
│   └── script.js       # Shared JavaScript (optional)
├── posters/            # (Students place their posters here in subfolders)
└── assignments.csv     # CSV listing student assignments to topics
```

The `assignments.csv` file contains the student list and their assigned topic.  This file is generated from the student tracker and can be used to automate the creation of team pages or badges.

## Further reading

* **Effective poster design.**  Jane E. Miller’s paper “Preparing and Presenting Effective Research Posters” emphasises that a good poster should centre on two or three key findings and translate complex results into simplified charts and bullet points【541728466999463†L140-L148】.  Don’t copy paragraphs from your report – your poster is a **visual summary**.
* **Storytelling in science.**  The article *“Bridging the Gap: Strategies for Communicating Complex Science with Posters”* notes that understanding your audience, simplifying your message, and telling a compelling story are key to an effective poster【85768455204319†L34-L43】.  It recommends using diagrams, infographics and a clear narrative arc (problem, solution, impact)【85768455204319†L108-L168】.
* **Poster design guidelines.**  Brown University’s poster guide suggests large title fonts, smaller body text and high‑contrast colours【924871956520733†L85-L93】.  It also reminds you to use high‑resolution images (300 ppi) to avoid pixelation when printed【924871956520733†L101-L107】.

If you have questions or run into problems, please contact the organising team via email.
