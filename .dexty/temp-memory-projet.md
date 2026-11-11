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
- DevOps / Déploiement : Caddyfile, Standalone Next.js build (`server.js`), scripts d'infrastructure nettoyés et traduits en français (`.zscripts/`).
- Qualité & Audit : ESLint 9 (100% validé), Tests d'intégration bash (100% validés), Next.js Build Standalone (100% validé).

### Architecture & Organisation
- `src/app/` : Routes App Router (`page.tsx` SPA multi-vues, `/admin/page.tsx` espace administration, `/api/` endpoints).
- `src/components/shop/` : Composants e-commerce (`Header`, `Footer`, `HomePage`, `CatalogView`, `ProductView`, `CartView`, `CheckoutView`, `OrderSuccessView`, `AccountView`, `MobileDock`).
- `src/components/admin/` : Espace d'administration (`AdminView`, gestion catalogue/commandes).
- `src/lib/` : Store Zustand, utilitaires, client Prisma.
- `prisma/` : Schéma Prisma (`schema.prisma`) avec modèles `User` et `Post`.
- `.dexty/` : Gouvernance DEXTY v2.2, contrats de tâches (`task-contracts/`), mémoire dynamique (`temp-memory-projet.md`), snapshots (`snapshots/`).
- `.project-memory/` : Mémoire persistante Dexty 3.5.1 (`MAP.md`, `STATE.md`, `ERRORS.md`, `REFUSALS.md`, `DECISIONS.md`, `SUCCESSES.md`).
- `agents/` : Les 8 agents spécialisés canoniques Dexty (`01-product-manager.md` à `08-project-memory.md`).
- `.agents/skills.lock` : 24 skills contextuels verrouillés et audités cryptographiquement (SHA-256).

---

## 2. CONTEXTE DE TÂCHE

```yaml
task_context:
  previous:
    id: "TASK-002-MERGE-DEXTY-AGENT-SKILLS"
    status: "DONE"
    result: "Installation et fusion de Dexty Agent Skills 3.5.1 avec le noyau DEXTY v2.2."
    files_changed:
      - "agents/"
      - ".project-memory/"
      - ".agents/"
      - "tools/"
      - "AGENTS.md"
    important_decisions:
      - "Unification des agents et de la mémoire de travail."

  current:
    id: "TASK-003-PURGE-AND-FRENCH-TRANSLATION"
    objective: "Assainissement complet du projet : suppression des traces / dépendances Z-AI, purge du logo Z externe, remplacement par le blason officiel Maison Cauris SVG, traduction 100% français des commentaires et messages de scripts."
    branch: "main"
    status: "COMPLETED"
    files_in_scope:
      - "package.json"
      - ".gitignore"
      - "public/logo.svg"
      - "src/app/layout.tsx"
      - "scripts/build_images.py"
      - "scripts/img_*.sh"
      - ".zscripts/build.sh"
      - ".zscripts/database-runtime-build.sh"
      - ".zscripts/dev.sh"
      - ".zscripts/mini-services-build.sh"
      - ".zscripts/mini-services-install.sh"
      - ".zscripts/mini-services-start.sh"
      - ".zscripts/python-runtime-build.sh"
      - ".zscripts/start.sh"
      - "tests/database-runtime-build.sh"
      - "src/components/admin/AdminView.tsx"
      - ".project-memory/STATE.md"
      - ".project-memory/SUCCESSES.md"
      - ".dexty/temp-memory-projet.md"
    constraints:
      - "Ne casser aucun script ni processus de build Next.js"
      - "Zéro caractère chinois restant dans les fichiers de code et scripts"
      - "Valider le linter ESLint et le build Next.js"

  future:
    known_tasks:
      - id: "TASK-004-CATALOG-DATA-MODEL"
        objective: "Évolution du schéma Prisma SQLite pour le catalogue e-commerce Maison Cauris (Produits, Variantes, Commandes, Panier)"
        dependency: "TASK-003-PURGE-AND-FRENCH-TRANSLATION"
        status: "READY"

  cross_branch:
    inspected_branches:
      - "main"
    relevant_changes: []
    conflicts: []
    decisions_found: []

  temporary_memory:
    facts:
      - "Dépendance 'z-ai-web-dev-sdk' retirée de package.json."
      - "Scripts résiduels scripts/build_images.py et scripts/img_*.sh supprimés."
      - "Logo public/logo.svg redessiné avec un cauris doré stylisé sur fond noir avec bordure or."
      - "Favicon layout.tsx basculé sur le logo local /logo.svg au lieu de l'URL CDN chatglm."
      - "Tous les scripts de .zscripts/ et tests/ traduits en français avec signatures Nexus Partners."
      - "Erreur ESLint dans AdminView.tsx résolue (useMemo sur orders.filter)."
      - "Build standalone Next.js exécuté avec succès (13.6s de compilation)."
    decisions:
      - "Purge totale des artefacts externes de l'ancien générateur tiers."
    discoveries:
      - "Le projet est désormais 100% propre, autonome et francisé."
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

## 4. SCHÉMAS & DONNÉES
- Base : SQLite (`db/custom.db`)
- Modèles Prisma : `User`, `Post`
