// ============================================================
// Método MAR — Landing Page
// ============================================================

// ---- CONFIGURAÇÃO: troque pelo link real do time comercial ----
// Ex.: WhatsApp -> "https://wa.me/5583XXXXXXXXX?text=Quero%20falar%20sobre%20a%20Imers%C3%A3o%20M%C3%A9todo%20MAR"
// Ex.: formulário de qualificação -> "https://forms.gle/xxxxxxxx"
const CTA_URL = "#"; // TODO: substituir pelo canal real de contato do time de vendas

const ctaFinal = document.getElementById("cta-final");
if (ctaFinal) {
  ctaFinal.setAttribute("href", CTA_URL);
  if (CTA_URL !== "#") ctaFinal.setAttribute("target", "_blank");
}

// ---- Contador regressivo até o início da imersão ----
// 17 de setembro de 2026, 09h00, horário de Brasília (UTC-03:00)
const EVENT_DATE = new Date("2026-09-17T09:00:00-03:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = EVENT_DATE - now;

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    min: document.getElementById("cd-min"),
    sec: document.getElementById("cd-sec"),
  };
  if (!els.days) return;

  if (diff <= 0) {
    els.days.textContent = "00";
    els.hours.textContent = "00";
    els.min.textContent = "00";
    els.sec.textContent = "00";
    return;
  }

  const pad = (n) => String(n).padStart(2, "0");
  const totalSeconds = Math.floor(diff / 1000);

  els.days.textContent = pad(Math.floor(totalSeconds / 86400));
  els.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  els.min.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  els.sec.textContent = pad(totalSeconds % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---- FAQ: mantém apenas um item aberto por vez ----
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});

// ---- Revelação ao rolar ----
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll("[data-reveal]");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}
