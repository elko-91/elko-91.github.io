document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const card = toggle.closest(".card");
      card.classList.toggle("active");
    });
  });
});