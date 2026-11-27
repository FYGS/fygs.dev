# Spec — Refonte de la page d'accueil

Statut : **figée** (2026-11-27). Toute évolution passe par un amendement daté en bas de ce fichier.
Branche : `feat/homepage-redesign` (depuis `develop`). Implémentation : à partir du 2026-11-28.

## 1. Objectif et cible

- **Action n°1** : un décideur technique ou un fondateur contacte Fernand pour une **mission ou un projet** (freelance / conseil).
- **Action secondaire** : découvrir les formations (une simple ligne vers `/formations`).
- **Cible** : CTO, responsables techniques, fondateurs qui cherchent un ingénieur à embaucher. Les apprenants sont servis par les pages formations.
- **Marché** : remote France / Europe en priorité, Afrique de l'Ouest en second (via Ouestech).

## 2. Positionnement

Ingénieur logiciel à dominante **backend et cloud** (AWS, microservices, API REST), capable de faire du fullstack (projets clients livrés). Il code avec des **agents IA** dans un cadre de méthode strict. Angle : *livrer vite un backend solide grâce à l'IA agentique, sans vibe coding.*

Brouillon d'accroche (à reformuler à l'implémentation, première personne, ton direct) :

> Ingénieur backend et cloud (AWS, microservices, API REST). Je livre des produits fiables, vite, avec des agents IA et une méthode : spec figée, tests d'abord, revue systématique.

« Une pépite de la tech » : ton de l'à-propos ou du sous-titre, pas du titre principal.

**Axe IA (amendement 1)** : l'IA agentique est un pilier explicite du message. Fernand se présente comme **développeur augmenté par l'IA** (ingénierie agentique), avec un **flow rigoureux, pas du vibe coding**. Cet axe apparaît dans le hero (sous-titre), dans la section Méthode (titre et introduction) et dans l'à-propos. Les mots exacts sont adaptés à l'implémentation. Contrainte : décrire le flow réel (spec, tests d'abord, revue, PR) et ne jamais promettre de résultat chiffré sur le gain de productivité sans preuve (règle §4).

## 3. Structure de la page (de haut en bas)

1. **Hero** : accroche, sous-titre, bouton principal « Parler de votre projet », bouton secondaire « Voir mes projets ».
2. **Méthode** (titre axé « développeur augmenté par l'IA, flow rigoureux, pas du vibe coding » ; 6 étapes, mots propres) : onboarding de la base de code et fixation des dev rules (existantes ou à définir) → cadrage et spec figée en sortie → tests qui échouent → implémentation de la feature → revue et corrections → PR.
3. **Projets** (5 fiches, voir §5).
4. **Façons de travailler** : 2 ou 3 formats (audit/cadrage, mission de delivery, renfort d'équipe), sans prix affiché, plus un bloc « Ce que je ne fais pas » : pas de design, pas de mission sans cadrage.
5. **Stack** : liste courte, sans barres de niveau ni « Expert 5+ ans ».
6. **À propos et Ouestech** : quelques lignes, vraie photo (`public/images/fernand_photo.png`, portrait fond blanc : à cadrer dans une carte ou un masque pour la page sombre, servie via `next/image`), « 9 ans d'ingénierie logicielle », Ouestech comme référence et lien sortant.
7. **Contact** : le bloc contact reste, adapté (voir §6).
8. **Pied de page** : ligne discrète vers `/formations`, sans prix ni chiffres.

**Retirés de l'accueil** : section formations, témoignages, appel à l'action « offre limitée » (le bloc « Transformez votre carrière » déménage sur `/formations` et `/parcours`). **Conservé** : le bloc « Ressources & Tendances » (aperçu du blog).

## 4. Règle d'or du contenu : rien sans preuve

Retirés, sauf preuve écrite de leur véracité : « 15 000+ étudiants formés », « 94 % de réussite », « +47 % de salaire », « plus de 15 000 développeurs », témoignages Airbnb et tout témoignage non vérifiable (dont celui attribué à « Mohamed Kaba » sur la fiche NCR), « lignes de code » comme statistique, niveaux de compétences en barres. Chaque chiffre affiché doit renvoyer à un fait réel.

## 5. Projets affichés

Fiches sobres : contexte, part de Fernand, stack, fait vérifiable. Sans témoignage ni statistique inventée.

| Projet | Contenu |
|---|---|
| **NCR** | Numérisation des certificats de résidence en Guinée. Multi-tenant, accès par rôles, paiement Orange Money. Next.js, Prisma, Appwrite, Docker. |
| **QuizZen** | Préparation à l'entretien de naturalisation française. Plus de 1 000 questions, répétition espacée, paiement Stripe. Next.js, Prisma, PostgreSQL. |
| **A'Numérique** | Site d'une **association** contre l'illectronisme. **Pas de paiement ni de Stripe.** Réservation via Google Calendar, CRM sur mesure. Corriger la fiche existante. |
| **Les Délices de la Rachetée** | Vitrine et commande de pâtisseries, configurateur de gâteaux, paiement Stripe. |
| **Ouestech** | Site vitrine de la société co-fondée (ouestech.com). Lien sortant. |
| **Cas confidentiel** | « Grand groupe d'assurance européen. API REST de gestion documentaire sur AWS (Lambda, architecture microservices). Sous confidentialité. » Aucun nom, chiffre ni détail d'architecture. Si le contrat l'interdit, remplacer par « grand groupe européen ». |

Chaque mention « en production » doit être confirmée par Fernand avant publication. Les autres projets de la page actuelle sortent de l'accueil.

## 6. Contact

- Le contact reste **toujours accessible** : bouton « Me contacter » fixe dans l'en-tête, bloc contact en bas de page, email en alternative.
- Le formulaire existant reçoit 3 champs de qualification : type de besoin, délai, cadrage existant ou non (filtre les missions sans cadrage).
- Pas de prise de rendez-vous en ligne pour l'instant.

## 7. Langues

Français et anglais, complets (Intlayer). L'espagnol retombe sur l'anglais pour cette page ; il reste actif sur le reste du site.

## 8. Visuel et ton

- Ton : audacieux mais crédible, voix directe à la première personne, sans effets gratuits nuisant à la lisibilité et à la performance.
- Visuel : couleurs et polices du site conservées, typographie plus affirmée. Par défaut : page sombre, sobre, un seul accent de couleur. **À ajuster si Fernand fournit des références visuelles.**
- Périmètre : page d'accueil et son en-tête / pied de page. Le reste du site garde son design.

## 9. Critères de réussite

- Performance mobile : Lighthouse ≥ 90, LCP < 2,5 s.
- Accessibilité : Lighthouse ≥ 95.
- Aucune affirmation sans preuve (voir §4).
- Contenu fr et en complet, aucune clé de traduction manquante.
- Suivi du formulaire de contact : nombre de messages reçus, pour comparer avant et après.

## 10. Découpage en PR (ordre de livraison, tests d'abord)

1. **Contenu fr et en** : textes de la page, fiches projet corrigées (A'Numérique, retrait des témoignages et statistiques non prouvés, ajout du cas confidentiel).
2. **Sections** : hero, méthode, projets, formats de mission, stack, à propos.
3. **En-tête, contact, pied de page** : bouton « Me contacter » fixe, bloc contact adapté avec ses 3 champs, ligne formations.
4. **Performance et accessibilité** : mesures Lighthouse, correctifs.

## 11. Revue locale obligatoire (amendement 3)

À la fin de **chaque PR**, l'application est lancée en local (`npm run dev`, puis `npm run build && npm start` pour la PR 4) et l'URL est donnée à Fernand pour visualiser le rendu, en fr et en en. Aucune PR n'est présentée comme terminée sans ce lancement.

## 12. Points ouverts avant implémentation

- Confirmer la mention « en production » de chaque projet.
- Vérifier que le contrat autorise « grand groupe d'assurance » et « AWS Lambda ».
- Fournir si possible 2 ou 3 références visuelles (la photo est fournie).
- Reformuler les 3 formats de mission (audit/cadrage, delivery, renfort) selon la réalité.

## Amendements

- **2026-11-27, amendement 1** : axe « IA agentique / développeur augmenté par l'IA, flow rigoureux, pas du vibe coding » ajouté au §2 et à la structure (§3).
- **2026-11-27, amendement 2** : photo fournie, copiée dans `public/images/fernand_photo.png`.
- **2026-11-27, amendement 4** : axe « conception de SaaS sur mesure et d'applications web métier » dans le hero, le format de mission « delivery » (renommé SaaS & applications métier sur mesure), l'à-propos et le SEO. Stack regroupée en 3 blocs (backend & cloud, web & produit, ingénierie IA agentique avec harnais d'agents) et note sur le rôle du harnais.
- **2026-11-27, amendement 5** : contact. Nouveau type « Un projet ou une mission » (valeur `project`, par défaut du formulaire) et deux champs optionnels, délai (`timeline`) et cadrage (`framing`), affichés pour les types projet et collaboration. Schéma partagé dans `lib/contact-qualification.ts` (formulaire et API), lignes « Délai » et « Cadrage » dans l'email reçu. Bouton « Me contacter » dans l'en-tête (bureau et mobile) vers `/#contact`. Le pied de page lie déjà `/formations` : inchangé.
- **2026-11-27, amendement 6** : le bloc « Ressources & Tendances » (aperçu du blog) revient sur l'accueil, entre À propos et Contact (il avait été retiré à tort, §3 le disait retiré : corrigé). Le bloc « Transformez votre carrière de développeur » quitte l'accueil et passe en bas de `/formations` et `/parcours` (composant `components/formations/formations-cta.tsx`), réécrit sans chiffres, garantie ni offre limitée : seuls les faits du catalogue (formations pratiques, exercices et quiz, certificat) restent. L'ancien composant `CallToAction` est supprimé.
- **2026-11-27, amendement 3** : lancement local obligatoire à la fin de chaque PR (§11).
