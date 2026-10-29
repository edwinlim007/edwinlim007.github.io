const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
const directionImg = document.querySelector(".direction-media img");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle("solid", y > window.innerHeight * 0.85 || navLinks.classList.contains("open"));

  if (directionImg && !reduceMotion) {
    const rect = directionImg.parentElement.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const shift = (rect.top / window.innerHeight) * 60;
      directionImg.style.transform = `translateY(${shift - 60}px)`;
    }
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navLinks.classList.toggle("open", open);
  onScroll();
});
navLinks.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuButton.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }
});

// Each scrolly section swaps its sticky image when a step crosses the middle of the screen.
document.querySelectorAll("[data-scrolly]").forEach((section) => {
  const steps = [...section.querySelectorAll("[data-step]")];
  const images = [...section.querySelectorAll(".stage-img")];
  const dots = [...section.querySelectorAll(".stage-dots span")];
  const year = section.querySelector(".stage-year");
  const caption = section.querySelector(".stage-caption");

  function activate(index) {
    const step = steps[index];
    steps.forEach((s, i) => s.classList.toggle("active", i === index));
    images.forEach((img, i) => img.classList.toggle("active", i === Number(step.dataset.img ?? index)));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    if (year && step.dataset.year && year.textContent !== step.dataset.year) {
      year.style.opacity = 0;
      setTimeout(() => { year.textContent = step.dataset.year; year.style.opacity = 1; }, 200);
    }
    if (caption && step.dataset.caption) {
      caption.innerHTML = step.dataset.caption;
    }
  }

  const stacked = window.matchMedia("(max-width: 900px)").matches;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activate(steps.indexOf(entry.target));
    });
  }, { rootMargin: stacked ? "-62% 0px -30% 0px" : "-45% 0px -45% 0px" });

  steps.forEach((step) => observer.observe(step));
  activate(0);
});

function countUp(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";
  const decimals = Number(el.dataset.decimals ?? 0);
  const format = (v) => ("group" in el.dataset ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals));
  if (reduceMotion) { el.textContent = prefix + format(target) + suffix; return; }
  const start = performance.now();
  const duration = 1400;
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + format(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll(".reveal, .project, .metrics, .route-map").forEach((el) => revealObserver.observe(el));

// Shipments start travelling along each route once its line has been drawn.
const routeMap = document.querySelector(".route-map");
if (routeMap) {
  const mapObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    routeMap.querySelectorAll("animateMotion").forEach((m, i) => {
      setTimeout(() => m.beginElement?.(), reduceMotion ? 0 : 1200 + i * 600);
    });
    mapObserver.disconnect();
  }, { threshold: 0.35 });
  mapObserver.observe(routeMap);
}

const navTargets = [...navLinks.querySelectorAll("a")]
  .map((a) => [a, document.querySelector(a.getAttribute("href"))])
  .filter(([, section]) => section);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navTargets.forEach(([a, section]) => a.classList.toggle("current", section === entry.target));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navTargets.forEach(([, section]) => navObserver.observe(section));
