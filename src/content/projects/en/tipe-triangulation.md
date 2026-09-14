---
lang: en
key: tipe-triangulation
order: 5
kind: project
title: 3D ball trajectory by stereo vision
tagline: Reproducing the principle of Hawk-Eye-style video refereeing with two smartphones and OpenCV — stereo calibration, 2D tracking, triangulation, and an error study at every stage.
period: 2023 – 2024
context: CPGE research project (TIPE, theme "Games, Sport") · group project, software part
role: Stereo calibration, tracking methods (frame difference, mean shift, Hough), triangulation, uncertainty study
stack: [Python, OpenCV, NumPy, Matplotlib]
tags: [stereo vision, calibration, triangulation, image processing, object tracking]
github: https://github.com/Maceo-Narbonnet/TIPE-Triangulation
cover: /img/tipe-setup.webp
coverAlt: Experimental setup — two phones placed on fixed marks on an MDF board, and an orange ping-pong ball
results:
  - { value: '2', label: 'smartphones used as a stereo camera pair' }
  - { value: '8 × 13', label: 'inner corners of the calibration checkerboard (7 mm squares)' }
  - { value: '3', label: 'tracking methods compared; Hough retained' }
---

## The idea

A single camera projects 3D space onto a plane: depth is lost. With **two** cameras whose relative positions are known, the same point seen in both images defines two lines in space whose intersection recovers the 3D point — that is triangulation.

Starting point: *Hawk-Eye*-style video refereeing systems, which reconstruct a tennis ball's trajectory from several cameras. The goal of this TIPE was to reproduce the principle with two phones and OpenCV, in three blocks: **calibration**, **tracking**, **triangulation**.

## Experimental setup

Two phones serve as cameras. They rest on marks drawn on an MDF board, which guarantees they stay **exactly in the same place** between the calibration phase and the measurement phase — essential, since calibration freezes the relative position of the two cameras. Footage at 4032 × 2268 px; an orange ping-pong ball, chosen for its contrast with the background.

![Support board with the two camera positions and fields of view drawn](/img/tipe-board.webp)
*The support board: the two positions (red adhesive marks) and the fields of view drawn with a marker.*

## Camera calibration

The target is a checkerboard displayed full-screen on a phone: flat, rigid, perfectly contrasted. 9 × 14 squares, i.e. **8 × 13 inner corners** with 7 mm sides.

![Checkerboard corner detection by camera 1](/img/tipe-corners.webp)
*Corner detection with `findChessboardCornersSB`, refined to sub-pixel accuracy with `cornerSubPix`. An image pair is kept only if both cameras saw the whole board.*

The calibration chain runs:

1. `calibrateCamera` on each camera → intrinsic matrix and distortion coefficients;
2. `stereoCalibrate` with intrinsics fixed → rotation **R** and translation **T** between the two cameras;
3. `stereoRectify` → the projection matrices **P₁** and **P₂**, input to the triangulation;
4. `initUndistortRectifyMap` → the rectification maps.

The reprojection error, computed at the end of the chain, serves as a quality indicator of the calibration.

![Checkerboard after distortion correction](/img/tipe-undistort.webp)
*Distortion correction: the aberration that bends straight lines away from the optical centre is measured on straight lines, then corrected using the coefficients from calibration.*

## Ball tracking

Three methods implemented and compared:

- **Frame difference** ("delta method") — first approach, written without OpenCV: pixel-by-pixel subtraction of two consecutive frames, then thresholding. Works, but slow (Python loops) and very sensitive to lighting; abandoned.
- **Colour tracking** (*mean shift*) — binary HSV mask within a hue range, then a tracking window moved with `cv2.meanShift`. A small slider tool was used to find the HSV bounds live from a webcam.
- **Hough transform** — the method retained: greyscale, 17 × 17 Gaussian blur, then `HoughCircles`, which looks directly for circles. When several circles are detected, the one closest to the previous position is kept, ensuring tracking continuity. More robust than colour (independent of lighting), but the min/max radii must be tuned to the ball's apparent size.

![Ball tracking with the Hough transform](/img/tipe-hough.webp)
*Green trace: successive positions of the detected centre. Magenta circle: detection on the current frame.*

## Triangulation

The two series of pixel coordinates are paired frame by frame, then passed to `cv.triangulatePoints(P₁, P₂, pts₁, pts₂)`, which returns 4D homogeneous coordinates to normalise into 3D points. The reconstructed cloud is plotted in 3D with Matplotlib.

![2D trajectories tracked in each camera](/img/tipe-traj.webp)
*The 123 paired positions of one throw, as tracked in each of the two cameras. These two curves feed the triangulation; colour encodes time.*

## Error study

Three sources of error were quantified, with the measurements kept in the repository:

- **optical distortion** — photographing straight lines, measuring the deviation as a function of distance from the centre;
- **detection uncertainty** — repeated detection of the same fixed point over ~120 frames: the spread of the coordinates gives the measurement noise, in pixels;
- **Hough transform uncertainty** — spread of the detected centre and radius.

Plus the reprojection error of the calibration.

## Limitations, as they are

This repository is the archive of the code as it was used during the TIPE, with its acknowledged limits: hard-coded file paths, coordinates copied by hand between tracking and triangulation, linear scripts without a `main()`, and above all **no hardware synchronisation** between the two phones, started by hand — the main physical limit of the setup.

Group TIPE carried out with Mathis Carraz and Luka Milosevic; the repository gathers the software part, the objectives statement (MCOT) and the defence slides.
