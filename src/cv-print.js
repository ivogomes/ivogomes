// Shrinks each A4 sheet's type scale (--fit) until its content fits, and reports the result.
const MIN_FIT = 0.78;
const STEP = 0.01;

const bodies = () => Array.from(document.querySelectorAll(".cv-page-body"));
const overflows = (el) => el.scrollHeight > el.clientHeight + 1;

function fitPages() {
  const results = bodies().map((body, i) => {
    let fit = 1;
    body.style.setProperty("--fit", fit);
    while (overflows(body) && fit > MIN_FIT) {
      fit = Math.round((fit - STEP) * 100) / 100;
      body.style.setProperty("--fit", fit);
    }
    return { page: i + 1, fit, ok: !overflows(body) };
  });
  report(results);
}

function report(results) {
  const status = document.querySelector("[data-fit-status]");
  if (!status) return;
  const bad = results.filter((r) => !r.ok);
  if (bad.length) {
    status.dataset.state = "overflow";
    status.textContent = `Page ${bad.map((r) => r.page).join(", ")} still overflows. Shorten its content.`;
  } else {
    status.dataset.state = "ok";
    const scaled = results.filter((r) => r.fit < 1).map((r) => `p${r.page} at ${Math.round(r.fit * 100)}%`);
    status.textContent = scaled.length
      ? `All ${results.length} pages fit (scaled: ${scaled.join(", ")}).`
      : `All ${results.length} pages fit.`;
  }
}

document.querySelectorAll("[data-print]").forEach((btn) => {
  btn.addEventListener("click", () => window.print());
});

window.addEventListener("beforeprint", fitPages);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fitPages);
