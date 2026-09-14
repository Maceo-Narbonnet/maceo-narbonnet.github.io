---
lang: fr
key: realtime-kernel
order: 3
kind: project
title: Héritage de priorité dans un noyau temps réel préemptif
tagline: Résoudre l'inversion de priorité sur ARM Cortex-M7 en transformant un ordonnanceur à priorités fixes en ordonnanceur à priorités dynamiques, puis en construisant dessus un mutex à héritage de priorité.
period: avril 2026
context: UE MI11 — Systèmes temps réel, UTC · mini-projet individuel, soutenance avec démo live sur QEMU
role: Conception et implémentation — mutex, files d'ordonnancement dynamiques, primitives de priorité, scénarios de démonstration
stack: [C, ARM Cortex-M7, QEMU, GCC arm-none-eabi, GDB, Eclipse CDT]
tags: [temps réel, ordonnancement, bare-metal, synchronisation, embarqué]
github: https://github.com/Maceo-Narbonnet/Real-time-kernel-and-priority
cover: /img/rtk-scenario3.svg
coverAlt: Chronogramme du scénario avec héritage de priorité, une ligne par niveau de priorité
coverFit: contain
results:
  - { value: 'borné', label: 'temps de blocage de la tâche prioritaire, au lieu d’illimité' }
  - { value: '3', label: 'scénarios exécutables : inversion, priorité dynamique, héritage' }
  - { value: '0', label: 'changement d’identité de tâche — l’identité est découplée de la priorité' }
---

## Le problème

Dans un noyau préemptif à priorités fixes, trois tâches et une ressource partagée suffisent à casser les garanties temps réel :

- **A** (priorité basse) prend le mutex, puis exécute une longue section critique ;
- **B** (priorité moyenne) est purement calculatoire, **ne touche jamais au mutex**, ne bloque jamais ;
- **C** (priorité haute) veut le mutex que A détient.

C est la tâche la plus urgente du système, et pourtant elle est bloquée **indéfiniment** par B — une tâche qui n'a rien à voir avec le mutex et qui est *moins* urgente qu'elle. Le temps de blocage n'est borné par rien : c'est l'**inversion de priorité**, inacceptable dans un système temps réel.

![Chronogramme du scénario 1 : inversion de priorité non bornée](/img/rtk-scenario1.svg)
*Scénario 1 — C ne récupère jamais le mutex : B monopolise le processeur pendant que A, préemptée, ne peut pas finir sa section critique.*

## La solution

Quand une tâche prioritaire demande un mutex détenu par une tâche moins prioritaire, **le détenteur hérite temporairement de la priorité du demandeur**. Il passe alors devant la tâche de priorité moyenne, termine sa section critique, libère le mutex, et retrouve sa priorité de base.

L'inversion non bornée devient une inversion **bornée** : C attend exactement une section critique de A, et rien de plus.

![Chronogramme du scénario 3 : inversion bornée par héritage de priorité](/img/rtk-scenario3.svg)
*Scénario 3 — même programme, mutex à héritage : A monte à la priorité de C, termine, libère ; C obtient le mutex.*

## Ce que j'ai implémenté

Le projet est construit en trois couches — *problème → outil → solution* — chacune avec sa propre démo exécutable.

### 1. Un mutex

Plus qu'un sémaphore binaire : il a un **propriétaire**, seul le propriétaire peut le libérer, et il est **récursif** (une reprise par le même propriétaire incrémente un compteur au lieu de bloquer). Toute la comptabilité est protégée par les macros `_lock_()` / `_unlock_()` du noyau (sauvegarde/désactivation/restauration de PRIMASK), donc atomique vis-à-vis de l'interruption de tick. Cette version est volontairement **aveugle aux priorités** : elle sert à reproduire l'inversion.

### 2. Un ordonnanceur à priorités dynamiques

C'était le vrai problème d'ingénierie. Dans le noyau d'origine, la priorité d'une tâche était **encodée dans son identité** (`id = priorité << 3 | index`) et les files de prêts étaient un tableau 2D indexé par priorité. Changer la priorité aurait changé l'id — et cassé toutes les références détenues par les mutex, FIFO et files d'attente. **La priorité était structurellement immuable.**

La solution : découpler identité et priorité en déplaçant les files round-robin **dans les TCB eux-mêmes**. Chaque niveau de priorité devient une liste circulaire simplement chaînée à travers les TCB, avec un pointeur de queue par niveau. Quatre champs ajoutés au TCB (`prio`, `prio_base`, `id`, `suivant`) et trois primitives :

- `noyau_set_t_prio(id, prio)` — retire la tâche de son round-robin, met à jour sa priorité, la réinsère au nouveau niveau, et relance l'ordonnanceur ;
- `noyau_get_t_prio(id)` — priorité courante ;
- `noyau_get_t_base_prio(id)` — priorité de base, point de restauration.

`file_ajoute`, `file_retire` et `file_suivant` gardent leur signature d'origine : le reste du noyau n'est pas touché, et **l'identité d'une tâche ne change jamais**.

### 3. Un mutex à héritage de priorité

Même interface, préfixée `m_pi_*`. Toute la solution tient en deux appels : à l'acquisition, si le mutex est détenu par une tâche moins urgente, le détenteur hérite de la priorité du demandeur avant que celui-ci ne s'endorme ; à la libération, le détenteur est ramené à sa priorité de base avant de transmettre le mutex. L'élévation est strictement temporaire et ne fait que *monter* une priorité.

## Démonstration

Trois scénarios, sélectionnés par un `#define`, s'exécutent sur un Cortex-M7 émulé par QEMU, avec un chronogramme ANSI rendu en direct sur le terminal série (une ligne par niveau de priorité, une cellule colorée par tick) :

- **Scénario 1 — inversion** : `"C: j'ai obtenu le mutex"` **ne s'affiche jamais**.
- **Scénario 2 — priorité dynamique** : C re-priorise A à l'exécution ; la ligne de A change de comportement sur-le-champ.
- **Scénario 3 — héritage** : même programme que le scénario 1, `m_pi_*` à la place de `m_*` — cette fois C **obtient** le mutex.

Les scénarios 1 et 3 exécutent *exactement le même programme de test* avec seulement les fonctions de mutex échangées : c'est ce qui fait du contraste une preuve plutôt qu'une anecdote.

## Limites, assumées à l'oral

- **L'inversion est bornée, pas éliminée** : B s'exécute légitimement tant que C n'a rien demandé. L'héritage plafonne l'attente une fois la contention réelle — c'est exactement ce que promet le protocole, rien de plus.
- **Le chronogramme affiche la priorité statique** : une tâche élevée par héritage continue de dessiner sur sa ligne d'origine. L'ordonnanceur est correct ; seule la visualisation est en retard.
- **Pas d'héritage transitif ni de protocole à plafond de priorité** : un seul niveau d'héritage, ce qui couvre le sujet mais pas une chaîne de mutex imbriqués.

Le noyau de base (démarrage Cortex-M7, UART, files à priorités fixes, sémaphores, FIFO, chronogramme) est fourni par l'équipe pédagogique MI11 ; ma contribution couvre les deux mutex, les files à priorités dynamiques, l'extension des TCB et les trois primitives, ainsi que les scénarios et le support de soutenance.
