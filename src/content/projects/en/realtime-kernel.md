---
lang: en
key: realtime-kernel
order: 3
kind: project
title: Priority inheritance in a preemptive real-time kernel
tagline: Solving priority inversion on ARM Cortex-M7 by turning a fixed-priority scheduler into a dynamic-priority one, then building a priority-inheritance mutex on top of it.
period: April 2026
context: MI11 — Real-time systems, UTC · individual mini-project, oral defence with a live QEMU demo
role: Design and implementation — mutex, dynamic ready queues, priority primitives, demo scenarios
stack: [C, ARM Cortex-M7, QEMU, GCC arm-none-eabi, GDB, Eclipse CDT]
tags: [real-time, scheduling, bare-metal, synchronisation, embedded]
github: https://github.com/Maceo-Narbonnet/Real-time-kernel-and-priority
cover: /img/rtk-scenario3.svg
coverAlt: Chronogram of the priority-inheritance scenario, one row per priority level
coverFit: contain
results:
  - { value: 'bounded', label: 'blocking time of the high-priority task, instead of unbounded' }
  - { value: '3', label: 'runnable scenarios: inversion, dynamic priority, inheritance' }
  - { value: '0', label: 'task identity changes — identity is decoupled from priority' }
---

## The problem

In a preemptive fixed-priority kernel, three tasks and one shared resource are enough to break real-time guarantees:

- **A** (low priority) takes the mutex, then runs a long critical section;
- **B** (medium priority) is CPU-bound, **never touches the mutex**, never blocks;
- **C** (high priority) wants the mutex A is holding.

C is the most urgent task in the system, yet it is blocked **indefinitely** by B — a task that has nothing to do with the mutex and is *less* urgent than C. The blocking time is bounded by nothing: this is **priority inversion**, unacceptable in a real-time system.

![Chronogram of scenario 1: unbounded priority inversion](/img/rtk-scenario1.svg)
*Scenario 1 — C never gets the mutex: B monopolises the CPU while A, preempted, cannot finish its critical section.*

## The solution

When a high-priority task requests a mutex held by a lower-priority one, **the holder temporarily inherits the requester's priority**. It then outranks the medium-priority task, finishes its critical section, releases the mutex, and drops back to its base priority.

Unbounded inversion becomes **bounded** inversion: C waits for exactly one critical section of A, and nothing more.

![Chronogram of scenario 3: inversion bounded by priority inheritance](/img/rtk-scenario3.svg)
*Scenario 3 — same program, inheritance mutex: A is raised to C's priority, finishes, releases; C gets the mutex.*

## What I implemented

The project is built in three layers — *problem → tool → solution* — each with its own runnable demo.

### 1. A mutex

More than a binary semaphore: it has an **owner**, only the owner may release it, and it is **recursive** (a re-entrant take increments a counter instead of deadlocking). All bookkeeping is protected by the kernel's `_lock_()` / `_unlock_()` macros (PRIMASK save/disable/restore), hence atomic with respect to the tick interrupt. This version is deliberately **priority-blind**: it exists to reproduce the inversion.

### 2. A dynamic-priority scheduler

This was the real engineering problem. In the original kernel, a task's priority was **encoded in its identity** (`id = priority << 3 | index`) and the ready queues were a 2D array indexed by priority. Changing a priority would have changed the id — and broken every reference held by mutexes, FIFOs and wait queues. **Priority was structurally immutable.**

The fix: decouple identity from priority by moving the round-robin queues **into the TCBs themselves**. Each priority level becomes a circular singly-linked list chained through the TCBs, with one tail pointer per level. Four fields added to the TCB (`prio`, `prio_base`, `id`, `suivant`) and three primitives:

- `noyau_set_t_prio(id, prio)` — removes the task from its round-robin, updates its priority, re-inserts it at the new level, and reschedules;
- `noyau_get_t_prio(id)` — current priority;
- `noyau_get_t_base_prio(id)` — base priority, the restoration point.

`file_ajoute`, `file_retire` and `file_suivant` keep their original signatures: the rest of the kernel is untouched, and **a task's identity never changes**.

### 3. A priority-inheritance mutex

Same interface, prefixed `m_pi_*`. The whole solution is two calls: on acquire, if the mutex is held by a less urgent task, the holder inherits the requester's priority before the requester goes to sleep; on release, the holder is restored to its base priority before the mutex is handed over. The elevation is strictly temporary and only ever *raises* a priority.

## Demonstration

Three scenarios, selected by a `#define`, run on a QEMU-emulated Cortex-M7, with a live ANSI chronogram on the serial terminal (one row per priority level, one coloured cell per tick):

- **Scenario 1 — inversion**: `"C: j'ai obtenu le mutex"` **never prints**.
- **Scenario 2 — dynamic priority**: C re-prioritises A at runtime; A's row changes behaviour on the spot.
- **Scenario 3 — inheritance**: the same program as scenario 1, `m_pi_*` instead of `m_*` — this time C **does** get the mutex.

Scenarios 1 and 3 run *the exact same test program* with only the mutex functions swapped, which is what makes the contrast a proof rather than an anecdote.

## Limitations, defended at the oral

- **Inversion is bounded, not eliminated**: B legitimately runs as long as C has not requested anything. Inheritance only caps the wait once contention actually occurs — exactly what the protocol promises, nothing more.
- **The chronogram renders the static priority**: a task elevated by inheritance keeps drawing on its original row. The scheduler is correct; only the visualisation lags behind.
- **No transitive inheritance and no priority-ceiling protocol**: a single level of inheritance, which covers the assignment but not a chain of nested mutexes.

The base kernel (Cortex-M7 startup, UART, fixed-priority queues, semaphores, FIFO, chronogram) is provided by the MI11 teaching team; my contribution covers both mutexes, the dynamic-priority queues, the TCB extension and the three primitives, plus the scenarios and the defence material.
