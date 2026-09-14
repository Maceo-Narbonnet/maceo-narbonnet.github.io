---
lang: en
key: mocapia
order: 1
kind: internship
title: MoCapIA — markerless motion capture with vision and AI
tagline: Reconstructing human movement in 3D with four GoPros and pose-estimation models, then honestly measuring the gap against a Vicon reference system.
period: Sept. 2025 – Feb. 2026
context: TN09 internship · BMBI Laboratory (CNRS / UTC), BioMov-E team
role: R&D intern — locating error sources, integrating corrections, evaluation
stack: [Python, PyQt5, OpenCV, NumPy, PyTorch, ONNX Runtime, YOLO, RTMPose, OpenSim, MATLAB, GitLab]
tags: [computer vision, multi-camera calibration, triangulation, deep learning, biomechanics]
github: https://github.com/Maceo-Narbonnet/MocapIA
cover: /img/mocap-rtmpose.webp
coverAlt: Person and keypoint detection by YOLO and RTMPose in the capture room, with the GoPro cameras visible
results:
  - { value: '15.6 mm', label: 'mean standard deviation vs Vicon, all joints' }
  - { value: '7.6° → 5.2°', label: 'joint-angle RMSE after filtering, LSTM and OpenSim' }
  - { value: '4 × GoPro', label: 'instead of some forty Vicon cameras' }
---

## The problem

The BMBI laboratory owns a **Vicon T160**: around forty optoelectronic cameras at 300 fps, accurate to a tenth of a millimetre. Such systems remain expensive, slow to set up, and require the subject to wear reflective markers that can alter natural movement — a real obstacle in clinical and sports settings.

**MoCapIA** explores the *markerless* alternative: four synchronised GoPro Hero12 cameras, a calibration checkerboard, and pose-estimation models. The Vicon then becomes the reference against which accuracy is measured.

The project has been carried by successive internships since 2023; the building blocks (calibration, detection, triangulation, user interface) already existed. My goal: **identify where the residual error comes from, then close the gap with the Vicon**.

![MoCapIA pipeline, from acquisition to evaluation](/img/mocap-pipeline.webp)
*The full pipeline: synchronised acquisition, intrinsic and extrinsic calibration, 2D pose estimation, triangulation, then the three correction stages added during the internship.*

## The pipeline

- **Acquisition** — driving and synchronising the four GoPros.
- **Intrinsic calibration** — distortion and focal length of each camera, on a checkerboard.
- **Extrinsic calibration** — relative camera poses, change of reference frame.
- **2D pose estimation** — person detection (YOLO) then keypoints (RTMPose, Halpe26 format).
- **Triangulation** — 3D reconstruction by DLT over all camera pairs, consolidated by *binning*.
- **Filtering, marker augmentation, biomechanical correction** — the three stages integrated during the internship (see below).
- **Evaluation** — quantitative comparison against the Vicon reference.
- **User interface** — PyQt5 application: projects, cameras, running each stage, 3D visualisation.

## 1 — Locate the error

Before fixing anything, we needed to know *where* the error came from. Three experimental campaigns on the Sport & Health Technology platform:

- **Test 0 — checkerboard geometry.** Four boards compared (number of squares × square size), 1,389 points per board, analysed by **ANOVA** and multiple comparisons. The effect is statistically significant; the team adopted the 7×6 board with 100 mm squares, the best trade-off between accuracy and stability.
- **Test 1 — calibration homogeneity**, with 2D estimation neutralised by manual clicks on characteristic points.
- **Test 2 — 2D estimation alone**, compared directly against the Vicon reference.

![Checkerboard calibration in the capture room](/img/mocap-calib.webp)
*Extrinsic calibration: the checkerboard is filmed simultaneously by the four GoPros, under the Vicon cameras.*

Verdict: **2D pose estimation is the weak link** of the pipeline, not calibration. That is where to act.

## 2 — Correct

After a literature review and a comparison with the open-source Pose2Sim project, three stages were adapted and integrated into MoCapIA, each tested and validated in isolation before integration:

- **Filtering** of 3D trajectories, to remove inconsistent values and noise from 2D estimation.
- **Marker augmentation** with **LSTM** networks (ONNX): the Halpe26 keypoint set is densified into a set of anatomical markers, enabling a more complete biomechanical analysis.
- **Biomechanical correction** in **OpenSim** — *scaling* then inverse kinematics — which fixes segment lengths by constraining the reconstruction with a skeleton.

![Principle of LSTM marker augmentation](/img/mocap-lstm.webp)
*Marker augmentation: video keypoints (Halpe26) are converted into anatomical markers by two LSTM models (arm and body).*

![OpenSim skeleton after inverse kinematics](/img/mocap-opensim-skelet.webp)
*Result after biomechanical correction: the OpenSim model constrains segment lengths.*

## 3 — Explore

Evaluation of **SAM 3D** (Meta) as a route to monocular 3D reconstruction without calibration. Promising on still images, but applying it to full video sequences was still out of reach at the end of the internship.

## Results

MoCapIA vs Vicon comparison across all joints:

- mean standard deviation of **15.6 mm**, from **8 mm** at the shoulders to **34 mm** on the least stable points (head, wrists);
- mean operating range of **57.4 mm**, reduced to about **30 mm** on the lower body, at the cost of a higher outlier rate (≈ 15%);
- on joint angles, the filtering + LSTM + OpenSim chain brings the **RMSE from 7.6° down to 5.2°**.

![Knee angle comparison: Vicon, OpenSim and MoCapIA](/img/mocap-vicon-opensim.webp)
*Left knee flexion over time: Vicon reference, OpenSim output and MoCapIA output overlap after correction.*

These figures deserve nuance, and the report provides it: the Vicon is treated as an absolute reference although it carries its own error, notably from manual marker placement. Some gaps are **structural** rather than errors — MoCapIA's "head" point sits at the top of the skull, the Vicon's at its centre, a systematic 20 cm offset.

## What I take away

- **Measure before you fix**: the three test campaigns avoided spending weeks improving a calibration that was not the problem.
- **Working with non-engineers**: the team brings together researchers in biomechanics and biology; I had to listen, understand their needs and translate them into technical solutions.
- **Read and adapt**: the corrections come from the literature and an open-source project, adapted to the existing pipeline rather than rewritten.

The repository contains the application code, the full internship report (LaTeX + PDF), the defence slides and the pipeline diagrams. Supervisor: M. Ben Mansour, BioMov-E team.
