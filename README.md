# FreightIQ Demo

## Extraction evaluation

The evaluation runner extracts every PDF directly inside `samples/pdfs/` and compares it with the matching `samples/truth/<name>.json` record. Truth files must conform to the `LoadDocument` schema.

Set `ANTHROPIC_API_KEY` and `EXTRACTION_MODEL`, then run:

```sh
pnpm eval
```

Each run prints overall and per-field accuracy, document-level accuracy, flagged rate, silent error rate, and aggregate input/output token usage. It also saves the model name, run date, sample comparisons, validation issues, and usage details under `eval/results/`. Accuracy compares top-level data fields; the model's `uncertain_fields` is treated as a review signal rather than ground-truth content. The silent error rate is the share of incorrect top-level fields that were not flagged by validation or by the model's `uncertain_fields` output. A `null` rate means there were no incorrect fields to measure.

The included `rc-10482` PDF and truth file are a synthetic fixture for exercising the runner. Results on that single generated document are only a smoke-scale demo measurement; do not present them as representative accuracy. Add a representative labeled PDF set before making accuracy claims.
