/**
 * Marco Soto Portfolio - Main JavaScript
 * Handles tab navigation, animations, and interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initStatLinks();
  initCvDropdown();
  initAnimations();
  initDetailModal();

  // Render icons once, after the DOM is ready.
  if (window.lucide) lucide.createIcons();
});

/**
 * CV download dropdown (English / Spanish)
 */
function initCvDropdown() {
  const wrapper = document.querySelector(".cta-dropdown");
  if (!wrapper) return;

  const toggle = wrapper.querySelector("#cvToggle");
  const menu = wrapper.querySelector("#cvMenu");

  function openMenu() {
    wrapper.classList.add("open");
    menu.removeAttribute("hidden");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    wrapper.classList.remove("open");
    menu.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.contains("open") ? closeMenu() : openMenu();
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wrapper.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
}

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

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      sections.forEach((section) => section.classList.remove("active"));

      const target = document.getElementById(targetSection);
      if (target) target.classList.add("active");
    });
  });
}

/**
 * Copy code content to clipboard
 * @param {HTMLElement} button - The copy button element
 */
function copyToClipboard(button) {
  const codeBlock = button.parentElement.querySelector("code");
  if (!codeBlock) return;

  const text = codeBlock.innerText;

  navigator.clipboard
    .writeText(text)
    .then(() => {
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
  const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Stagger is computed PER SECTION (and capped) so switching tabs feels
  // instant — a global index made later sections wait 1.5s+ before appearing.
  const ANIM_SELECTOR =
    ".skill-group, .stat, .project-card, .security-item, .timeline-item, .cert-card, .education-box";

  document.querySelectorAll("header, section.section").forEach((container) => {
    container.querySelectorAll(ANIM_SELECTOR).forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      const delay = Math.min(index * 0.06, 0.36);
      el.style.transition = `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`;
      observer.observe(el);
    });
  });

  setTimeout(() => {
    const activeSection = document.querySelector(".section.active");
    if (!activeSection) return;
    activeSection.querySelectorAll(ANIM_SELECTOR).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, 100);
}

/* ============================================================
   GENERIC DETAIL MODAL
   ------------------------------------------------------------
   Any element can open the modal. The declaration is the
   presence of a <template class="detail-content"> inside it:

     <article class="project-card">
       ...card face...
       <template class="detail-content">...full detail...</template>
     </article>

   The trigger is the template's closest [data-detail] ancestor,
   or its direct parent if there isn't one. Use [data-detail]
   when the clickable area should be larger than the template's
   immediate parent (e.g. a whole .timeline-item).

   Optional attributes on the trigger:
     data-detail-title  — text shown in the modal title bar
                          (default: "details")

   role/tabindex/aria-haspopup are applied automatically, so new
   triggers only need the template.
   ============================================================ */
function initDetailModal() {
  const overlay = document.getElementById("projectModal");
  if (!overlay) return;

  const panel = overlay.querySelector(".modal");
  const body = document.getElementById("modalBody");
  const titleEl = document.getElementById("modalTitle");
  const redDot = overlay.querySelector(".dot-close");

  let lastFocused = null;

  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  /* ---- wire up every trigger ---- */
  const templates = document.querySelectorAll(
    "template.detail-content, template.project-detail",
  );

  templates.forEach((tpl) => {
    const trigger = tpl.closest("[data-detail]") || tpl.parentElement;
    if (!trigger) return;

    trigger.classList.add("has-detail");
    if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "button");
    if (!trigger.hasAttribute("tabindex"))
      trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-haspopup", "dialog");

    trigger.addEventListener("click", (e) => {
      // Let real links inside the card behave like links.
      if (e.target.closest("a")) return;
      openModal(trigger, tpl);
    });

    trigger.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("a")) return;
      e.preventDefault();
      openModal(trigger, tpl);
    });
  });

  /* ---- open / close ---- */
  function openModal(trigger, tpl) {
    lastFocused = trigger;

    body.innerHTML = "";
    body.appendChild(tpl.content.cloneNode(true));

    if (titleEl) {
      titleEl.textContent = trigger.dataset.detailTitle || "details";
    }

    overlay.removeAttribute("hidden");
    overlay.classList.add("open");
    document.body.classList.add("modal-open");

    // Long detail panels: always start at the top.
    body.scrollTop = 0;
    overlay.scrollTop = 0;

    // Re-render Lucide icons injected into the modal.
    if (window.lucide) lucide.createIcons();

    if (redDot) redDot.focus();
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
    body.innerHTML = "";
    if (lastFocused) lastFocused.focus();
    lastFocused = null;
  }

  /* ---- close controls ---- */
  if (redDot) {
    redDot.addEventListener("click", closeModal);
    redDot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closeModal();
      }
    });
  }

  // Backdrop click (not the panel) closes.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  /* ---- keyboard: escape + focus trap ---- */
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;

    if (e.key === "Escape") {
      closeModal();
      return;
    }

    if (e.key !== "Tab") return;

    // Keep focus inside the dialog while it's open.
    const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (!items.length) {
      e.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (!panel.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  });

  window.closeProjectModal = closeModal;
}

/**
 * Handle keyboard navigation for tabs.
 * Only active while focus is inside the tab bar, so arrow keys
 * don't hijack the page from anywhere else.
 */
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

  const modal = document.getElementById("projectModal");
  if (modal && modal.classList.contains("open")) return;

  const tabBar = document.querySelector(".tabs");
  if (!tabBar || !tabBar.contains(document.activeElement)) return;

  const tabs = document.querySelectorAll(".tab");
  const activeIndex = Array.from(tabs).indexOf(
    document.querySelector(".tab.active"),
  );

  const newIndex =
    e.key === "ArrowRight"
      ? (activeIndex + 1) % tabs.length
      : (activeIndex - 1 + tabs.length) % tabs.length;

  tabs[newIndex].click();
  tabs[newIndex].focus();
});

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;
