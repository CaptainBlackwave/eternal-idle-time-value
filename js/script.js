/* =====================================================
   DATA
   ===================================================== */

const tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const refiningTimes = {
  1: 16, 2: 20, 3: 30, 4: 40, 5: 50,
  6: 60, 7: 70, 8: 80, 9: 90, 10: 100
};

const craftingTimes = {
  1: 320, 2: 400, 3: 600, 4: 800, 5: 1000,
  6: 1200, 7: 1400, 8: 1600, 9: 1800, 10: 2000
};

/* Rarity chances per tier (percent) — applies to crafted gear only (not food/potions) */
const rarityChances = {
  1:  { white: 72.2,   green: 15,    blue: 7.2,   purple: 4.9,   orange: 0.7 },
  2:  { white: 73.9,   green: 14.445, blue: 6.65,  purple: 4.38,  orange: 0.625 },
  3:  { white: 75.6,   green: 13.89,  blue: 6.1,   purple: 3.86,  orange: 0.55 },
  4:  { white: 77.3,   green: 13.335, blue: 5.55,  purple: 3.34,  orange: 0.475 },
  5:  { white: 79,     green: 12.78,  blue: 5,     purple: 2.82,  orange: 0.4 },
  6:  { white: 80.7,   green: 12.22,  blue: 4.45,  purple: 2.305, orange: 0.325 },
  7:  { white: 82.4,   green: 11.665, blue: 3.9,   purple: 1.785, orange: 0.25 },
  8:  { white: 84.1,   green: 11.11,  blue: 3.35,  purple: 1.265, orange: 0.175 },
  9:  { white: 85.8,   green: 10.555, blue: 2.8,   purple: 0.745, orange: 0.1 },
  10: { white: 87.5,   green: 10,     blue: 2.25,  purple: 0.225, orange: 0.025 }
};

const rarityNames = ["white", "green", "blue", "purple", "orange"];
const rarityLabels = { white: "Common", green: "Uncommon", blue: "Rare", purple: "Epic", orange: "Legendary" };

/**
 * Returns the multiplier for a given tier and rarity.
 * Multiplier = 100 / chance%
 * White always returns 1 (baseline).
 */
function getRarityMultiplier(tier, rarity) {
  if (rarity === "white") return 1;
  const chances = rarityChances[tier];
  if (!chances || !chances[rarity]) return 1;
  return 100 / chances[rarity];
}

const professions = [
  {
    name: "Toolmaker",
    chain: "Lumberjack → Lumber Mill → Toolmaker",
    base: "Logs",
    refined: "Planks",
    crafted: "Tools",
    amount: 20,
    type: "main",
    tint: "peach"
  },
  {
    name: "Warrior's Forge",
    chain: "Mining → Smelting → Warrior's Forge",
    base: "Ore",
    refined: "Bars",
    crafted: "Warrior Gear",
    amount: 20,
    type: "main",
    tint: "rose"
  },
  {
    name: "Hunter's Lodge",
    chain: "Skinning → Tannery → Hunter's Lodge",
    base: "Hides",
    refined: "Leather",
    crafted: "Hunter Gear",
    amount: 20,
    type: "main",
    tint: "mint"
  },
  {
    name: "Mage's Tower",
    chain: "Harvesting → Loom → Mage's Tower",
    base: "Fiber",
    refined: "Cloth",
    crafted: "Mage Gear",
    amount: 20,
    type: "main",
    tint: "lavender"
  },
  {
    name: "Alchemy Lab",
    chain: "Herbalism → Distillation → Alchemy Lab",
    base: "Herbs",
    refined: "Extract",
    crafted: "Potion",
    amount: 5,
    type: "alchemy",
    tint: "sky"
  },
  {
    name: "Kitchen",
    chain: "Fishing → Kitchen",
    base: "Fish",
    refined: null,
    crafted: "Food",
    amount: 2,
    type: "kitchen",
    tint: "yellow"
  }
];

/* =====================================================
   THEME TOGGLE
   ===================================================== */

function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (stored === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (stored === "dark" || !stored && prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  updateThemeUI();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeUI();
}

function updateThemeUI() {
  const theme = document.documentElement.getAttribute("data-theme");
  const icon = document.querySelector("#themeToggle .icon");
  const label = document.getElementById("themeLabel");

  if (theme === "dark") {
    icon.textContent = "🌙";
    label.textContent = "Dark";
  } else {
    icon.textContent = "☀️";
    label.textContent = "Light";
  }
}

/* =====================================================
   FORMATTING HELPERS
   ===================================================== */

function formatTime(seconds) {
  seconds = Math.round(seconds);

  if (seconds < 60) return seconds + "s";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) return minutes + "m " + remainingSeconds + "s";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours + "h " + remainingMinutes + "m";
}

/**
 * Get an HSL color for a tier badge (T1=green, T10=red)
 */
function getTierColor(tier) {
  const hue = 140 - ((tier - 1) / 9) * 100; // 140° green → 40° red
  return `hsl(${hue}, 70%, 45%)`;
}

/**
 * Compute max crafted time across all professions & tiers (for scaling time bars)
 */
function getGlobalMaxCrafted() {
  let max = 0;
  professions.forEach(p => {
    tiers.forEach(t => {
      const v = calculateValues(t, p);
      if (v.crafted > max) max = v.crafted;
    });
  });
  return max;
}
const GLOBAL_MAX_CRAFTED = getGlobalMaxCrafted();

let currentRarity = "white";

function getCurrentRarity() {
  return currentRarity;
}

/* =====================================================
   CALCULATIONS
   ===================================================== */

function calculateValues(tier, profession) {
  const refineTime = refiningTimes[tier];
  const gatherTime = refineTime / 2;

  // Kitchen
  if (profession.type === "kitchen") {
    const foodValue = (gatherTime * 2) + refineTime;
    return {
      base: gatherTime,
      refined: null,
      crafted: foodValue,
      breakdown: {
        base: null,
        refined: null,
        crafted: `2\u00d7${formatTime(gatherTime)} ${profession.base} + ${formatTime(refineTime)} ${profession.crafted}`
      }
    };
  }

  // Refined
  const refinedValue = (gatherTime * 2) + refineTime;

  let craftAction;

  // Alchemy
  if (profession.type === "alchemy") {
    craftAction = refineTime * 5;
  } else {
    craftAction = craftingTimes[tier];
  }

  const craftedValue = (refinedValue * profession.amount) + craftAction;

  return {
    base: gatherTime,
    refined: refinedValue,
    crafted: craftedValue,
    breakdown: {
      base: null,
      refined: `2\u00d7${formatTime(gatherTime)} ${profession.base} + ${formatTime(refineTime)} ${profession.refined}`,
      crafted: `${profession.amount}\u00d7${formatTime(refinedValue)} ${profession.refined} + ${formatTime(craftAction)} ${profession.crafted}`
    }
  };
}

/* =====================================================
   DROPDOWN POPULATION
   ===================================================== */

function populateTierSelect(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";

  tiers.forEach((tier) => {
    const option = document.createElement("option");
    option.value = tier;
    option.textContent = "T" + tier;
    select.appendChild(option);
  });
}

function populateResourceSelect(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";

  professions.forEach((profession, index) => {
    const group = document.createElement("optgroup");
    group.label = profession.name;

    // Base
    const baseOption = document.createElement("option");
    baseOption.value = JSON.stringify({ profession: index, type: "base" });
    baseOption.textContent = profession.base;
    group.appendChild(baseOption);

    // Refined
    if (profession.refined) {
      const refinedOption = document.createElement("option");
      refinedOption.value = JSON.stringify({ profession: index, type: "refined" });
      refinedOption.textContent = `${profession.refined} (2x ${profession.base})`;
      group.appendChild(refinedOption);
    }

    // Crafted
    const craftedOption = document.createElement("option");
    craftedOption.value = JSON.stringify({ profession: index, type: "crafted" });

    let recipeText = "";
    if (profession.type === "alchemy") {
      recipeText = `(5x ${profession.refined})`;
    } else if (profession.type === "kitchen") {
      recipeText = `(2x ${profession.base})`;
    } else {
      recipeText = `(20x ${profession.refined})`;
    }

    craftedOption.textContent = `${profession.crafted} ${recipeText}`;
    group.appendChild(craftedOption);

    select.appendChild(group);
  });
}

/* =====================================================
   PROFESSION TABLE BUILDER
   ===================================================== */

let professionCards = [];

function buildProfessionTables() {
  const professionGrid = document.getElementById("professionGrid");
  professionGrid.innerHTML = "";
  professionCards = [];

  professions.forEach((profession, profIndex) => {
    const card = document.createElement("div");
    card.className = "card card-feature-" + profession.tint;
    card.dataset.profession = profession.name.toLowerCase();
    card.dataset.resources = [
      profession.base,
      profession.refined,
      profession.crafted,
      profession.name
    ].filter(Boolean).join(" ").toLowerCase();
    card.style.animationDelay = (profIndex * 0.08) + "s";

    let tableHtml = `
      <h2>${profession.name}</h2>
      <div class="chain">${profession.chain}</div>
      <table>
        <thead>
          <tr>
            <th>Tier</th>
            <th>Base</th>
            ${profession.refined ? "<th>Refined</th>" : ""}
            <th>Crafted</th>
          </tr>
        </thead>
        <tbody>
    `;

    tiers.forEach((tier) => {
      const values = calculateValues(tier, profession);
      const tierColor = getTierColor(tier);

      // Compute time bar widths relative to global max crafted
      const baseWidth = (values.base / GLOBAL_MAX_CRAFTED) * 100;
      const refinedWidth = values.refined ? (values.refined / GLOBAL_MAX_CRAFTED) * 100 : 0;
      const craftedWidth = (values.crafted / GLOBAL_MAX_CRAFTED) * 100;

      const baseBreakdown = values.breakdown.base ? `<span class="breakdown">${values.breakdown.base}</span>` : "";
      const refinedBreakdown = values.breakdown.refined ? `<span class="breakdown">${values.breakdown.refined}</span>` : "";
      const craftedBreakdown = values.breakdown.crafted ? `<span class="breakdown">${values.breakdown.crafted}</span>` : "";

      // Rarity-adjusted crafted value (only for main gear professions, not food/potions)
      let rarityHtml = "";
      if (profession.type === "main") {
        const rarityMult = getRarityMultiplier(tier, currentRarity);
        if (rarityMult !== 1) {
          const adjustedTime = values.crafted * rarityMult;
          rarityHtml = `<span class="rarity-value rarity-${currentRarity}">${rarityLabels[currentRarity]}: ${formatTime(adjustedTime)} <span class="rarity-mult">(${rarityMult.toFixed(1)}×)</span></span>`;
        }
      }

      tableHtml += `
        <tr>
          <td>
            <span class="tier-badge" style="background:${tierColor};">T${tier}</span>
          </td>
          <td>
            <span class="resource-name">${profession.base}</span>
            <span class="value-wrap">
              <span class="time-bar" style="width:${baseWidth}%;background:${tierColor};"></span>
              <span class="value">${formatTime(values.base)}</span>
              ${baseBreakdown}
            </span>
          </td>
          ${profession.refined ? `
            <td>
              <span class="resource-name">${profession.refined}</span>
              <span class="value-wrap">
                <span class="time-bar" style="width:${refinedWidth}%;background:${tierColor};"></span>
                <span class="value">${formatTime(values.refined)}</span>
                ${refinedBreakdown}
              </span>
            </td>
          ` : ""}
          <td>
            <span class="resource-name">${profession.crafted}</span>
            <span class="value-wrap">
              <span class="time-bar" style="width:${craftedWidth}%;background:${tierColor};"></span>
              <span class="value">${formatTime(values.crafted)}</span>
              ${craftedBreakdown}
              ${rarityHtml}
            </span>
          </td>
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    card.innerHTML = tableHtml;
    professionGrid.appendChild(card);
    professionCards.push(card);
  });
}

/* =====================================================
   SEARCH / FILTER
   ===================================================== */

function initSearch() {
  const searchInput = document.getElementById("professionSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    professionCards.forEach((card) => {
      const searchData = card.dataset.resources || "";
      if (!query || searchData.includes(query)) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
}

/* =====================================================
   TRADE CALCULATOR
   ===================================================== */

/** Returns true if the profession type is gear-crafting (main) */
function isGearProfession(type) {
  return type === "main";
}

/** Populate the trade calculator's rarity dropdown */
function populateTradeRaritySelect(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";
  rarityNames.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = `${rarityLabels[r]} (${r.charAt(0).toUpperCase() + r.slice(1)})`;
    select.appendChild(opt);
  });
}

/** Show or hide the give rarity dropdown based on whether crafted gear is selected */
function updateGiveRarityVisibility() {
  const container = document.getElementById("giveRarityContainer");
  try {
    const selection = JSON.parse(document.getElementById("giveType").value);
    const profession = professions[selection.profession];
    const isCraftedGear = selection.type === "crafted" && isGearProfession(profession.type);
    container.style.display = isCraftedGear ? "block" : "none";
  } catch {
    container.style.display = "none";
  }
}

function handleSwap() {
  const giveTier = document.getElementById("giveTier").value;
  const wantTier = document.getElementById("wantTier").value;
  const giveType = document.getElementById("giveType").value;
  const wantType = document.getElementById("wantType").value;
  const giveRarity = document.getElementById("giveRarity").value;

  document.getElementById("giveTier").value = wantTier;
  document.getElementById("wantTier").value = giveTier;
  document.getElementById("giveType").value = wantType;
  document.getElementById("wantType").value = giveType;

  // Swap rarity: keep it as is on the give side (resets to white)
  document.getElementById("giveRarity").value = "white";

  // Update rarity visibility after swap
  updateGiveRarityVisibility();

  // Swap animation
  const btn = document.getElementById("swapSides");
  btn.classList.remove("swapping");
  // Force reflow
  void btn.offsetWidth;
  btn.classList.add("swapping");
}

function handleCalculate() {
  const giveSelection = JSON.parse(document.getElementById("giveType").value);
  const wantSelection = JSON.parse(document.getElementById("wantType").value);

  const giveProfession = professions[giveSelection.profession];
  const wantProfession = professions[wantSelection.profession];

  const giveTier = parseInt(document.getElementById("giveTier").value);
  const wantTier = parseInt(document.getElementById("wantTier").value);

  const giveType = giveSelection.type;
  const wantType = wantSelection.type;

  const giveAmount = parseFloat(document.getElementById("giveAmount").value) || 1;

  const giveValues = calculateValues(giveTier, giveProfession);
  const wantValues = calculateValues(wantTier, wantProfession);

  // Apply give-side rarity multiplier if crafted gear
  const giveIsGear = giveType === "crafted" && isGearProfession(giveProfession.type);
  const giveRarity = giveIsGear ? document.getElementById("giveRarity").value : "white";
  const giveRarityMult = getRarityMultiplier(giveTier, giveRarity);
  const giveTimeValue = giveValues[giveType] * giveRarityMult;

  const wantTimeValue = wantValues[wantType];

  const totalTime = giveTimeValue * giveAmount;
  const equivalentAmount = totalTime / wantTimeValue;

  const result = document.getElementById("tradeResult");

  const giveName = giveType === "base"
    ? giveProfession.base
    : giveType === "refined"
      ? giveProfession.refined
      : giveProfession.crafted;

  const wantName = wantType === "base"
    ? wantProfession.base
    : wantType === "refined"
      ? wantProfession.refined
      : wantProfession.crafted;

  // Build give-side rarity label
  const giveRarityLabel = giveIsGear && giveRarity !== "white"
    ? ` ${rarityLabels[giveRarity]}`
    : "";

  // Build description
  document.getElementById("resultDescription").innerHTML = `
    <strong>${giveAmount.toLocaleString()}</strong>
    T${giveTier} ${giveName}${giveRarityLabel}
    contains approximately
    <strong>${formatTime(totalTime)}</strong>
    of total production time.
  `;

  document.getElementById("resultValue").textContent =
    `≈ ${equivalentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} T${wantTier} ${wantName}`;

  // Build breakdown bars
  const breakdownDiv = document.getElementById("resultBreakdown");
  const bar = document.getElementById("breakdownBar");
  const labels = document.getElementById("breakdownLabels");

  // Compute proportional breakdown of the GIVE item's time components
  let segments = [];
  if (giveType === "base") {
    segments = [{ label: "Gathering", pct: 100, cls: "bar-gather" }];
} else if (giveType === "refined") {
     const gatherPct = (giveValues.base * 2 / giveValues.refined) * 100;
     const refinePct = refiningTimes[giveTier] / giveValues.refined * 100;
     segments = [
       { label: "Gathering", pct: gatherPct, cls: "bar-gather" },
       { label: "Refining", pct: refinePct, cls: "bar-refine" }
     ];
} else if (giveProfession.type === "kitchen") {
      // Kitchen (Food) - has no refining step, only gathering + crafting
      const gatherPerFood = giveValues.base * 2;
      const craftTime = refiningTimes[giveTier];
      const totalAll = gatherPerFood + craftTime;
      segments = [
        { label: "Gathering", pct: (gatherPerFood / totalAll) * 100, cls: "bar-gather" },
        { label: "Crafting", pct: (craftTime / totalAll) * 100, cls: "bar-craft" }
      ];
    } else {
     // crafted (gear professions)
     const refinedTotal = giveValues.refined * giveProfession.amount;
     const gatherPerRefined = giveValues.base * 2;
     const totalGather = gatherPerRefined * giveProfession.amount;
     const totalRefine = refiningTimes[giveTier] * giveProfession.amount;

     let craftTime;
     if (giveProfession.type === "alchemy") {
       craftTime = refiningTimes[giveTier] * 5;
     } else {
       craftTime = craftingTimes[giveTier];
     }

     const totalCraftTime = craftTime;
     const totalAll = totalGather + totalRefine + totalCraftTime;

     segments = [
       { label: "Gathering", pct: (totalGather / totalAll) * 100, cls: "bar-gather" },
       { label: "Refining", pct: (totalRefine / totalAll) * 100, cls: "bar-refine" },
       { label: "Crafting", pct: (totalCraftTime / totalAll) * 100, cls: "bar-craft" }
     ];
   }

  bar.innerHTML = segments.map(s =>
    `<span class="bar-segment ${s.cls}" style="width:${s.pct}%;"></span>`
  ).join("");

  labels.innerHTML = segments.map(s =>
    `<span><span class="dot" style="background:var(--${s.cls === 'bar-gather' ? 'brand-teal' : s.cls === 'bar-refine' ? 'semantic-warning' : 'semantic-error'});"></span> ${s.label} ${s.pct.toFixed(0)}%</span>`
  ).join("");

  breakdownDiv.style.display = "block";

  // --- Rarity Equivalents (for the "You Get" side) ---
  const wantIsGear = wantType === "crafted" && isGearProfession(wantProfession.type);
  const eqContainer = document.getElementById("rarityEquivalents");
  const eqList = document.getElementById("rarityEquivalentsList");

  if (wantIsGear) {
    const wantNamesToShow = rarityNames.filter(r => r !== "white"); // skip white (it's the main result)
    let eqHtml = '<div class="eq-list">';
    wantNamesToShow.forEach((rarity) => {
      const mult = getRarityMultiplier(wantTier, rarity);
      const eqAmount = equivalentAmount / mult;
      const label = `${rarityLabels[rarity]}`;
      eqHtml += `
        <div class="eq-row eq-${rarity}">
          <span class="eq-label">${label}</span>
          <span class="eq-value">≈ ${eqAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} T${wantTier} ${wantName} <span class="eq-mult">(${mult.toFixed(1)}×)</span></span>
        </div>
      `;
    });
    eqHtml += '</div>';
    eqList.innerHTML = eqHtml;
    eqContainer.style.display = "block";
  } else {
    eqContainer.style.display = "none";
  }

  // Show result with animation
  result.classList.remove("visible");
  // Force reflow
  void result.offsetWidth;
  result.classList.add("visible");

  // Scroll result into view
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleCopyResult() {
  const description = document.getElementById("resultDescription").textContent || "";
  const value = document.getElementById("resultValue").textContent || "";
  let text = `${description}\n${value}`.trim();

  // Append rarity equivalents if visible
  const eqContainer = document.getElementById("rarityEquivalents");
  if (eqContainer.style.display !== "none") {
    const rows = eqContainer.querySelectorAll(".eq-row");
    if (rows.length) {
      text += "\n--- Rarity Equivalents ---";
      rows.forEach(row => {
        const label = row.querySelector(".eq-label")?.textContent || "";
        const val = row.querySelector(".eq-value")?.textContent || "";
        text += `\n${label}: ${val}`;
      });
    }
  }

  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyResult");
    btn.classList.add("copied");
    btn.textContent = "✅ Copied!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.textContent = "📋 Copy Result";
    }, 2000);
  }).catch(() => {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    const btn = document.getElementById("copyResult");
    btn.classList.add("copied");
    btn.textContent = "✅ Copied!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.textContent = "📋 Copy Result";
    }, 2000);
  });
}

/* =====================================================
   RARITY FILTER
   ===================================================== */

function initRarityFilter() {
  const raritySelect = document.getElementById("rarityFilter");
  if (!raritySelect) return;

  raritySelect.addEventListener("change", () => {
    currentRarity = raritySelect.value;
    buildProfessionTables();
  });
}

/* =====================================================
   INITIALIZATION
   ===================================================== */

function init() {
  // Theme
  initTheme();
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // Populate dropdowns
  populateTierSelect("giveTier");
  populateTierSelect("wantTier");
  populateResourceSelect("giveType");
  populateResourceSelect("wantType");

  // Populate trade calculator rarity dropdown
  populateTradeRaritySelect("giveRarity");

  // Build profession tables
  buildProfessionTables();

  // Search
  initSearch();

  // Rarity filter
  initRarityFilter();

  // Event listeners
  document.getElementById("swapSides").addEventListener("click", handleSwap);
  document.getElementById("calculateTrade").addEventListener("click", handleCalculate);
  document.getElementById("copyResult").addEventListener("click", handleCopyResult);

  // Show/hide rarity dropdown when resource type changes
  document.getElementById("giveType").addEventListener("change", updateGiveRarityVisibility);

  // Handle Enter key on amount input
  document.getElementById("giveAmount").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCalculate();
  });
}

// Kick off
document.addEventListener("DOMContentLoaded", init);