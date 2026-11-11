# DEXTY — Mémoire Projet

> Généré automatiquement — Ne pas éditer manuellement
> @author @hopsyder | Nexus Partners

## 1. ÉTAT COURANT

### Méta-projet
- Nom : NEWLAND
- Type : Application Web Full Stack (Next.js 15+ App Router, Tailwind CSS, Shadcn UI, Prisma)
- Date d'initialisation : 2026-11-11
- Dernière synchronisation : 2026-11-11
- Niveau de confiance : HIGH
- Branche active : `main`

### Stack
- Frontend : Next.js App Router (TypeScript, React 19 / Server Components, Tailwind CSS v4, Lucide React, Shadcn/Radix UI, Dnd-kit)
- Backend : Next.js API Routes / Server Actions
- Base de données : SQLite (configuré dans `prisma/schema.prisma` via `DATABASE_URL`)
- ORM : Prisma (`@prisma/client` ^6.11.1)
- Package Manager / Runtime : Bun (`bun.lock`)
- Auth : À configurer / selon spécifications
- DevOps / Serveur : Caddyfile, Standalone Next.js build
- Qualité : ESLint 9 (`eslint.config.mjs`), TypeScript strict (`tsconfig.json`)

### Architecture & Organisation
- `src/` : code source Next.js (pages, composants, api, lib)
- `prisma/` : schéma Prisma et migrations
- `public/` : assets statiques
- `scripts/` & `.zscripts/` : scripts utilitaires de build et déploiement
- `tests/` : suites de tests

---

## 2. CONTEXTE DE TÂCHE

```yaml
task_context:
  previous:
    id: "INIT"
    status: "DONE"
    result: "Initialisation et installation de l'environnement DEXTY v2.2 sur le projet NEWLAND."
    files_changed:
      - ".dexty/temp-memory-projet.md"
    important_decisions:
      - "Adoption du protocole DEXTY v2.2 Nexus Partners."
      - "Stack reconnue : Next.js App Router, Prisma ORM (SQLite), Bun, Tailwind CSS, Shadcn UI."

  current:
    id: "TASK-001-SETUP-DEXTY"
    objective: "Installation et configuration complète de l'agent DEXTY pour NEWLAND"
    branch: "main"
    status: "COMPLETED"
    files_in_scope:
      - ".dexty/temp-memory-projet.md"
    constraints:
      - "Respecter les règles de gouvernance DEXTY v2.2"
      - "Mettre à jour .dexty/temp-memory-projet.md avant tout commit/push"

  future:
    known_tasks:
      - id: "TASK-002"
        objective: "Selon demandes de l'utilisateur sur NEWLAND"
        dependency: "TASK-001-SETUP-DEXTY"
        status: "PENDING"

  cross_branch:
    inspected_branches:
      - "main"
    relevant_changes: []
    conflicts: []
    decisions_found: []

  temporary_memory:
    facts:
      - "Agent DEXTY opérationnel avec le noyau v2.2 Nexus Partners sous Google Antigravity IDE."
      - "Accès aux modules M01-M12 sous ~/.gemini/modules et aux 180+ skills disponibles."
    decisions:
      - "Création de l'arborescence .dexty/ (task-contracts, snapshots, temp-memory-projet.md)."
    discoveries:
      - "Le projet utilise Bun comme package manager et Prisma ORM avec SQLite."
    blockers: []
    pending_actions: []
```

---

## 3. SKILL REGISTRY (Projet NEWLAND)

Skills ciblés pour ce projet :
- `nextjs-app-router-patterns`
- `nextjs-best-practices`
- `shadcn`
- `tailwind-patterns`
- `prisma-expert`
- `clean-code`
- `typescript-pro`
- `lint-and-validate`

---

## 4. SCHÉMAS & DONNÉES
- Modèles actuels Prisma (`prisma/schema.prisma`) :
  - `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`)
  - `Post` (`id`, `title`, `content`, `published`, `authorId`, `createdAt`, `updatedAt`)
- Fournisseur BDD : `sqlite`

---

## 5. PIÈGES & CONTRAINTES DÉCOUVERTES
- Runtime : Bun utilisé pour l'exécution et le verrouillage (`bun.lock`).
- Build : Mode standalone avec scripts de copie statique dans `package.json`.
