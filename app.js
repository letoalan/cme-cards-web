// Logique interactive des cartes CME Web (Mode Galerie & Diaporama PowerPoint 16:9)
document.addEventListener("DOMContentLoaded", () => {
  const cardsGrid = document.getElementById("cardsGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cardContainers = document.querySelectorAll(".card-container");
  const btnFlipAll = document.getElementById("btnFlipAll");
  const btnRandomDraw = document.getElementById("btnRandomDraw");
  const btnPresentationMode = document.getElementById("btnPresentationMode");
  const btnDyslexic = document.getElementById("btnDyslexic");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalSlot = document.getElementById("modalSlot");

  // Contrôles Mode Présentation PowerPoint
  const presentationOverlay = document.getElementById("presentationOverlay");
  const presentationFrame = document.getElementById("presentationFrame");
  const presPrevBtn = document.getElementById("presPrevBtn");
  const presNextBtn = document.getElementById("presNextBtn");
  const presFlipBtn = document.getElementById("presFlipBtn");
  const presCloseBtn = document.getElementById("presCloseBtn");
  const presInfo = document.getElementById("presInfo");

  let allFlipped = false;
  let currentCardIndex = 0;
  let currentSlideFace = "recto"; // "recto" ou "verso"
  let cardsData = [];

  // Charger les données de cartes intégrées
  const dataScript = document.getElementById("cmeCardsData");
  if (dataScript) {
    try {
      cardsData = JSON.parse(dataScript.textContent);
    } catch (e) {
      console.error("Erreur de lecture des données JSON des cartes", e);
    }
  }

  // 1. Retournement individuel d'une carte en mode grille
  cardContainers.forEach((card, idx) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        card.classList.toggle("flipped");
      }
    });

    // Double-clic ouvre directement la carte en mode présentation PowerPoint
    card.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      openPresentationAt(idx, "recto");
    });
  });

  // 2. Bouton : Tout retourner (Recto <-> Verso)
  if (btnFlipAll) {
    btnFlipAll.addEventListener("click", () => {
      allFlipped = !allFlipped;
      cardContainers.forEach((card) => {
        if (allFlipped) {
          card.classList.add("flipped");
        } else {
          card.classList.remove("flipped");
        }
      });
      btnFlipAll.textContent = allFlipped ? "🔄 Voir tous les rectos" : "🔄 Voir tous les versos";
    });
  }

  // 3. Filtrage dynamique par catégorie
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.getAttribute("data-cat");
      cardContainers.forEach((card) => {
        const cardCat = card.getAttribute("data-category");
        if (cat === "ALL" || cardCat === cat) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // 4. Mode Pioche Aléatoire (Tirage au sort)
  if (btnRandomDraw) {
    btnRandomDraw.addEventListener("click", () => {
      const visibleCards = Array.from(cardContainers).filter(
        (c) => c.style.display !== "none"
      );
      if (visibleCards.length === 0) return;

      const randomIndex = Math.floor(Math.random() * visibleCards.length);
      const chosenCard = visibleCards[randomIndex];

      modalSlot.innerHTML = "";
      const clone = chosenCard.cloneNode(true);
      clone.classList.remove("flipped");
      clone.addEventListener("click", () => {
        clone.classList.toggle("flipped");
      });
      clone.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          clone.classList.toggle("flipped");
        }
      });
      modalSlot.appendChild(clone);
      modalOverlay.classList.add("active");
    });
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    modalSlot.innerHTML = "";
  }
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // =========================================================================
  // 5. MODE PRÉSENTATION POWERPOINT 16:9 AVEC RETOURNEMENT 3D ANIMÉ
  // =========================================================================
  function renderPowerPointCard3D(card) {
    const numStr = String(card.number).padStart(2, "0");
    const catCode = card.category_code;
    const catLabel = card.category_label || catCode;
    const catIcon = card.category_icon || "🗳️";
    const title = card.title || "";
    const actionVerb = card.action_verb || "";
    const missionIntro = card.mission_intro || "Au CME, je peux…";
    const missionText = card.mission_text || "";
    const challengeLabel = card.challenge_label || "Défi";
    const challengeText = card.challenge_text || "";
    const imgName = card.image_file ? card.image_file.split("/").pop() : "";
    const imgSrc = `assets/${imgName}`;

    const verbHtml = (actionVerb.toLowerCase() !== title.toLowerCase())
      ? `<div class="slide-action-verb">— ${actionVerb.toUpperCase()} —</div>`
      : "";

    return `
      <div class="presentation-slide-3d" id="presSlide3D">
        <!-- FACE RECTO 16:9 -->
        <div class="slide-powerpoint-front bg-${catCode}">
          <div class="slide-top">
            <span class="slide-num-badge">${numStr}</span>
            <span class="slide-cat-title">${catCode}</span>
            <span class="slide-cat-icon" aria-hidden="true">${catIcon}</span>
          </div>
          <div class="slide-center">
            <div class="slide-disc-16-9">
              <img src="${imgSrc}" alt="${title}">
            </div>
          </div>
          <div class="slide-bottom">
            ${verbHtml}
            <h2 class="slide-main-title">${title}</h2>
          </div>
        </div>

        <!-- FACE VERSO 16:9 -->
        <div class="slide-powerpoint-back">
          <div class="slide-back-banner bg-${catCode}">
            <span class="slide-num-badge">${numStr}</span>
            <span class="slide-banner-title">${title}</span>
            <span class="slide-banner-icon" aria-hidden="true">${catIcon}</span>
          </div>
          <div class="slide-back-body">
            <div class="slide-mission-block">
              <div class="slide-mission-intro">${missionIntro}</div>
              <p class="slide-mission-text">${missionText}</p>
            </div>
            <div class="slide-challenge-panoramic ${catCode}">
              <div class="slide-challenge-header">
                <span>💡</span>
                <span>${challengeLabel.toUpperCase()} CITOYEN</span>
              </div>
              <p class="slide-challenge-text">${challengeText}</p>
            </div>
            <div class="slide-back-footer">
              <span>${catLabel}</span>
              <span>${card.id}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updatePresentationView(preserveFace = false) {
    if (cardsData.length === 0) return;
    const card = cardsData[currentCardIndex];
    presentationFrame.innerHTML = renderPowerPointCard3D(card);

    const slide3d = document.getElementById("presSlide3D");
    if (currentSlideFace === "verso") {
      slide3d.classList.add("flipped");
    } else {
      slide3d.classList.remove("flipped");
    }

    // Clic direct sur la diapositive pour la retourner avec animation
    slide3d.addEventListener("click", () => {
      toggleFace();
    });

    presInfo.textContent = `Carte ${card.id} (${currentCardIndex + 1}/${cardsData.length}) — ${currentSlideFace.toUpperCase()}`;
    presFlipBtn.textContent = currentSlideFace === "recto" ? "🔄 Voir Verso" : "🔄 Voir Recto";
    presPrevBtn.disabled = currentCardIndex === 0;
    presNextBtn.disabled = currentCardIndex === cardsData.length - 1;
  }

  function openPresentationAt(index, face = "recto") {
    currentCardIndex = Math.max(0, Math.min(index, cardsData.length - 1));
    currentSlideFace = face;
    updatePresentationView();
    presentationOverlay.classList.add("active");
  }

  function closePresentation() {
    presentationOverlay.classList.remove("active");
    presentationFrame.innerHTML = "";
  }

  function toggleFace() {
    currentSlideFace = (currentSlideFace === "recto") ? "verso" : "recto";
    const slide3d = document.getElementById("presSlide3D");
    if (slide3d) {
      slide3d.classList.toggle("flipped");
    }
    const card = cardsData[currentCardIndex];
    presInfo.textContent = `Carte ${card.id} (${currentCardIndex + 1}/${cardsData.length}) — ${currentSlideFace.toUpperCase()}`;
    presFlipBtn.textContent = currentSlideFace === "recto" ? "🔄 Voir Verso" : "🔄 Voir Recto";
  }

  // Passer à la carte suivante (Carte 1 -> Carte 2)
  function nextCard() {
    if (currentCardIndex < cardsData.length - 1) {
      currentCardIndex++;
      currentSlideFace = "recto"; // Nouvelle carte affichée sur son recto
      updatePresentationView();
    }
  }

  // Revenir à la carte précédente (Carte 2 -> Carte 1)
  function prevCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      currentSlideFace = "recto";
      updatePresentationView();
    }
  }

  if (btnPresentationMode) {
    btnPresentationMode.addEventListener("click", () => {
      openPresentationAt(0, "recto");
    });
  }

  if (presNextBtn) presNextBtn.addEventListener("click", nextCard);
  if (presPrevBtn) presPrevBtn.addEventListener("click", prevCard);
  if (presFlipBtn) presFlipBtn.addEventListener("click", toggleFace);
  if (presCloseBtn) presCloseBtn.addEventListener("click", closePresentation);

  // Écoute clavier générale
  document.addEventListener("keydown", (e) => {
    if (presentationOverlay.classList.contains("active")) {
      if (e.key === "Escape") {
        closePresentation();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        nextCard();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevCard();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFace();
      }
    } else if (modalOverlay.classList.contains("active")) {
      if (e.key === "Escape") closeModal();
    }
  });

  // 6. Bascule Mode Dyslexie / Haute Lisibilité
  if (btnDyslexic) {
    btnDyslexic.addEventListener("click", () => {
      document.body.classList.toggle("dyslexic-mode");
      const isDys = document.body.classList.contains("dyslexic-mode");
      btnDyslexic.classList.toggle("btn-active", isDys);
    });
  }
});
