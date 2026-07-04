/**
 * Marco Soto Portfolio - Main JavaScript
 * Handles tab navigation, animations, and interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initStatLinks();
  initCopyButtons();
  initAnimations();
  initProjectModal();
});

/**
 * Make hero stats navigate to their related tab/section
 */
function initStatLinks() {
  const stats = document.querySelectorAll(".stat[data-goto]");

  function goTo(stat) {
    const targetTab = document.querySelector(
      `.tab[data-section="${stat.dataset.goto}"]`,
    );
    if (!targetTab) return;
    targetTab.click();
    document
      .querySelector(".tabs")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }

  stats.forEach((stat) => {
    stat.addEventListener("click", () => goTo(stat));
    stat.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goTo(stat);
      }
    });
  });
}

/**
 * Initialize tab navigation
 */
function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const sections = document.querySelectorAll(".section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetSection = tab.dataset.section;

      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Hide all sections
      sections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show target section
      const target = document.getElementById(targetSection);
      if (target) {
        target.classList.add("active");
      }
    });
  });
}

/**
 * Initialize copy buttons for code blocks
 */
function initCopyButtons() {
  // Copy functionality is handled by inline onclick
}

/**
 * Copy code content to clipboard
 * @param {HTMLElement} button - The copy button element
 */
function copyToClipboard(button) {
  const codeBlock = button.parentElement.querySelector("code");
  if (!codeBlock) return;

  // Get text content, preserving newlines but removing HTML
  const text = codeBlock.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Visual feedback
      const originalText = button.textContent;
      button.textContent = "Copied!";
      button.style.color = "var(--green)";
      button.style.borderColor = "var(--green)";

      setTimeout(() => {
        button.textContent = originalText;
        button.style.color = "";
        button.style.borderColor = "";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      button.textContent = "Error";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    });
}

/**
 * Initialize scroll and hover animations
 */
function initAnimations() {
  // Add intersection observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements with animation
  const animatedElements = document.querySelectorAll(
    ".skill-group, .stat, .project-featured, .security-item, .timeline-item, .cert-card, .education-box",
  );
  animatedElements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(el);
  });

  // Trigger initial animations for active section
  setTimeout(() => {
    const activeSection = document.querySelector(".section.active");
    if (activeSection) {
      const elements = activeSection.querySelectorAll(
        ".skill-group, .stat, .project-featured, .security-item, .timeline-item, .cert-card, .education-box",
      );
      elements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }
  }, 100);
}

/**
 * Smooth scroll to section (utility function)
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Initialize project cards → modal popup
 */
function initProjectModal() {
  const overlay = document.getElementById("projectModal");
  if (!overlay) return;

  const body = document.getElementById("modalBody");
  const closeBtn = overlay.querySelector(".modal-close");
  const cards = document.querySelectorAll(".project-card");
  let lastFocused = null;

  function openModal(card) {
    const detail = card.querySelector("template.project-detail");
    if (!detail) return;

    lastFocused = card;
    body.innerHTML = "";
    body.appendChild(detail.content.cloneNode(true));

    overlay.classList.add("open");
    overlay.removeAttribute("hidden");
    document.body.classList.add("modal-open");

    // Re-render Lucide icons injected into the modal
    if (window.lucide) lucide.createIcons();

    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
    body.innerHTML = "";
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);

  // Click on the backdrop (not the modal panel) closes it
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape closes it
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) {
      closeModal();
    }
  });

  // Expose for potential external use
  window.closeProjectModal = closeModal;
}

/**
 * Handle keyboard navigation for tabs
 */
document.addEventListener("keydown", (e) => {
  // Don't hijack arrow keys while the modal is open
  const modal = document.getElementById("projectModal");
  if (modal && modal.classList.contains("open")) return;

  const tabs = document.querySelectorAll(".tab");
  const activeTab = document.querySelector(".tab.active");
  const activeIndex = Array.from(tabs).indexOf(activeTab);

  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    let newIndex;
    if (e.key === "ArrowRight") {
      newIndex = (activeIndex + 1) % tabs.length;
    } else {
      newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    }
    tabs[newIndex].click();
    tabs[newIndex].focus();
  }
});

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;

//Render Icons
lucide.createIcons();
