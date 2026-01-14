// ======================
// HELPER
// ======================
const qs = (id) => document.getElementById(id);

// ======================
// THEME SWITCHING
// ======================
const themeButtons = document.querySelectorAll(".theme-switcher button");
const body = document.body;

const savedTheme = localStorage.getItem("theme");
if (savedTheme) body.className = savedTheme;

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const theme = `theme-${btn.dataset.theme}`;
    body.className = theme;
    localStorage.setItem("theme", theme);
  });
});

// ======================
// CUSTOM ACCOMMODATION
// ======================
const accommodationSelect = qs("accommodation");
const customAccommodationGroup = qs("customAccommodationGroup");

if (accommodationSelect && customAccommodationGroup) {
  accommodationSelect.addEventListener("change", () => {
    customAccommodationGroup.hidden = accommodationSelect.value !== "other";
    saveState();
  });
}

// ======================
// FOOTER YEAR
// ======================
qs("year").textContent = new Date().getFullYear();

// ======================
// FORM + RESULTS
// ======================
const form = qs("rentForm");
const warning = qs("warning");
const results = qs("results");
const resetBtn = qs("resetBtn");

// ======================
// SAVE / RESTORE
// ======================
function saveState() {
  const state = {
    city: qs("city")?.value || "",
    accommodation: qs("accommodation").value,
    customAccommodation: qs("customAccommodation")?.value || "",
    currentRent: qs("currentRent").value,
    newRent: qs("newRent").value,
    frequency: qs("frequency").value,
    duration: qs("duration").value,
    leaseStart: qs("leaseStart").value,
    leaseEnd: qs("leaseEnd").value,
    negotiate: qs("negotiate").checked,
    results: results.hidden ? null : {
      percent: qs("percentIncrease").textContent,
      monthly: qs("monthlyDiff").textContent,
      yearly: qs("yearlyDiff").textContent,
      fairness: qs("fairness").textContent
    }
  };
  localStorage.setItem("rentCheckState", JSON.stringify(state));
}

function restoreState() {
  const raw = localStorage.getItem("rentCheckState");
  if (!raw) return;

  const state = JSON.parse(raw);

  if (qs("city")) qs("city").value = state.city;
  qs("accommodation").value = state.accommodation;
  if (qs("customAccommodation")) qs("customAccommodation").value = state.customAccommodation;
  qs("currentRent").value = state.currentRent;
  qs("newRent").value = state.newRent;
  qs("frequency").value = state.frequency;
  qs("duration").value = state.duration;
  qs("leaseStart").value = state.leaseStart;
  qs("leaseEnd").value = state.leaseEnd;
  qs("negotiate").checked = state.negotiate;

  if (state.accommodation === "other") {
    customAccommodationGroup.hidden = false;
  }

  if (state.results) {
    qs("percentIncrease").textContent = state.results.percent;
    qs("monthlyDiff").textContent = state.results.monthly;
    qs("yearlyDiff").textContent = state.results.yearly;
    qs("fairness").textContent = state.results.fairness;
    results.hidden = false;
  }
}

// ======================
// CALCULATION
// ======================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  warning.textContent = "";
  results.hidden = true;

  const currentRent = Number(qs("currentRent").value);
  const newRent = Number(qs("newRent").value);
  const duration = Number(qs("duration").value);
  const frequency = qs("frequency").value;
  const wantsNegotiation = qs("negotiate").checked;

  if (!currentRent || !newRent || !duration) {
    warning.textContent = "Please fill in all required fields correctly.";
    return;
  }

  if (newRent <= currentRent) {
    warning.textContent = "Proposed new rent must be higher than current rent.";
    return;
  }

  const increase = newRent - currentRent;
  const percentIncrease = (increase / currentRent) * 100;

  let yearlyDiff = increase;
  let monthlyDiff = yearlyDiff / 12;

  if (frequency === "monthly") {
    yearlyDiff = increase * 12;
    monthlyDiff = increase;
  }

  if (frequency === "quarterly") {
    yearlyDiff = increase * 4;
    monthlyDiff = yearlyDiff / 12;
  }

  qs("percentIncrease").textContent = percentIncrease.toFixed(1) + "%";
  qs("monthlyDiff").textContent = Math.round(monthlyDiff).toLocaleString();
  qs("yearlyDiff").textContent = yearlyDiff.toLocaleString();

  let fairnessText = "";

  if (percentIncrease <= 10) {
    fairnessText = "This rent increase is generally considered low.";
  } else if (percentIncrease <= 25) {
    fairnessText = "This rent increase is moderate and may be reasonable.";
  } else if (percentIncrease <= 50) {
    fairnessText = "This rent increase is high and should be carefully reviewed.";
  } else {
    fairnessText = "This rent increase is very high and may be unfair.";
  }

  if (wantsNegotiation) {
    if (percentIncrease > 25) {
      fairnessText += " Negotiation is strongly recommended.";
    } else if (percentIncrease > 10) {
      fairnessText += " Negotiation may be reasonable.";
    } else {
      fairnessText += " Negotiation is optional but may not be necessary.";
    }
  }

  qs("fairness").textContent = fairnessText;
  results.hidden = false;
  saveState();
});

// ======================
// RESET
// ======================
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("rentCheckState");
  form.reset();
  results.hidden = true;
  customAccommodationGroup.hidden = true;
});

// ======================
// INIT
// ======================
restoreState();
