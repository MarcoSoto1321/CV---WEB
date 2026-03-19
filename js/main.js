/**
 * Marco Soto Portfolio - Main JavaScript
 * Handles tab navigation, animations, and interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCopyButtons();
  initAnimations();
});

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
    ".service-card, .security-item, .timeline-item, .cert-card",
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
        ".service-card, .security-item, .timeline-item, .cert-card",
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
 * Handle keyboard navigation for tabs
 */
document.addEventListener("keydown", (e) => {
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
