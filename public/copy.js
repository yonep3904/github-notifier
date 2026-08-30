document.addEventListener("click", async (event) => {
  const button =
    event.target instanceof Element ? event.target.closest("[data-copy-target]") : null;
  if (!(button instanceof HTMLButtonElement)) return;

  const targetId = button.getAttribute("data-copy-target");
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  const text = target.textContent;
  if (!text) return;

  const label = button.querySelector("[data-copy-label]");
  if (!(label instanceof HTMLElement)) return;

  const original = label.textContent;

  try {
    await navigator.clipboard.writeText(text);
    label.textContent = "Copied";
  } catch {
    label.textContent = "Failed";
  }

  setTimeout(() => {
    label.textContent = original;
  }, 1600);
});
