---
lang: en
key: turtlebot-mapping
order: 4
kind: project
title: Guided maze mapping with a TurtleBot3
tagline: A ROS 2 stack that maps a maze by fusing wheel encoders, gyroscope and LiDAR ICP, and guides the operator by reading coloured arrows off the camera.
period: March – June 2025
context: SY31 — Sensors for intelligent systems, UTC · real TurtleBot3
role: ROS 2 nodes — arrow detection, odometry, LiDAR processing, ICP, fusion and mapping
stack: [Python, ROS 2 Humble, OpenCV, NumPy, SciPy, LiDAR, IMU]
tags: [robotics, ROS 2, sensor fusion, LiDAR, ICP, computer vision]
github: https://github.com/Maceo-Narbonnet/turtlebot-guided-mapping
cover: /img/tb3-map.webp
coverAlt: Accumulated LiDAR map of the maze in RViz, top view, white walls on a dark background
results:
  - { value: '4', label: 'sensors fused: encoders, gyroscope, IMU, LiDAR' }
  - { value: 'closed', label: 'maze loop after a full lap' }
  - { value: '7', label: 'ROS 2 nodes, replayable offline from a recorded bag' }
---

## The idea

An operator drives the robot around a maze. While it moves, the robot:

1. **estimates its own pose** by fusing wheel encoders, a gyroscope, and a scan-to-scan ICP on the LiDAR;
2. **builds a map** by accumulating LiDAR points into a fixed world frame using that pose;
3. **guides the operator** by detecting coloured arrows with the camera — **red means turn left, blue means turn right** — and projecting them onto the map.

Everything runs live on the robot's sensor streams, and can be replayed offline from the recorded bag included in the repository.

![Concept sketch: a TurtleBot in a maze guided by red and blue arrows](/img/tb3-concept.webp)
*The maze and its directional arrows; the robot is driven by hand, the map and the guidance are automatic.*

## Result

![Accumulated maze map in RViz](/img/tb3-map.webp)
*Accumulated LiDAR map (RViz, top view): the walls come out clean and closed after a full lap — the fused pose stays consistent enough that the start and end of the loop overlap.*

![Blue arrow detected in the camera stream](/img/tb3-arrow.webp)
*Arrow detection on the rectified camera stream: the contour is outlined and the direction announced to the operator.*

## The nodes

- **`decompressor`** — decodes the robot's `CompressedImage` stream and republishes it as a raw `Image`, with the `CameraInfo` read from the calibration file.
- **`detect`** — HSV thresholding (two ranges for red, one for blue), contour extraction, largest-contour selection. Contours in the top 20% of the frame are rejected; the sonar gates detections so an arrow only counts when the robot is actually close to a wall.
- **`motion_sensor_node`** — time-synchronises `/imu` and `/sensor_state` (25 ms window) and integrates a differential-drive odometry: linear speed from the encoders, yaw rate from the gyroscope.
- **`transformer`** — converts the `LaserScan` to a Cartesian point cloud, dropping returns closer than 10 cm, further than 65 cm, or infinite.
- **`clusterer`** — segments the scan with a nearest-of-the-last-K-points rule (K = 4, 7 cm threshold), then keeps only clusters of at least 8 points.
- **`icp_pose_estimator`** — scan-to-scan ICP against the previous cloud: nearest-neighbour association (5 cm gate), SVD best-fit transform, accumulated into a global pose.
- **`main_node`** — fuses the odometry pose and the ICP pose with per-axis weights, transforms the current cloud into the world frame, filters out points already mapped, and publishes the map plus the arrow markers.

## The fusion

`main_node` averages the two pose sources with independent weights on x, y and heading, reflecting how much each sensor can be trusted on each axis: **the gyroscope dominates the heading estimate** (weight 40 vs 5 for ICP), while **ICP corrects lateral drift** (3 vs 1 on y). A single boolean falls back to encoder-and-gyro odometry only, handy for isolating ICP problems.

## Known limitations

- ICP runs scan-to-scan rather than scan-to-map, so small errors accumulate over a long lap. The heavy gyroscope weighting on heading is what keeps the loop closed in practice.
- Clustering and nearest-neighbour searches are plain Python loops: they keep up with a 5 Hz LiDAR, but not much more.
- The direction message is built and logged by `detect` but not yet published on the topic `main_node` listens to: both halves work on their own and need bridging for arrows to appear on the map automatically.

The code is released under the MIT licence, with the recorded bag (LiDAR, IMU, encoders, camera) to replay the experiment without a robot.
