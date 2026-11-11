# DEXTY — Mémoire Projet

> Généré automatiquement — Ne pas éditer manuellement
> @author @hopsyder | Nexus Partners

## 1. ÉTAT COURANT

### Méta-projet
- Nom : Maison Cauris (Dépôt : NEWLAND)
- Finalité : Boutique e-commerce haut de gamme de maroquinerie, accessoires et objets d'art inspirés de l'Afrique et des cauris avec catalogue, panier, checkout et administration.
- Date d'initialisation : 2026-11-11
- Dernière synchronisation : 2026-11-11
- Niveau de confiance : VERIFIED
- Branche active : `main`
- Environnement Agent : Fusion complète **DEXTY v2.2 (Nexus Partners)** & **Dexty Agent Skills v3.5.1** (`Hop-Syder/Dexty-agent-skills-2026`).

### Stack
- Frontend : Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS, Shadcn UI / Radix UI, Zustand (`useShop`), Lucide Icons.
- Backend : Next.js API Routes / Server Actions.
- Base de données : SQLite via Prisma ORM (`@prisma/client` ^6.11.1).
- Package Manager / Runtime : Bun (`bun.lock`).
- DevOps / Déploiement : Caddyfile, Standalone Next.js build (`server.js`), scripts personnalisés (`scripts/`, `.zscripts/`).
- Qualité & Audit : ESLint 9, TypeScript strict, SkillSpector / SHA-256 Skills Verification.

### Architecture & Organisation
- `src/app/` : Routes App Router (`page.tsx` SPA multi-vues, `/admin/page.tsx` espace administration, `/api/` endpoints).
- `src/components/shop/` : Composants e-commerce (`Header`, `Footer`, `HomePage`, `CatalogView`, `ProductView`, `CartView`, `CheckoutView`, `OrderSuccessView`, `AccountView`, `MobileDock`).
- `src/components/admin/` : Espace d'administration (`AdminView`, gestion catalogue/commandes).
- `src/lib/` : Store Zustand, utilitaires, client Prisma.
- `prisma/` : Schéma Prisma (`schema.prisma`) avec modèles `User` et `Post` (à faire évoluer vers catalogue e-commerce).
- `.dexty/` : Gouvernance DEXTY v2.2, contrats de tâches (`task-contracts/`), mémoire dynamique (`temp-memory-projet.md`), snapshots (`snapshots/`).
- `.project-memory/` : Mémoire persistante Dexty 3.5.1 (`MAP.md`, `STATE.md`, `ERRORS.md`, `REFUSALS.md`, `DECISIONS.md`, `SUCCESSES.md`).
- `agents/` : Les 8 agents spécialisés canoniques Dexty (`01-product-manager.md` à `08-project-memory.md`).
- `.agents/skills.lock` : 24 skills contextuels verrouillés et audités cryptographiquement (SHA-256).

---

## 2. CONTEXTE DE TÂCHE

```yaml
task_context:
  previous:
    id: "TASK-001-SETUP-DEXTY"
    status: "DONE"
    result: "Installation du socle DEXTY v2.2 sur NEWLAND."
    files_changed:
      - ".dexty/temp-memory-projet.md"
    important_decisions:
      - "Création du dossier .dexty/ et initialisation de la mémoire."

  current:
    id: "TASK-002-MERGE-DEXTY-AGENT-SKILLS"
    objective: "Installation et fusion du framework Dexty Agent Skills 3.5.1 (Hop-Syder/Dexty-agent-skills-2026) avec l'agent DEXTY"
    branch: "main"
    status: "COMPLETED"
    files_in_scope:
      - "agents/"
      - ".project-memory/"
      - ".agents/"
      - "tools/"
      - "docs/super-agent/"
      - "skills.catalog.json"
      - "AGENTS.md"
      - "CLAUDE.md"
      - "VERSION"
      - "wake.sh"
      - "skills-sync.sh"
      - "skills-check.sh"
      - ".dexty/temp-memory-projet.md"
    constraints:
      - "Intégrité cryptographique SHA-256 des skills"
      - "Zéro conflit entre .dexty et .project-memory"
      - "Conservation de la stack et des règles Nexus Partners"

  future:
    known_tasks:
      - id: "TASK-003-CATALOG-DATA-MODEL"
        objective: "Évolution du schéma Prisma SQLite pour le catalogue e-commerce Maison Cauris (Produits, Variantes, Commandes, Panier)"
        dependency: "TASK-002-MERGE-DEXTY-AGENT-SKILLS"
        status: "READY"

  cross_branch:
    inspected_branches:
      - "main"
    relevant_changes: []
    conflicts: []
    decisions_found: []

  temporary_memory:
    facts:
      - "Hop-Syder/Dexty-agent-skills-2026 installé avec succès dans NEWLAND."
      - "Onboarding exécuté pour Maison Cauris : 24 skills sélectionnés et verrouillés."
      - "Les 8 fiches d'agents sont disponibles sous agents/ et prêtes à être appelées."
    decisions:
      - "Unification de la mémoire DEXTY (.dexty/temp-memory-projet.md) et de la mémoire persistante Dexty 3.5.1 (.project-memory/)."
      - "Toutes les règles et verrouillages SHA-256 sont opérationnels."
    discoveries:
      - "Le projet est une boutique e-commerce Maison Cauris intégrée avec composants shop et admin déjà bien avancés."
    blockers: []
    pending_actions: []
```

---

## 3. LES 8 AGENTS SPÉCIALISÉS INTÉGRÉS

| Agent | Rôle & Fiche | Spécialité |
| :--- | :--- | :--- |
| **① Product Manager** | `@agents/01-product-manager.md` | Cadrage du besoin, specs, découpage MVP & ADRs |
| **② Workflow / UX Owner** | `@agents/02-workflow-ux-owner.md` | Parcours clients, UI/UX Maison Cauris, design tokens |
| **③ Security Lead** | `@agents/03-security-lead.md` | Garde-fous, audit Trail of Bits, protection données & checkout |
| **④ Build / Dev Lead** | `@agents/04-build-dev-lead.md` | Code TDD, Next.js App Router, implémentations techniques |
| **⑤ DevOps / Release** | `@agents/05-devops-release.md` | Déploiement standalone Bun, Caddy, CI/CD, observabilité |
| **⑥ QA / Evaluator** | `@agents/06-qa-evaluator.md` | Évaluation neutre et indépendante (ne code jamais) |
| **⑦ Data / ML** | `@agents/07-data-ml.md` | Schéma Prisma, migrations de données, modèles de stocks |
| **⑧ Project Memory** | `@agents/08-project-memory.md` | Continuité de session, synchronisation et garde de vision |

---

## 4. SKILLS VERROUILLÉS (24/24 Vérifiés SHA-256)
- `idea-refine`, `spec-driven-development`, `planning-and-task-breakdown`, `documentation-and-adrs`
- `frontend-ui-engineering`, `frontend-design`, `no-ai-design-slop`, `build-awwwards-quality-sites`
- `security-and-hardening`, `security-threat-model`, `security-best-practices`, `differential-review`, `security-awareness`
- `incremental-implementation`, `requesting-code-review`, `react-best-practices`, `composition-patterns`
- `context-engineering`, `doubt-driven-development`, `dispatching-parallel-agents`, `subagent-driven-development`
- `observability-and-instrumentation`, `vercel-deploy`, `postgres-best-practices`
