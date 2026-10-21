# BANKING77 support-intent selection example

Local experiment, 21 October 2026. Evaluates intent classification, not generated-reply factuality. See protocol.json for the predeclared model, split, threshold family, selection rule, assumptions and limitations.

Use Python 3.13, create a virtual environment, install requirements.txt and run `python evaluate.py`. The script downloads the original data at a pinned commit. It writes the protocol before fitting and the chosen policies before loading test labels. No model or threshold tuning was performed after seeing the results.

Results, all candidate bounds and model iteration counts are in results.json. scored-queries.csv contains split, original file row index (zero-based), text SHA-256, labels, score and error. Text is not republished. Normalize only for duplicate checks: case-fold and collapse whitespace. Four duplicate training records, seven overlapping test records and one duplicate test record are excluded.

The one-sided Clopper-Pearson bounds use delta/10 with a union bound over the ten fixed candidates. Bounds assume independent examples from the same population, a fixed model and accurate labels. Benchmark results do not establish deployment assumptions, correlated-query validity, per-intent validity, financial advice quality, or generated-reply correctness.

Data: BANKING77, Casanueva et al. (2020), Efficient Intent Detection with Dual Sentence Encoders, https://aclanthology.org/2020.nlp4convai-1.5/ . PolyAI release: https://github.com/PolyAI-LDN/task-specific-datasets . CC BY 4.0, see LICENSE. Changes: exact normalized text deduplication, randomized training/calibration split, own baseline classifier and selection evaluation. Not affiliated with or endorsed by the dataset authors.
