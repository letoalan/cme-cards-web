# Rapport de livraison — Landing Page CME de Saint-Junien

## 1. Fichiers créés ou modifiés

### Fichiers créés
- `index.html` : Nouvelle page d'accueil et landing page informative centrée sur le Conseil municipal des enfants de Saint-Junien, introduisant les missions citoyennes et proposant le jeu de cartes en second pour approfondir.
- `landing.css` : Stylesheet complète et autonome de la landing page (tokens de design, typographie système, responsive desktop/mobile, contrastes vérifiés et règle `prefers-reduced-motion`).
- `landing.js` : Scripts légers et résilients pour la landing page (calcul dynamique des compteurs et exemples de catégories, génération de 6 cartes d'aperçu, menu mobile accessible, défilement fluide et raccourcis clavier).
- `data/cards.json` : Source unique des données des 32 cartes citoyennes, réutilisée à la fois par les scripts et les tests.
- `tests/test_landing_page.py` : Suite de 16 tests automatisés vérifiant la conformité stricte du cahier des charges `landing.md`.
- `output/reports/landing_page_validation.md` : Rapport standardisé de validation selon la grille demandée.
- `output/reports/landing_page_delivery_report.md` : Le présent rapport de livraison.

### Fichiers migrés / modifiés
- `cartes.html` : Galerie interactive complète des 32 cartes (renommée/dupliquée depuis l'ancien `index.html`), enrichie d'un lien de retour vers l'accueil.
- `app.js` : Conservé et enrichi pour interpréter les paramètres d'URL (`?category=...`, `?card=...`, `?random=1`) et l'ancre `#presentation`.
- `styles.css` : Conservé et complété avec la classe de mise en valeur `.highlighted-card` et la règle `@media (prefers-reduced-motion: reduce)`.

---

## 2. Stratégie de migration de la galerie

- Conformément aux consignes de l'option 1 ("Deux pages HTML"), l'ancienne page principale `index.html` contenant les 32 cartes et leurs interactions (mode grille, retournement recto/verso, pioche aléatoire, mode dyslexie, diaporama PowerPoint 16:9) a été migrée vers `cartes.html`.
- Tous les identifiants sémantiques (`cardsGrid`, `btnPresentationMode`, `btnRandomDraw`, `btnFlipAll`, `btnDyslexic`, `modalOverlay`, etc.) et données embarquées (`cmeCardsData`) ont été conservés à l'identique.
- Un lien de navigation « 🏠 Accueil » a été intégré dans l'en-tête de `cartes.html` pour permettre une circulation fluide et intuitive entre la landing page et la galerie.

---

## 3. Stratégie de chargement des données hors ligne

- Afin de garantir un fonctionnement sans faille lors d'une ouverture locale par double-clic (`file://`), le site n'effectue aucun appel bloquant via l'API `fetch()`.
- Les 32 objets cartes sont intégrés directement dans `index.html` au sein d'une balise standard :
  ```html
  <script id="cards-data" type="application/json">
    [...]
  </script>
  ```
- Au chargement du DOM, `landing.js` parse ce script local en mémoire de manière synchrone.
- Un fallback transparent est également prévu pour tenter un `fetch("data/cards.json")` si le site est déployé sur un serveur web HTTP/HTTPS.
- Aucune ressource distante (CDN, polices Google Fonts en ligne, librairies externes ou scripts de traçage) n'est requise.

---

## 4. Interactions ajoutées sur la Landing Page

1. **Visuel Hero en éventail** :
   - Présentation de 5 mini-cartes représentatives (CME-01, CME-07, CME-14, CME-19, CME-29), aux couleurs de leurs familles respectives.
   - Les cartes réagissent au survol et au focus, et un clic ou appui sur Entrée ouvre directement la carte ciblée dans `cartes.html?card=CME-XX`.
2. **Panneaux des 5 familles citoyennes** :
   - Compteurs dynamiques calculés depuis le JSON (ex: "6 cartes", "8 cartes").
   - Injection dynamique de 2 à 3 exemples de titres réels issus de la base.
   - Bouton d'action et carte cliquable menant au filtre correspondant dans la galerie.
3. **Section « Aperçu des cartes » (6 cartes dynamiques)** :
   - Sélection automatique d'une carte représentative par catégorie, complétée par une 6e carte aléatoire.
   - Rendu de l'icône locale dans un disque blanc, du numéro, du titre, du verbe d'action et d'un lien sémantique `Voir la carte`.
4. **Bouton « Tirer une carte au sort »** :
   - Navigation directe vers `cartes.html?random=1`, ouvrant immédiatement la fenêtre modale de pioche aléatoire.
5. **Menu de navigation mobile accessible** :
   - Bouton hamburger avec gestion des attributs ARIA (`aria-expanded`, `aria-controls`).
   - Fermeture automatique au clic sur un lien ou par pression sur la touche `Échap`.
6. **Bouton « Retour en haut »** :
   - Défilement fluide vers l'ancre `#top`, respectant l'option d'accessibilité `prefers-reduced-motion`.

---

## 5. Liens et paramètres supportés entre Landing et Galerie

| URL / Paramètre | Rôle sur la galerie `cartes.html` |
|---|---|
| `cartes.html` | Ouvre la galerie complète (32 cartes visibles, mode standard). |
| `cartes.html?category=CODE` | Active le filtre de la catégorie demandée (`DEMOCRATIE`, `COMMUNE`, `QUOTIDIEN`, `SOLIDARITE`, `PROJET`). |
| `cartes.html?card=CME-XX` | Fait défiler la page jusqu'à la carte ciblée, la met en valeur par un surlignage animé et lui donne le focus clavier. |
| `cartes.html?random=1` | Déclenche automatiquement le tirage aléatoire et ouvre la vue grand format. |
| `cartes.html#presentation` | Lance immédiatement le mode diaporama PowerPoint 16:9 en plein écran. |
| `cartes.html?card=CME-XX#presentation` | Lance le diaporama directement positionné sur la carte désignée. |

---

## 6. Résultat des tests automatisés

La commande `pytest -v tests/test_landing_page.py` valide l'intégralité des 17 points de contrôle :

```text
tests/test_landing_page.py::test_01_index_html_exists PASSED             [  5%]
tests/test_landing_page.py::test_02_cartes_html_exists_and_contains_gallery PASSED [ 11%]
tests/test_landing_page.py::test_03_landing_css_and_js_exist PASSED      [ 17%]
tests/test_landing_page.py::test_04_landing_main_texts_present PASSED    [ 23%]
tests/test_landing_page.py::test_05_single_h1_tag PASSED                 [ 29%]
tests/test_landing_page.py::test_06_five_categories_rendered PASSED      [ 35%]
tests/test_landing_page.py::test_07_dynamic_card_counter_and_json_source PASSED [ 41%]
tests/test_landing_page.py::test_08_category_filter_links PASSED         [ 47%]
tests/test_landing_page.py::test_09_no_manual_32_cards_hardcoded_in_landing PASSED [ 52%]
tests/test_landing_page.py::test_10_embedded_json_for_offline_mode PASSED [ 58%]
tests/test_landing_page.py::test_11_gallery_supports_query_params_and_hash PASSED [ 64%]
tests/test_landing_page.py::test_12_no_external_network_dependencies PASSED [ 70%]
tests/test_landing_page.py::test_13_prefers_reduced_motion_rule PASSED   [ 76%]
tests/test_landing_page.py::test_14_all_landing_images_local_and_valid PASSED [ 82%]
tests/test_landing_page.py::test_15_essential_controls_and_nav_links PASSED [ 88%]
tests/test_landing_page.py::test_16_pedagogical_data_integrity PASSED    [ 94%]
tests/test_landing_page.py::test_17_recruitment_modalities_and_survey_link PASSED [100%]

============================== 17 passed in 0.04s ==============================
```

---

## 7. Limites identifiées et recommandations

- **Polices système** : Afin de respecter la contrainte 100% hors ligne sans aucun appel CDN Google Fonts, la typographie s'appuie sur la pile moderne locale (`"Aptos", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Le rendu typographique est net et réactif sur tous les navigateurs récents.
- **Support JavaScript désactivé** : Si un navigateur désactive totalement JavaScript en local sous `file://`, la landing page reste parfaitement lisible et sémantique avec ses liens d'ancres et vers la galerie ; seuls les compteurs dynamiques et le carrousel d'échantillon nécessitent JavaScript.
