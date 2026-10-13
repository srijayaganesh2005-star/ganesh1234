const state = { gems: 12450, ves: 1280, history: [] };
const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("en-US");
let pending = null;
let toastTimer;

function updateBalances() {
  $("gemsBalance").textContent = fmt(state.gems);
  $("vesBalance").textContent = fmt(state.ves);
  $("navGems").textContent = fmt(state.gems);
  $("menuGems").textContent = fmt(state.gems);
  $("menuVes").textContent = fmt(state.ves);
  document.querySelectorAll(".convert-button").forEach(button => {
    const required = Number(button.dataset.gems);
    button.disabled = state.gems < required;
    button.textContent = `Convert ${fmt(required)} Gems → ${fmt(Number(button.dataset.ves))} VEs`;
  });
}

function openModal(conversion) {
  pending = conversion;
  $("modalTitle").textContent = conversion.name;
  $("modalGems").textContent = `${fmt(conversion.gems)} Gems`;
  $("modalVes").textContent = `${fmt(conversion.ves)} VEs`;
  $("modalRemaining").textContent = `${fmt(state.gems - conversion.gems)} Gems`;
  $("modalError").textContent = "";
  $("confirmModal").classList.add("open");
  $("confirmModal").setAttribute("aria-hidden", "false");
  $("confirmConversion").focus();
}
function closeModal() {
  $("confirmModal").classList.remove("open");
  $("confirmModal").setAttribute("aria-hidden", "true");
  pending = null;
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function renderHistory() {
  const holder = $("historyContent");
  if (!state.history.length) {
    holder.className = "empty-history";
    holder.innerHTML = '<div class="history-empty-icon">◴</div><h3>No conversions yet</h3><p>Your completed reward conversions will appear<br class="desktop-break"> here.</p>';
    return;
  }
  holder.className = "history-list";
  holder.innerHTML = state.history.map(item => `
    <article class="history-row">
      <div><strong>${item.name}</strong><small>${item.date}</small></div>
      <div><span class="spent">−${fmt(item.gems)} Gems</span><small>Gems exchanged</small></div>
      <div><span class="positive">+${fmt(item.ves)} VEs</span><small>Reward received</small></div>
      <div><span class="status">Completed</span></div>
    </article>`).join("");
}
document.querySelectorAll(".convert-button").forEach(button => {
  button.addEventListener("click", () => {
    const conversion = {
      gems: Number(button.dataset.gems),
      ves: Number(button.dataset.ves),
      name: button.dataset.name
    };
    if (state.gems < conversion.gems) {
      showToast("You don't have enough Gems for this conversion.");
      return;
    }
    openModal(conversion);
  });
});
$("confirmConversion").addEventListener("click", () => {
  if (!pending) return;
  if (state.gems < pending.gems) {
    $("modalError").textContent = "Your Gem balance is no longer sufficient.";
    return;
  }
  state.gems -= pending.gems;
  state.ves += pending.ves;
  state.history.unshift({
    ...pending,
    date: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
  });
  const name = pending.name;
  updateBalances();
  renderHistory();
  closeModal();
  showToast(`${name} completed successfully!`);
});
$("modalClose").addEventListener("click", closeModal);
$("cancelConversion").addEventListener("click", closeModal);
$("confirmModal").addEventListener("click", (event) => {
  if (event.target === $("confirmModal")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});
$("profileToggle").addEventListener("click", () => $("profileMenu").classList.toggle("open"));
document.addEventListener("click", event => {
  if (!$("profileToggle").contains(event.target) && !$("profileMenu").contains(event.target)) {
    $("profileMenu").classList.remove("open");
  }
});
updateBalances();
