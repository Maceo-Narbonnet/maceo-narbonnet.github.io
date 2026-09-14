---
lang: en
key: hive
order: 6
kind: project
title: Hive — a C++ board game with a Qt interface
tagline: An object-oriented C++ implementation of the board game Hive, with a hexagonal board drawn in Qt.
period: UTC · LO21
context: LO21 — Object-oriented programming in C++, UTC
stack: [C++, Qt]
tags: [C++, OOP, Qt, game]
github: https://github.com/Maceo-Narbonnet/HIVE-LO21
cover: /img/hive-cover.svg
coverAlt: Stylised hexagonal grid, evoking the Hive game board
coverFit: contain
featured: false
---

## The project

*Hive* is a two-player strategy game with no fixed board: the pieces — insects with distinct movement rules — themselves form the hexagonal "hive", and the goal is to surround the opponent's queen.

This project, carried out for the **LO21** course (object-oriented programming), implements the game logic in **C++**: a model of the pieces and their movement rules, game management, and a **Qt** graphical interface with a hexagonal-grid widget, in several versions (plain grid, coloured grid, grid with insect icons).

## What it contains

- `Game` / `Pieces` — the game logic: pieces, rules, game flow.
- `GrilleWidget` / `case` — the hexagonal board rendering in Qt, with the graphic assets of the five basic insects (bee, spider, ant, grasshopper, beetle).

A learning project more than a showcase: it illustrates the object modelling of a rule-rich game and the separation between logic and interface. The repository does not have a detailed README yet.
