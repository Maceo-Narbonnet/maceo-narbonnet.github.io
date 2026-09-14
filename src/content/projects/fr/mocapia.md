---
lang: fr
key: mocapia
order: 1
kind: internship
title: MoCapIA — capture de mouvement sans marqueurs par vision et IA
tagline: Reconstruire le mouvement humain en 3D avec quatre GoPro et des modèles d'estimation de pose, puis mesurer honnêtement l'écart avec un système Vicon de référence.
period: sept. 2025 – févr. 2026
context: Stage TN09 · Laboratoire BMBI (CNRS / UTC), équipe BioMov-E
role: Stagiaire R&D — localisation des sources d'erreur, intégration de corrections, évaluation
stack: [Python, PyQt5, OpenCV, NumPy, PyTorch, ONNX Runtime, YOLO, RTMPose, OpenSim, MATLAB, GitLab]
tags: [vision par ordinateur, calibration multi-caméras, triangulation, deep learning, biomécanique]
github: https://github.com/Maceo-Narbonnet/MocapIA
cover: /img/mocap-rtmpose.webp
coverAlt: Détection de la personne et des points clés par YOLO et RTMPose dans la salle de capture, avec les caméras GoPro visibles
results:
  - { value: '15,6 mm', label: "écart-type moyen vs Vicon, toutes articulations" }
  - { value: '7,6° → 5,2°', label: 'RMSE angulaire après filtrage, LSTM et OpenSim' }
  - { value: '4 × GoPro', label: 'à la place d’une quarantaine de caméras Vicon' }
---

## Le problème

Le laboratoire BMBI dispose d'un **Vicon T160** : une quarantaine de caméras optoélectroniques à 300 images/s, précises au dixième de millimètre. Ces systèmes restent coûteux, longs à installer, et imposent au sujet de porter des marqueurs réfléchissants qui peuvent altérer son mouvement naturel — un vrai frein en clinique comme en sport.

**MoCapIA** explore l'alternative *markerless* : quatre GoPro Hero12 synchronisées, un damier de calibration, et des modèles d'estimation de pose. Le Vicon devient alors la référence pour mesurer la précision atteinte.

Le projet est porté par des stages successifs depuis 2023 ; les briques de base (calibration, détection, triangulation, interface) existaient déjà. Mon objectif : **identifier l'origine des erreurs résiduelles, puis réduire l'écart avec le Vicon**.

![Pipeline MoCapIA, de l'acquisition à l'évaluation](/img/mocap-pipeline.webp)
*Le pipeline complet : acquisition synchronisée, calibration intrinsèque et extrinsèque, estimation de pose 2D, triangulation, puis les trois étapes de correction ajoutées pendant le stage.*

## Le pipeline

- **Acquisition** — pilotage et synchronisation des quatre GoPro.
- **Calibration intrinsèque** — distorsion et focale de chaque caméra, sur damier.
- **Calibration extrinsèque** — poses relatives des caméras, changement de repère.
- **Estimation de pose 2D** — détection de la personne (YOLO) puis des points clés (RTMPose, format Halpe26).
- **Triangulation** — reconstruction 3D par DLT sur toutes les paires de caméras, consolidée par *binning*.
- **Filtrage, augmentation de marqueurs, correction biomécanique** — les trois étapes intégrées pendant le stage (voir plus bas).
- **Évaluation** — comparaison quantitative à la référence Vicon.
- **Interface** — application PyQt5 : projets, caméras, lancement des étapes, visualisation 3D.

## 1 — Localiser l'erreur

Avant de corriger quoi que ce soit, il fallait savoir *d'où* venait l'erreur. Trois campagnes expérimentales sur la plateforme Technologie Sport Santé :

- **Test 0 — géométrie du damier.** Quatre damiers comparés (nombre de cases × taille des carreaux), 1 389 points par damier, analyse par **ANOVA** et comparaisons multiples. L'effet est statistiquement significatif ; l'équipe a retenu le damier 7×6 de 100 mm, meilleur compromis entre justesse et stabilité.
- **Test 1 — homogénéité de la calibration**, en neutralisant l'estimation 2D par des clics manuels sur les points caractéristiques.
- **Test 2 — estimation 2D seule**, comparée directement à la référence Vicon.

![Calibration au damier dans la salle de capture](/img/mocap-calib.webp)
*Calibration extrinsèque : le damier est filmé simultanément par les quatre GoPro, sous les caméras du Vicon.*

Verdict : **l'estimation de pose 2D est le maillon faible** du pipeline, pas la calibration. C'est là qu'il fallait agir.

## 2 — Corriger

Après une veille bibliographique et une comparaison avec le projet open source Pose2Sim, trois étapes ont été adaptées et intégrées à MoCapIA, chacune testée et validée isolément avant intégration :

- **Filtrage** des trajectoires 3D, pour éliminer les valeurs incohérentes et le bruit issu de l'estimation 2D.
- **Augmentation de marqueurs** par réseaux **LSTM** (ONNX) : le jeu de points Halpe26 est densifié en un ensemble de marqueurs anatomiques, ce qui permet une analyse biomécanique plus complète.
- **Correction biomécanique** sous **OpenSim** — *scaling* puis cinématique inverse — qui fige les longueurs de segments en contraignant la reconstruction par un squelette.

![Principe de l'augmentation de marqueurs par LSTM](/img/mocap-lstm.webp)
*Augmentation de marqueurs : les points clés vidéo (Halpe26) sont convertis en marqueurs anatomiques par deux modèles LSTM (bras et corps).*

![Squelette OpenSim après cinématique inverse](/img/mocap-opensim-skelet.webp)
*Résultat après correction biomécanique : le modèle OpenSim contraint les longueurs de segments.*

## 3 — Explorer

Évaluation de **SAM 3D** (Meta) comme piste de reconstruction 3D monoculaire, sans calibration. Résultats prometteurs sur image fixe, mais l'application à des séquences vidéo complètes restait hors de portée à la fin du stage.

## Résultats

Comparaison MoCapIA / Vicon sur l'ensemble des articulations :

- écart-type moyen de **15,6 mm**, de **8 mm** aux épaules à **34 mm** sur les points les plus instables (tête, poignets) ;
- plage de fonctionnement moyenne de **57,4 mm**, réduite à environ **30 mm** sur le bas du corps, au prix d'un taux de valeurs aberrantes plus élevé (≈ 15 %) ;
- sur les angles articulaires, la chaîne filtrage + LSTM + OpenSim fait passer la **RMSE de 7,6° à 5,2°**.

![Comparaison des angles du genou : Vicon, OpenSim et MoCapIA](/img/mocap-vicon-opensim.webp)
*Flexion du genou gauche au cours du temps : référence Vicon, sortie OpenSim et sortie MoCapIA se superposent après correction.*

Ces chiffres sont à nuancer, et le rapport le fait : le Vicon est traité comme référence absolue alors qu'il porte lui aussi une erreur, notamment liée au placement manuel des marqueurs. Certains écarts sont **structurels** et non des erreurs — le point « tête » de MoCapIA est au sommet du crâne, celui du Vicon en son centre, soit 20 cm de décalage systématique.

## Ce que j'en retiens

- **Mesurer avant de corriger** : les trois campagnes de tests ont évité de passer des semaines à améliorer une calibration qui n'était pas le problème.
- **Travailler avec des non-informaticiens** : l'équipe réunit chercheurs en biomécanique et en biologie ; il a fallu écouter, comprendre leurs besoins et les traduire en solutions techniques.
- **Lire et adapter** : les corrections viennent de la littérature et d'un projet open source, adaptées au pipeline existant plutôt que réécrites.

Le dépôt contient le code de l'application, le rapport de stage complet (LaTeX + PDF), le support de soutenance et les schémas du pipeline. Encadrement : M. Ben Mansour, équipe BioMov-E.
