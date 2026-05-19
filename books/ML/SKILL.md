# Machine Learning Book Authoring Skill

Use this guide when adding or updating pages under `ML/`. The goal is a complete, interactive book, not a static article collection. Every substantial concept should move from explanation to a small hands-on browser demo.

## Current Book Structure

- `index.html` is the visual table of contents and search/filter hub.
- `classic_ml_algorithms_book.html` covers estimator contracts, classic supervised/unsupervised ML, validation, metrics, and simulators.
- `computer_vision_ml_book.html` covers image contracts, CV tasks, metrics, and visual canvas simulations.
- `deep_ml_torch_layers_book.html` covers tensor contracts, CNNs, Torch-style layers, embeddings, attention, and layer mechanics.
- `nlp_ml_book.html` covers NLP from count vectorizers, TF-IDF, and BPE tokenization to transformers, LLM decoding, retrieval, and RAG evaluation.
- `mlops_production_ml_book.html` covers production ML from closed label/train/evaluate/deploy/monitor loops to large vision-language models, RAG systems, and tool-using agents.

All pages are standalone HTML/CSS/JS files. Do not require a build step, package install, backend service, CDN, or model download for the main learning experience.

## Existing Visual Style

- Warm paper background, white panels, muted borders, and restrained accent colors.
- Serif body text for book-like reading; system sans-serif for navigation, controls, metrics, and labels.
- Sticky left table of contents on chapter pages, collapsing to a top block on narrower screens.
- First viewport has a large hero with a short value statement, three compact learning points, and an animated canvas visual.
- Main sections alternate between `.chapter` and `.band` blocks.
- Simulators use `.simulation`, `.sim-header`, `.sim-controls`, `.sim-grid`, `.metric-grid`, `.metric`, canvas/matrix/bar visualizations, and live output fields.
- Cards are used for repeated atlas entries only. Avoid nested cards and marketing-style section cards.
- Border radius stays modest, usually 8px or less.
- Typography has `letter-spacing: 0`; do not scale font size directly with viewport width.

## Content Standard

Each chapter should be useful as an applied reference and as a hands-on tool.

Include:

- A clear input/output contract table.
- Practical baseline methods before advanced methods.
- Equations or pseudo-code where they clarify mechanics.
- Model/task comparison tables.
- An interactive simulator section with several demos.
- An atlas/search section for methods, layers, metrics, or task patterns.
- Workflow and debugging sections with concrete failure modes.
- Code snippets only when they clarify real implementation contracts.

Avoid:

- Purely narrative chapters with no demos.
- Abstract definitions without examples.
- Unexplained metrics.
- Demos that only animate decoratively without changing metrics or state.
- Dependencies that make the static file fail offline.

## Interactive Demo Standard

Every demo should let the reader change something and immediately see a computed result.

Good controls:

- Text inputs or textareas for language examples.
- Range sliders for continuous parameters such as noise, threshold, temperature, smoothing, stride, context size, or overlap.
- Select menus for task/model/mode choices.
- Buttons for regenerate, step, train, reset, or evaluate actions.

Good outputs:

- Canvas visuals for geometry, images, masks, decision surfaces, and attention.
- Matrix views for tensors, vectorizers, kernels, confusion matrices, and attention weights.
- Bar charts for probabilities, logits, feature weights, class scores, and metric comparisons.
- Metric tiles for live values such as loss, accuracy, F1, entropy, IoU, sparsity, recall, and score counts.
- Searchable atlas cards with method, task, metric, and pitfall fields.

Implementation expectations:

- Keep demos deterministic unless the control explicitly changes a seed.
- Prefer small toy computations that expose real mechanics over fake animation.
- Use semantic HTML labels and `aria-label` on canvases.
- Keep responsive behavior explicit with grid changes under media queries.
- Ensure text does not overflow buttons, metric tiles, cards, or matrix cells.
- Use plain JavaScript helpers in the same file; keep names scoped and readable.

## ML Book Progression

Maintain this conceptual order in the index and cross-links:

1. Basic ML: features, estimators, validation, classical algorithms.
2. Computer Vision ML: image tensors, visual tasks, filters, boxes, masks, task metrics.
3. Deep Learning: tensor contracts, layers, CNNs, embeddings, attention, optimization basics.
4. NLP ML: text contracts, BPE tokenization, count vectorizers, TF-IDF, classical classifiers, embeddings, transformers, LLMs, retrieval.
5. MLOps and Production ML: data contracts, labels, training, evaluation, deployment, monitoring, feedback loops, VLLMs, LLM agents, and operations.
6. Future chapters: optimization/training, recommender systems, time series, data engineering, advanced evaluation.

When adding a chapter, update `index.html` in these places:

- Hero description and stats if totals change.
- Filter dropdown if a new group is introduced.
- `chapters` JavaScript array.
- Reading path.
- Coverage meters.
- Future pages section.

## Quality Checks

Before finishing:

- Open the edited HTML in a browser or run a local static server if needed.
- Verify all simulators initialize without console errors.
- Exercise every input, select, slider, and button.
- Check desktop and mobile widths for overlap and clipped text.
- Confirm the index search/filter finds the new chapter.
- Keep unrelated files untouched.
