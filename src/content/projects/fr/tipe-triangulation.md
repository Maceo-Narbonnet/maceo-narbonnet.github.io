---
lang: fr
key: tipe-triangulation
order: 5
kind: project
title: Trajectoire 3D d'une balle par stéréovision
tagline: Reproduire le principe d'un arbitrage vidéo type Hawk-Eye avec deux smartphones et OpenCV — étalonnage stéréo, suivi 2D, triangulation, et une étude des erreurs à chaque étape.
period: 2023 – 2024
context: TIPE de CPGE (thème « Jeux, Sport ») · projet de groupe, partie logicielle
role: Étalonnage stéréo, méthodes de suivi (delta, mean shift, Hough), triangulation, étude des incertitudes
stack: [Python, OpenCV, NumPy, Matplotlib]
tags: [stéréovision, calibration, triangulation, traitement d'image, suivi d'objet]
github: https://github.com/Maceo-Narbonnet/TIPE-Triangulation
cover: /img/tipe-setup.webp
coverAlt: Dispositif expérimental — deux téléphones posés sur des repères fixes d'une plaque de MDF, et une balle de ping-pong orange
results:
  - { value: '2', label: 'smartphones en guise de caméras stéréo' }
  - { value: '8 × 13', label: 'coins intérieurs du damier de calibration (arête 7 mm)' }
  - { value: '3', label: 'méthodes de suivi comparées ; Hough retenue' }
---

## Le principe

Une caméra seule projette l'espace 3D sur un plan : la profondeur est perdue. Avec **deux** caméras dont on connaît les positions relatives, un même point vu dans les deux images définit deux droites de l'espace dont l'intersection redonne le point 3D — c'est la triangulation.

Point de départ : les systèmes d'arbitrage vidéo type *Hawk-Eye*, qui reconstruisent la trajectoire d'une balle de tennis à partir de plusieurs caméras. L'objectif du TIPE est d'en reproduire le principe avec deux téléphones et OpenCV, en trois briques : **étalonnage**, **suivi**, **triangulation**.

## Dispositif expérimental

Deux téléphones tiennent lieu de caméras. Ils sont posés sur des repères tracés sur une plaque de MDF, ce qui garantit qu'ils restent **exactement au même endroit** entre la phase d'étalonnage et la phase de mesure — condition indispensable, puisque l'étalonnage fige la position relative des deux caméras. Prises de vue en 4032 × 2268 px ; balle de ping-pong orange, choisie pour son contraste avec le fond.

![Plaque support avec les deux emplacements et les champs de vue tracés](/img/tipe-board.webp)
*La plaque support : les deux emplacements (repères adhésifs rouges) et les champs de vue tracés au feutre.*

## Étalonnage des caméras

La mire est un damier affiché plein écran sur un téléphone : plan, rigide, parfaitement contrasté. 9 × 14 cases, soit **8 × 13 coins intérieurs** d'arête 7 mm.

![Détection des coins du damier par la caméra 1](/img/tipe-corners.webp)
*Détection des coins avec `findChessboardCornersSB`, affinée au sous-pixel avec `cornerSubPix`. Une paire d'images n'est retenue que si les deux caméras ont vu le damier en entier.*

La chaîne de calibration enchaîne :

1. `calibrateCamera` sur chaque caméra → matrice intrinsèque et coefficients de distorsion ;
2. `stereoCalibrate` avec les intrinsèques figées → rotation **R** et translation **T** entre les deux caméras ;
3. `stereoRectify` → les matrices de projection **P₁** et **P₂**, entrée de la triangulation ;
4. `initUndistortRectifyMap` → les cartes de rectification.

L'erreur de reprojection, calculée en fin de chaîne, sert d'indicateur de qualité de l'étalonnage.

![Damier après correction de la distorsion](/img/tipe-undistort.webp)
*Correction de la distorsion : l'aberration qui courbe les droites en s'éloignant du centre optique est mesurée sur des lignes droites, puis corrigée à partir des coefficients issus de l'étalonnage.*

## Suivi de la balle

Trois méthodes implémentées et comparées :

- **Différence d'images** (« méthode delta ») — première approche, écrite sans OpenCV : soustraction pixel à pixel de deux images consécutives, puis seuillage. Fonctionne, mais lente (boucles Python) et très sensible à l'éclairage ; abandonnée.
- **Suivi par couleur** (*mean shift*) — masque binaire HSV dans une plage de teinte, puis déplacement d'une fenêtre de suivi avec `cv2.meanShift`. Un petit outil à curseurs a servi à trouver les bornes HSV en direct à la webcam.
- **Transformée de Hough** — méthode retenue : niveaux de gris, flou gaussien 17 × 17, puis `HoughCircles`, qui cherche directement des cercles. Quand plusieurs cercles sont détectés, on garde celui le plus proche de la position précédente, ce qui assure la continuité du suivi. Plus robuste que la couleur (indépendante de l'éclairage), mais il faut régler les rayons min/max selon la taille apparente de la balle.

![Suivi de la balle par transformée de Hough](/img/tipe-hough.webp)
*Trace verte : positions successives du centre détecté. Cercle magenta : détection sur l'image courante.*

## Triangulation

Les deux séries de coordonnées pixel sont appariées image par image, puis passées à `cv.triangulatePoints(P₁, P₂, pts₁, pts₂)`, qui renvoie des coordonnées homogènes 4D à normaliser pour obtenir les points 3D. Le nuage reconstruit est tracé en 3D avec Matplotlib.

![Trajectoires 2D suivies dans chaque caméra](/img/tipe-traj.webp)
*Les 123 positions appariées d'un lancer, telles que suivies dans chacune des deux caméras. Ce sont ces deux courbes qui alimentent la triangulation ; la couleur code le temps.*

## Étude des erreurs

Trois sources d'erreur ont été quantifiées, avec des relevés conservés dans le dépôt :

- **distorsion optique** — photographie de droites, mesure de la déviation en fonction de la distance au centre ;
- **incertitude de détection** — détection répétée d'un même point fixe sur ~120 images : la dispersion des coordonnées donne le bruit de mesure, en pixels ;
- **incertitude de la transformée de Hough** — dispersion du centre et du rayon détectés.

S'y ajoute l'erreur de reprojection de l'étalonnage.

## Limites, telles quelles

Ce dépôt est l'archive du code tel qu'il a servi pendant le TIPE, avec ses limites assumées : chemins de fichiers en dur, coordonnées recopiées à la main entre le suivi et la triangulation, scripts linéaires sans `main()`, et surtout **pas de synchronisation matérielle** entre les deux téléphones, lancés à la main — la principale limite physique du montage.

TIPE de groupe réalisé avec Mathis Carraz et Luka Milosevic ; le dépôt rassemble la partie logicielle, la mise en cohérence des objectifs (MCOT) et le diaporama de soutenance.
