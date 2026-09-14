---
lang: en
key: traffic-sign-detection
order: 2
kind: project
title: Traffic-sign detection without deep learning
tagline: An object detector built from classical descriptors and a Random Forest — and, above all, an honest evaluation harness that took the AP from 0.095 to 0.293.
period: May – June 2026
context: SY32 — Computer vision and machine learning, UTC · pair project
role: Detection pipeline, metrics and evaluation protocol, hard negative mining
stack: [Python, scikit-learn, scikit-image, OpenCV, NumPy]
tags: [computer vision, machine learning, HOG, Random Forest, evaluation]
github: https://github.com/Maceo-Narbonnet/traffic-sign-detection
cover: /img/tsd-ok.webp
coverAlt: A road sign correctly detected and boxed in a street photo
results:
  - { value: '0.095 → 0.293', label: 'AP on the validation set' }
  - { value: '×18', label: 'precision on the test server, without retraining' }
  - { value: '1,858', label: 'dimensions of the HOG + HSV + LBP descriptor' }
---

## The constraint

From a street photo, produce **bounding boxes** around traffic signs, each with a confidence score. The rule set by the course: **deep learning is forbidden**. Only classical vision and learning methods (`scikit-learn`, `scikit-image`, OpenCV). Part of the test set also contains *fisheye*-distorted images, absent from training.

Submissions are scored on a UTC server whose test annotations are never revealed.

## The pipeline

- **Sample preparation** — loading images and annotations, cropping signs, sampling negatives.
- **Descriptors** — HOG (9 orientations, 8×8 cells) + HSV histogram (36 + 32 + 16) + uniform LBP (P = 8, R = 1): a **1,858-dimensional** vector per 64×64 patch.
- **Classifier** — Random Forest with 100 trees.
- **Hard negative mining** — re-injecting the "hardest" false positives, at several scales.
- **Detection** — multi-scale sliding window over a Gaussian pyramid (×1.25), with an HSV colour pre-filter.
- **Non-maximum suppression** — IoU 0.3.

## Measure before you optimise

The initial pipeline reported **98.96% accuracy on patches**… for an AP of **0.095** in real detection. So the first deliverable was a proper evaluation harness: IoU, precision/recall, AP, F1, and a **leak-free validation split** (split *by image*, never by patch).

Every idea was then measured and **kept or dropped on the numbers** — including the inconclusive attempts, documented as-is in the repository's lab notebook.

![AP progression across improvements](/img/tsd-ap.webp)
*On 68 validation images (147 signs, IoU ≥ 0.5): baseline 0.095 → fixed positive cropping 0.173 → multi-scale hard negative mining 0.293.*

Hard negative mining brings a double gain: **+69% AP** *and* **−43% detections**, i.e. far fewer false positives.

![Precision/recall curve](/img/tsd-pr.webp)
*Precision/recall curve of the final detector on the validation set.*

## Diagnose rather than retrain

The first submission to the UTC server revealed a major flaw: decent recall (31%) but a precision of **0.82%** — roughly 99 false boxes out of 100. The diagnosis: a deliberately low score threshold (useful for tracing the AP curve, disastrous for a submission).

The second submission, with a 0.6 threshold and **no retraining**, confirmed the analysis: **precision ×18, F1 ×12, AUC from 18.6% to 23.7%**. The most spectacular gain of the project cost no computation at all — only a careful reading of an abnormal precision/recall gap.

![Effect of the score threshold on the UTC server](/img/tsd-submission.webp)
*The two submissions to the evaluation server: same model, only the operating point changes.*

## What fails, and why

![Brick façade massively over-detected](/img/tsd-fail.webp)
*Typical failure: repetitive structures (façades, blinds, windows) remain the main source of false positives.*

The limits are acknowledged and documented:

- precision still low in absolute terms;
- costly sliding window (≈ 13 s per image, mostly HOG computation);
- O(n²) NMS;
- triangular signs poorly recognised, weak *fisheye* robustness — the distortion augmentation tested degraded the AP (0.284 → 0.221) and was dropped.

One detail that matters: two runs of the same code gave different APs (0.284 then 0.232) because Python's `random` module was not seeded, only NumPy was. Fixed, and written down.

## Documentation

The repository contains the full report (9 pages), function-by-function technical documentation, the raw experimental log (dated measurements, regressions, dead ends) and a dedicated note on hard negative mining. The dataset (341 images, 662 boxes) belongs to UTC and is not redistributed.
