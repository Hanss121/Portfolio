document.addEventListener("DOMContentLoaded", () => {
  // === Scroll Spy Nav Highlight ===
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("text-blue-400", "border-b-2", "border-blue-400");
          });
          if (navLink) {
            navLink.classList.add("text-blue-400", "border-b-2", "border-blue-400");
          }
        }
      });
    },
    { threshold: 0.6 }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });

  // === Modal Image Preview ===
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");

  document.querySelectorAll("#projects img").forEach((img) => {
    img.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modalImg.src = img.src;
      modalImg.alt = img.alt;
    });
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});
