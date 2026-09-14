---
lang: fr
key: traffic-sign-detection
order: 2
kind: project
title: Détection de panneaux routiers sans deep learning
tagline: Un détecteur d'objets construit avec des descripteurs classiques et un Random Forest — et surtout un banc d'évaluation honnête, qui a fait passer l'AP de 0,095 à 0,293.
period: mai – juin 2026
context: UE SY32 — Vision et apprentissage artificiels, UTC · projet en binôme
role: Pipeline de détection, métriques et protocole d'évaluation, hard negative mining
stack: [Python, scikit-learn, scikit-image, OpenCV, NumPy]
tags: [vision par ordinateur, machine learning, HOG, Random Forest, évaluation]
github: https://github.com/Maceo-Narbonnet/traffic-sign-detection
cover: /img/tsd-ok.webp
coverAlt: Panneau routier correctement détecté et encadré dans une photo de rue
results:
  - { value: '0,095 → 0,293', label: 'AP sur le jeu de validation' }
  - { value: '×18', label: 'précision sur le serveur de test, sans réentraîner' }
  - { value: '1 858', label: 'dimensions du descripteur HOG + HSV + LBP' }
---

## La contrainte

À partir d'une photo de rue, produire des **boîtes englobantes** de panneaux de signalisation, chacune avec un score de confiance. Règle du jeu imposée par l'UE : **l'apprentissage profond est interdit**. Uniquement des méthodes classiques de vision et d'apprentissage (`scikit-learn`, `scikit-image`, OpenCV). Une partie du jeu de test comporte en plus des images à distorsion *fisheye*, absentes de l'entraînement.

Les rendus sont évalués sur un serveur UTC dont les annotations de test ne sont jamais révélées.

## Le pipeline

- **Préparation des exemples** — chargement des images et annotations, découpage des panneaux, échantillonnage des négatifs.
- **Descripteurs** — HOG (9 orientations, cellules 8×8) + histogramme HSV (36 + 32 + 16) + LBP uniforme (P = 8, R = 1), soit un vecteur de **1 858 dimensions** par imagette 64×64.
- **Classifieur** — Random Forest à 100 arbres.
- **Hard negative mining** — réinjection des faux positifs les plus « durs », à plusieurs échelles.
- **Détection** — fenêtre glissante multi-échelle sur pyramide gaussienne (×1,25), avec pré-filtre couleur HSV.
- **Suppression des non-maxima** — IoU 0,3.

## Mesurer avant d'optimiser

Le pipeline initial affichait **98,96 % d'*accuracy* sur imagettes**… pour une AP de **0,095** en détection réelle. Le premier livrable a donc été un banc d'évaluation digne de ce nom : IoU, précision/rappel, AP, F1, et un **jeu de validation sans fuite de données** (découpage *par image*, jamais par imagette).

Chaque idée a ensuite été mesurée puis **conservée ou écartée sur les chiffres** — y compris les essais non concluants, documentés tels quels dans le journal de bord du dépôt.

![Progression de l'AP au fil des améliorations](/img/tsd-ap.webp)
*Sur 68 images de validation (147 panneaux, IoU ≥ 0,5) : baseline 0,095 → correction du découpage des positifs 0,173 → hard negative mining multi-échelle 0,293.*

Le hard negative mining apporte un double gain : **+69 % d'AP** *et* **−43 % de détections**, c'est-à-dire beaucoup moins de faux positifs.

![Courbe précision/rappel](/img/tsd-pr.webp)
*Courbe précision/rappel du détecteur final sur la validation.*

## Diagnostiquer plutôt que réentraîner

La première soumission sur le serveur UTC a révélé un défaut majeur : un rappel correct (31 %) mais une précision de **0,82 %** — environ 99 fausses boîtes sur 100. Le diagnostic : un seuil de score volontairement bas (utile pour tracer la courbe AP, désastreux en soumission).

La seconde soumission, avec un seuil de 0,6 et **sans réentraînement**, a confirmé l'analyse : **précision ×18, F1 ×12, AUC de 18,6 % à 23,7 %**. Le gain le plus spectaculaire du projet n'a coûté aucun calcul, seulement une lecture attentive d'un écart précision/rappel anormal.

![Effet du seuil de score sur le serveur UTC](/img/tsd-submission.webp)
*Les deux soumissions au serveur d'évaluation : même modèle, seul le point de fonctionnement change.*

## Ce qui échoue, et pourquoi

![Façade en brique massivement sur-détectée](/img/tsd-fail.webp)
*Cas d'échec typique : les structures répétitives (façades, stores, fenêtres) restent la principale source de faux positifs.*

Les limites sont assumées et documentées :

- précision encore faible dans l'absolu ;
- fenêtre glissante coûteuse (≈ 13 s par image, l'essentiel dans le calcul du HOG) ;
- NMS en O(n²) ;
- panneaux triangulaires mal reconnus, *fisheye* peu robuste — l'augmentation par distorsion testée dégradait l'AP (0,284 → 0,221) et a été écartée.

Un détail qui a son importance : deux exécutions du même code donnaient des AP différentes (0,284 puis 0,232) parce que le module `random` de Python n'était pas figé, seul NumPy l'était. Corrigé, et noté.

## Documentation

Le dépôt contient le rapport complet (9 pages), une documentation technique fonction par fonction, le journal expérimental brut (mesures datées, régressions, impasses) et une note dédiée au hard negative mining. Le jeu de données (341 images, 662 boîtes) appartient à l'UTC et n'est pas redistribué.
