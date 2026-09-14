---
lang: fr
key: turtlebot-mapping
order: 4
kind: project
title: Cartographie guidée d'un labyrinthe avec un TurtleBot3
tagline: Une pile ROS 2 qui cartographie un labyrinthe en fusionnant encodeurs, gyroscope et ICP LiDAR, et qui guide l'opérateur en lisant des flèches colorées sur la caméra.
period: mars – juin 2025
context: UE SY31 — Capteurs pour les systèmes intelligents, UTC · robot TurtleBot3 réel
role: Nœuds ROS 2 — détection de flèches, odométrie, traitement LiDAR, ICP, fusion et cartographie
stack: [Python, ROS 2 Humble, OpenCV, NumPy, SciPy, LiDAR, IMU]
tags: [robotique, ROS 2, fusion de capteurs, LiDAR, ICP, vision par ordinateur]
github: https://github.com/Maceo-Narbonnet/turtlebot-guided-mapping
cover: /img/tb3-map.webp
coverAlt: Carte LiDAR accumulée du labyrinthe dans RViz, vue de dessus, murs blancs sur fond sombre
results:
  - { value: '4', label: 'capteurs fusionnés : encodeurs, gyroscope, IMU, LiDAR' }
  - { value: 'fermée', label: 'boucle du labyrinthe après un tour complet' }
  - { value: '7', label: 'nœuds ROS 2, rejouables hors ligne depuis un bag enregistré' }
---

## Le principe

Un opérateur pilote le robot dans un labyrinthe. Pendant qu'il avance, le robot :

1. **estime sa propre pose** en fusionnant les encodeurs des roues, un gyroscope et un ICP scan-à-scan sur le LiDAR ;
2. **construit une carte** en accumulant les points LiDAR dans un repère monde fixe grâce à cette pose ;
3. **guide l'opérateur** en détectant des flèches colorées avec la caméra — **rouge : tourner à gauche, bleu : tourner à droite** — et en les projetant sur la carte.

Tout tourne en direct sur les flux capteurs du robot, et peut être rejoué hors ligne à partir du bag enregistré inclus dans le dépôt.

![Schéma du concept : un TurtleBot dans un labyrinthe guidé par des flèches rouges et bleues](/img/tb3-concept.webp)
*Le labyrinthe et ses flèches directionnelles ; le robot est piloté à la main, la carte et le guidage sont automatiques.*

## Résultat

![Carte accumulée du labyrinthe dans RViz](/img/tb3-map.webp)
*Carte LiDAR accumulée (RViz, vue de dessus) : les murs ressortent nets et fermés après un tour complet — la pose fusionnée reste assez cohérente pour que le début et la fin de la boucle se superposent.*

![Détection d'une flèche bleue dans le flux caméra](/img/tb3-arrow.webp)
*Détection de flèche sur le flux caméra rectifié : le contour est tracé et la direction annoncée à l'opérateur.*

## Les nœuds

- **`decompressor`** — décode le flux `CompressedImage` du robot et le republie en `Image` brute, avec le `CameraInfo` lu depuis le fichier de calibration.
- **`detect`** — seuillage HSV (deux plages pour le rouge, une pour le bleu), extraction de contours, sélection du plus grand. Les contours dans les 20 % supérieurs de l'image sont rejetés ; le sonar conditionne la détection pour qu'une flèche ne compte que lorsque le robot est réellement près d'un mur.
- **`motion_sensor_node`** — synchronise `/imu` et `/sensor_state` (fenêtre de 25 ms) et intègre une odométrie différentielle : vitesse linéaire par les encodeurs, vitesse de lacet par le gyroscope.
- **`transformer`** — convertit le `LaserScan` en nuage de points cartésien, en écartant les retours à moins de 10 cm, à plus de 65 cm, ou infinis.
- **`clusterer`** — segmente le scan avec une règle « plus proche des K derniers points » (K = 4, seuil 7 cm) et ne garde que les groupes d'au moins 8 points.
- **`icp_pose_estimator`** — ICP scan-à-scan contre le nuage précédent : association au plus proche voisin (seuil 5 cm), transformation optimale par SVD, accumulée en une pose globale.
- **`main_node`** — fusionne la pose odométrique et la pose ICP avec des poids par axe, transforme le nuage courant dans le repère monde, filtre les points déjà cartographiés, et publie la carte plus les marqueurs de flèches.

## La fusion

`main_node` moyenne les deux sources de pose avec des poids indépendants sur x, y et le cap, selon la confiance accordée à chaque capteur sur chaque axe : **le gyroscope domine l'estimation du cap** (poids 40 contre 5 pour l'ICP), tandis que **l'ICP corrige la dérive latérale** (3 contre 1 sur y). Un simple booléen permet de retomber sur l'odométrie encodeurs + gyroscope seule, pratique pour isoler un problème d'ICP.

## Limites connues

- L'ICP est scan-à-scan et non scan-à-carte : de petites erreurs s'accumulent sur un long tour. C'est le poids élevé du gyroscope sur le cap qui maintient la boucle fermée en pratique.
- Le regroupement et les recherches de plus proches voisins sont des boucles Python : suffisant pour un LiDAR à 5 Hz, pas beaucoup plus.
- Le message de direction est construit et journalisé par `detect` mais pas encore publié sur le topic écouté par `main_node` : les deux moitiés fonctionnent séparément et doivent être raccordées pour que les flèches apparaissent automatiquement sur la carte.

Le code est publié sous licence MIT, avec le bag enregistré (LiDAR, IMU, encodeurs, caméra) pour rejouer l'expérience sans robot.
