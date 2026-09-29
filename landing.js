// ==========================================================================
// Logique interactive — Landing Page Cartes CME
// Fonctionnement autonome 100% hors ligne (file://) sans dépendance réseau
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Récupération robuste des données des 32 cartes
  let cardsData = [];

  const embeddedScript = document.getElementById("cards-data");
  if (embeddedScript) {
    try {
      cardsData = JSON.parse(embeddedScript.textContent);
    } catch (err) {
      console.warn("Impossible de parser les données JSON embarquées:", err);
    }
  }

  // Fallback si exécuté sous un serveur HTTP local et que le script n'était pas rempli
  if (!cardsData || cardsData.length === 0) {
    if (window.location.protocol.startsWith("http")) {
      fetch("data/cards.json")
        .then((res) => res.json())
        .then((data) => {
          cardsData = data;
          initDynamicContent(cardsData);
        })
        .catch((err) => {
          console.error("Erreur de chargement du fichier data/cards.json:", err);
        });
    }
  } else {
    initDynamicContent(cardsData);
  }

  // 2. Initialisation des composants dynamiques
  function initDynamicContent(cards) {
    if (!cards || cards.length === 0) return;

    // A. Mise à jour des compteurs et exemples pour les 5 catégories
    const categories = ["DEMOCRATIE", "COMMUNE", "QUOTIDIEN", "SOLIDARITE", "PROJET"];

    categories.forEach((catCode) => {
      const catCards = cards.filter((c) => c.category_code === catCode);
      const countEl = document.querySelector(`.cat-count[data-cat="${catCode}"]`);
      if (countEl) {
        countEl.textContent = `${catCards.length} cartes`;
      }

      // 2 ou 3 exemples de titres par catégorie
      const listEl = document.querySelector(`.cat-sample-titles[data-cat="${catCode}"]`);
      if (listEl) {
        listEl.innerHTML = "";
        const sampleCards = catCards.slice(0, 3);
        sampleCards.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = c.title;
          listEl.appendChild(li);
        });
      }
    });

    // B. Rendu dynamique de la section « Aperçu des cartes » (6 cartes)
    const previewGrid = document.getElementById("previewCardsGrid");
    if (previewGrid) {
      previewGrid.innerHTML = "";

      // 1 carte représentative par catégorie
      const selectedCards = [];
      categories.forEach((catCode) => {
        const catCards = cards.filter((c) => c.category_code === catCode);
        if (catCards.length > 0) {
          // On prend une carte représentative (la 1ère ou milieu)
          const chosen = catCards[0];
          selectedCards.push(chosen);
        }
      });

      // 6e carte choisie au hasard parmi les autres cartes
      const remainingCards = cards.filter(
        (c) => !selectedCards.some((s) => s.id === c.id)
      );
      if (remainingCards.length > 0) {
        const randomIdx = Math.floor(Math.random() * remainingCards.length);
        selectedCards.push(remainingCards[randomIdx]);
      }

      // Injection dans le DOM
      selectedCards.forEach((card) => {
        const cardArticle = document.createElement("article");
        cardArticle.className = `preview-card bg-${card.category_code}`;
        cardArticle.setAttribute("aria-label", `Carte ${card.id} : ${card.title}`);

        const numStr = String(card.number).padStart(2, "0");
        const imgName = card.image_file ? card.image_file.split("/").pop() : "";
        const imgSrc = `assets/${imgName}`;
        const hasDistinctVerb =
          card.action_verb &&
          card.action_verb.toLowerCase() !== card.title.toLowerCase();

        cardArticle.innerHTML = `
          <div class="preview-card-header">
            <span class="preview-badge-num">${numStr}</span>
            <span class="preview-cat-name">${card.category_code}</span>
          </div>
          <div class="preview-card-body">
            <div class="preview-disc">
              <img src="${imgSrc}" alt="${card.alternative_text || card.title}" loading="lazy">
            </div>
            ${hasDistinctVerb ? `<div class="preview-verb-badge">— ${card.action_verb} —</div>` : ""}
            <h3 class="preview-title">${card.title}</h3>
            <a href="cartes.html?card=${card.id}" class="preview-action" aria-label="Voir la carte ${card.id} : ${card.title}">
              <span>Voir la carte</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        `;

        previewGrid.appendChild(cardArticle);
      });
    }
  }

  // 3. Gestion du Menu Mobile accessible
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNav");

  if (mobileToggle && mainNav) {
    function toggleMobileMenu(forceClose = false) {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
      const shouldOpen = forceClose ? false : !isExpanded;

      mobileToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      mobileToggle.setAttribute("aria-label", shouldOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation");
      mainNav.classList.toggle("is-open", shouldOpen);
    }

    mobileToggle.addEventListener("click", () => {
      toggleMobileMenu();
    });

    // Fermeture avec la touche Échap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        toggleMobileMenu(true);
        mobileToggle.focus();
      }
    });

    // Fermeture automatique lors du clic sur un lien du menu
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mainNav.classList.contains("is-open")) {
          toggleMobileMenu(true);
        }
      });
    });
  }

  // 4. Défilement fluide vers le haut ("Retour en haut")
  const btnScrollTop = document.getElementById("btnScrollTop");
  if (btnScrollTop) {
    btnScrollTop.addEventListener("click", () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  // 5. Clics sur les mini-cartes du Hero pour explorer la carte correspondante
  const heroMiniCards = document.querySelectorAll(".hero-mini-card");
  heroMiniCards.forEach((cardEl) => {
    cardEl.addEventListener("click", () => {
      const cardId = cardEl.getAttribute("data-card-id");
      if (cardId) {
        window.location.href = `cartes.html?card=${cardId}`;
      }
    });
    cardEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const cardId = cardEl.getAttribute("data-card-id");
        if (cardId) {
          window.location.href = `cartes.html?card=${cardId}`;
        }
      }
    });
  });
});
