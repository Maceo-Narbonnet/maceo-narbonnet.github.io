---
lang: fr
key: hive
order: 6
kind: project
title: Hive — jeu de plateau en C++ avec interface Qt
tagline: Implémentation du jeu de société Hive en C++ orienté objet, avec un plateau hexagonal dessiné en Qt.
period: UTC · LO21
context: UE LO21 — Programmation orientée objet en C++, UTC
stack: [C++, Qt]
tags: [C++, POO, Qt, jeu]
github: https://github.com/Maceo-Narbonnet/HIVE-LO21
cover: /img/hive-cover.svg
coverAlt: Grille hexagonale stylisée, évoquant le plateau du jeu Hive
coverFit: contain
featured: false
---

## Le projet

*Hive* est un jeu de stratégie à deux joueurs sans plateau fixe : les pièces — des insectes aux déplacements distincts — forment elles-mêmes la « ruche » hexagonale, et le but est d'encercler la reine adverse.

Ce projet, réalisé dans le cadre de l'UE **LO21** (programmation orientée objet), en implémente la logique de jeu en **C++** : modèle des pièces et de leurs règles de déplacement, gestion de la partie, et une interface graphique **Qt** avec un widget de grille hexagonale, déclinée en plusieurs versions (grille simple, grille colorée, grille avec les icônes des insectes).

## Ce qu'il contient

- `Game` / `Pieces` — la logique du jeu : pièces, règles, déroulement de la partie.
- `GrilleWidget` / `case` — le rendu du plateau hexagonal en Qt, avec les ressources graphiques des cinq insectes de base (abeille, araignée, fourmi, sauterelle, scarabée).

Un projet d'apprentissage plus qu'une vitrine : il illustre la modélisation objet d'un jeu à règles riches et la séparation entre logique et interface. Le dépôt n'a pas encore de README détaillé.
