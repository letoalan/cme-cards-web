# Validation de la landing page CME

## Livrables
- index.html : Présent, page d'accueil autonome responsive avec structure sémantique complète et JSON embarqué
- cartes.html : Présent, galerie interactive des 32 cartes avec modes grille, retournement, filtres, pioche et diaporama 16:9
- landing.css : Présent, styles dédiés sans dépendance externe, tokens de design system, responsive et accessibilité
- landing.js : Présent, logique dynamique offline (calcul des compteurs par catégorie, aperçu 6 cartes, menu mobile accessible, retour haut)

## Données
- Nombre de cartes : 32 cartes conformes aux spécifications
- Catégories : 5 familles (DEMOCRATIE: 6, COMMUNE: 6, QUOTIDIEN: 6, SOLIDARITE: 6, PROJET: 8)
- Source de données : `data/cards.json` et balise `<script id="cards-data" type="application/json">` embarquée dans `index.html`
- Fonctionnement file:// : Oui, 100% autonome et sans erreur de cross-origin (CORS) grâce au JSON intégré

## Accessibilité
- H1 unique : Conforme (`<h1>Et si les idées des enfants faisaient bouger Saint-Junien ?</h1>`)
- Navigation clavier : Conforme, tous les boutons et liens sont focusables (Tab), menu mobile fermable avec Échap, cartes aperçu sémantiques
- Images alternatives : Conforme, attributs `alt` explicites pour les images informatives et `alt=""` pour les pictogrammes décoratifs
- Focus visible : Conforme, `:focus-visible` stylisé avec anneau contrasté bleu `--democratie`
- Réduction des animations : Conforme, directive `@media (prefers-reduced-motion: reduce)` intégrée dans `landing.css` et `styles.css`
- Ressources externes : Aucune (0 police Google Fonts, 0 CDN, 0 analytics, 0 appel HTTP/HTTPS distant)

## Intégration avec la galerie
- Filtre category : Pris en charge via `cartes.html?category=CODE` (activation automatique du bouton filtre et affichage ciblé)
- Ouverture card : Pris en charge via `cartes.html?card=CME-XX` (défilement centré, mise en valeur visuelle et focus clavier)
- Tirage aléatoire : Pris en charge via `cartes.html?random=1` (déclenchement de la modale de tirage aléatoire)
- Lancement diaporama : Pris en charge via `cartes.html#presentation` (ouverture directe de la présentation plein écran 16:9)

## Tests
- Commande : `pytest -v tests/test_landing_page.py`
- Résultat : 16 passed in 0.05s (100% de réussite)

## Verdict
- PASS
