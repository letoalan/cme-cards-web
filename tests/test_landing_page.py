"""
Tests automatisés de conformité et de validation de la Landing Page CME (Phase Landing).
Vérifie les 16 critères impératifs du cahier des charges landing.md :
1. Présence de index.html
2. Présence de cartes.html et accessibilité de la galerie
3. Présence de landing.css et landing.js
4. Textes principaux obligatoires
5. Unicité stricte de la balise <h1>
6. Présence et affichage des 5 familles de missions
7. Compteur de cartes dynamique calculé depuis le JSON
8. Liens de filtres par catégorie
9. Non-duplication manuelle des 32 cartes dans le HTML
10. Intégration du JSON pour le fonctionnement hors ligne
11. Prise en charge des paramètres (category, card, random, #presentation) par la galerie
12. Absence totale de requêtes ou ressources distantes (http/https)
13. Règle d'accessibilité prefers-reduced-motion
14. Validité locale des chemins d'images
15. Présence des contrôles et liens de navigation essentiels
16. Intégrité des contenus de data/cards.json et specs/CARDS.md
"""

import json
import os
import re
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent


@pytest.fixture
def index_html_content():
    index_file = ROOT_DIR / "index.html"
    assert index_file.is_file(), "index.html doit exister à la racine"
    return index_file.read_text(encoding="utf-8")


@pytest.fixture
def cartes_html_content():
    cartes_file = ROOT_DIR / "cartes.html"
    assert cartes_file.is_file(), "cartes.html doit exister à la racine"
    return cartes_file.read_text(encoding="utf-8")


@pytest.fixture
def cards_data():
    data_file = ROOT_DIR / "data" / "cards.json"
    assert data_file.is_file(), "data/cards.json doit exister"
    with open(data_file, "r", encoding="utf-8") as f:
        return json.load(f)


def test_01_index_html_exists():
    """1. Vérifie que index.html existe et a une taille substantielle."""
    index_path = ROOT_DIR / "index.html"
    assert index_path.is_file()
    assert index_path.stat().st_size > 3000


def test_02_cartes_html_exists_and_contains_gallery(cartes_html_content):
    """2. Vérifie que cartes.html existe et contient bien la galerie de 32 cartes."""
    assert 'id="cardsGrid"' in cartes_html_content
    for i in range(1, 33):
        card_id = f"CME-{i:02d}"
        assert f'data-id="{card_id}"' in cartes_html_content, f"Carte {card_id} manquante dans cartes.html"


def test_03_landing_css_and_js_exist():
    """3. Vérifie l'existence des fichiers landing.css et landing.js dédiés."""
    assert (ROOT_DIR / "landing.css").is_file()
    assert (ROOT_DIR / "landing.js").is_file()
    assert (ROOT_DIR / "landing.css").stat().st_size > 1000
    assert (ROOT_DIR / "landing.js").stat().st_size > 500


def test_04_landing_main_texts_present(index_html_content):
    """4. Vérifie la présence de tous les textes essentiels et de l'ancrage Saint-Junien."""
    expected_snippets = [
        "Conseil municipal des enfants",
        "Saint-Junien",
        "Et si les idées des enfants faisaient bouger Saint-Junien ?",
        "Explorer les 32 cartes",
        "Découvrir les missions",
        "Un lieu pour comprendre, proposer et agir",
        "Écouter",
        "Débattre",
        "Agir",
        "Les 5 familles de missions",
        "Démocratie et représentation",
        "Comprendre la commune",
        "Améliorer la vie quotidienne",
        "Agir pour tous",
        "Construire un projet",
        "Un jeu pour apprendre en participant",
        "Tirer une carte au sort",
        "Aperçu des cartes",
        "Pour la classe et le collège",
        "Pour les CM1-CM2",
        "Pour les 6e-5e",
        "Prêts à faire entendre vos idées ?",
        "Lancer le diaporama",
        "Fonctionne hors ligne",
    ]
    for snippet in expected_snippets:
        assert snippet in index_html_content, f"Texte obligatoire manquant : '{snippet}'"


def test_05_single_h1_tag(index_html_content):
    """5. Vérifie qu'il n'y a strictement qu'un seul titre <h1> dans index.html."""
    h1_matches = re.findall(r"<h1\b[^>]*>(.*?)</h1>", index_html_content, re.IGNORECASE | re.DOTALL)
    assert len(h1_matches) == 1, f"Attendu exactement 1 balise <h1>, trouvé {len(h1_matches)}"
    assert "Et si les idées des enfants faisaient bouger Saint-Junien ?" in h1_matches[0]


def test_06_five_categories_rendered(index_html_content):
    """6. Vérifie que les cinq catégories officielles sont bien présentes."""
    cats = ["DEMOCRATIE", "COMMUNE", "QUOTIDIEN", "SOLIDARITE", "PROJET"]
    for cat in cats:
        assert f'cat-{cat}' in index_html_content or f'data-cat="{cat}"' in index_html_content


def test_07_dynamic_card_counter_and_json_source(index_html_content, cards_data):
    """7. Vérifie que le calcul des cartes se base sur le JSON (32 cartes au total)."""
    assert len(cards_data) == 32
    counts = {}
    for c in cards_data:
        code = c["category_code"]
        counts[code] = counts.get(code, 0) + 1

    assert counts["DEMOCRATIE"] == 6
    assert counts["COMMUNE"] == 6
    assert counts["QUOTIDIEN"] == 6
    assert counts["SOLIDARITE"] == 6
    assert counts["PROJET"] == 8

    # Vérifie la présence des sélecteurs de compteurs dynamiques data-cat
    for cat in counts.keys():
        assert f'class="family-count-badge cat-count" data-cat="{cat}"' in index_html_content


def test_08_category_filter_links(index_html_content):
    """8. Vérifie que les liens vers les filtres de cartes existent avec la syntaxe ?category=CODE."""
    cats = ["DEMOCRATIE", "COMMUNE", "QUOTIDIEN", "SOLIDARITE", "PROJET"]
    for cat in cats:
        assert f'cartes.html?category={cat}' in index_html_content


def test_09_no_manual_32_cards_hardcoded_in_landing(index_html_content):
    """9. Vérifie que les 32 cartes ne sont pas dupliquées manuellement sous forme de balises d'articles entières."""
    # La galerie cartes.html contient les 32 card-container, index.html ne doit PAS les contenir en dur
    card_containers_count = len(re.findall(r'class="card-container"', index_html_content))
    assert card_containers_count == 0, f"index.html ne doit pas intégrer les 32 card-container en dur (trouvé {card_containers_count})"


def test_10_embedded_json_for_offline_mode(index_html_content, cards_data):
    """10. Vérifie que les données JSON sont bien intégrées via une balise script type='application/json'."""
    match = re.search(r'<script\s+id="cards-data"\s+type="application/json">(.*?)</script>', index_html_content, re.DOTALL)
    assert match is not None, "Balise <script id='cards-data' type='application/json'> introuvable"
    embedded_data = json.loads(match.group(1).strip())
    assert len(embedded_data) == 32
    assert embedded_data[0]["id"] == "CME-01"
    assert embedded_data[-1]["id"] == "CME-32"


def test_11_gallery_supports_query_params_and_hash():
    """11. Vérifie que app.js implémente le support de ?category, ?card, ?random et #presentation."""
    app_js_path = ROOT_DIR / "app.js"
    assert app_js_path.is_file()
    js_content = app_js_path.read_text(encoding="utf-8")

    assert "urlParams.get(\"category\")" in js_content or 'urlParams.get("category")' in js_content
    assert "urlParams.get(\"card\")" in js_content or 'urlParams.get("card")' in js_content
    assert "urlParams.get(\"random\")" in js_content or 'urlParams.get("random")' in js_content
    assert 'window.location.hash === "#presentation"' in js_content or "#presentation" in js_content


def test_12_no_external_network_dependencies(index_html_content):
    """12. Vérifie qu'aucun CDN, police distante ou tracker http/https n'est appelé."""
    landing_css = (ROOT_DIR / "landing.css").read_text(encoding="utf-8")
    landing_js = (ROOT_DIR / "landing.js").read_text(encoding="utf-8")

    for file_name, content in [("index.html", index_html_content), ("landing.css", landing_css), ("landing.js", landing_js)]:
        # Chercher des urls http:// ou https:// (hors attributs xmlns et lien officiel de candidature demandé par l'utilisateur)
        urls = re.findall(r'https?://[^\s"\'<>]+', content)
        # Filtrer xmlns et lien de formulaire externe
        active_urls = [
            u for u in urls
            if not u.startswith("http://www.w3.org/") and "edurl.fr/candidatcme" not in u
        ]
        assert len(active_urls) == 0, f"Ressource externe interdite détectée dans {file_name} : {active_urls}"


def test_13_prefers_reduced_motion_rule():
    """13. Vérifie que la directive prefers-reduced-motion est présente dans les feuilles de style."""
    landing_css = (ROOT_DIR / "landing.css").read_text(encoding="utf-8")
    styles_css = (ROOT_DIR / "styles.css").read_text(encoding="utf-8")

    assert "@media (prefers-reduced-motion: reduce)" in landing_css
    assert "@media (prefers-reduced-motion: reduce)" in styles_css
    assert "animation-duration: 0.01ms !important" in landing_css


def test_14_all_landing_images_local_and_valid(index_html_content):
    """14. Vérifie que toutes les balises <img> de index.html pointent vers des fichiers existants sur le disque."""
    img_srcs = re.findall(r'<img\s+[^>]*src="([^"]+)"', index_html_content)
    assert len(img_srcs) > 0, "Des images doivent être affichées sur la landing"

    for src in img_srcs:
        # Enlever les éventuels paramètres de requête
        clean_src = src.split("?")[0]
        file_path = ROOT_DIR / clean_src
        assert file_path.is_file(), f"Fichier image local manquant : {clean_src}"


def test_15_essential_controls_and_nav_links(index_html_content):
    """15. Vérifie la présence des liens et boutons principaux demandés."""
    assert 'href="#decouvrir"' in index_html_content
    assert 'href="#missions"' in index_html_content
    assert 'href="cartes.html"' in index_html_content
    assert 'href="cartes.html#presentation"' in index_html_content
    assert 'href="cartes.html?random=1"' in index_html_content
    assert 'id="mobileMenuToggle"' in index_html_content
    assert 'id="btnScrollTop"' in index_html_content


def test_16_pedagogical_data_integrity(cards_data):
    """16. Vérifie que le contenu pédagogique de data/cards.json n'a pas été corrompu."""
    assert len(cards_data) == 32
    # Vérification des champs clés pour chaque carte
    for c in cards_data:
        assert "id" in c and c["id"].startswith("CME-")
        assert "title" in c and len(c["title"]) > 0
        assert "mission_text" in c and len(c["mission_text"]) > 0
        assert "challenge_text" in c and len(c["challenge_text"]) > 0
        assert "category_code" in c and c["category_code"] in {
            "DEMOCRATIE", "COMMUNE", "QUOTIDIEN", "SOLIDARITE", "PROJET"
        }

    # Si specs/CARDS.md est accessible dans le dépôt parent ou local, vérifier son existence
    parent_specs = ROOT_DIR.parent / "cme-cards" / "specs" / "CARDS.md"
    if parent_specs.is_file():
        assert parent_specs.stat().st_size > 1000


def test_17_recruitment_modalities_and_survey_link(index_html_content):
    """17. Vérifie que les modalités de recrutement (Élections CM1/CM2, volontariat et lien sondage) sont présentes."""
    assert "CM1" in index_html_content and "CM2" in index_html_content
    assert "élection" in index_html_content.lower() or "elections" in index_html_content.lower()
    assert "volontariat" in index_html_content.lower()
    assert "edurl.fr/candidatcme" in index_html_content
