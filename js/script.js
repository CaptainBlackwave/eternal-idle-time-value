const tiers = [1,2,3,4,5,6,7,8,9,10];

const refiningTimes = {
  1: 16,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  7: 70,
  8: 80,
  9: 90,
  10: 100
};

const craftingTimes = {
  1: 320,
  2: 400,
  3: 600,
  4: 800,
  5: 1000,
  6: 1200,
  7: 1400,
  8: 1600,
  9: 1800,
  10: 2000
};

const professions = [
  {
    name: "Toolmaker",
    chain: "Lumberjack → Lumber Mill → Toolmaker",
    base: "Logs",
    refined: "Planks",
    crafted: "Tools",
    amount: 20,
    type: "main"
  },
  {
    name: "Warrior's Forge",
    chain: "Mining → Smelting → Warrior's Forge",
    base: "Ore",
    refined: "Bars",
    crafted: "Warrior Gear",
    amount: 20,
    type: "main"
  },
  {
    name: "Hunter's Lodge",
    chain: "Skinning → Tannery → Hunter's Lodge",
    base: "Hides",
    refined: "Leather",
    crafted: "Hunter Gear",
    amount: 20,
    type: "main"
  },
  {
    name: "Mage's Tower",
    chain: "Harvesting → Loom → Mage's Tower",
    base: "Fiber",
    refined: "Cloth",
    crafted: "Mage Gear",
    amount: 20,
    type: "main"
  },
  {
    name: "Alchemy Lab",
    chain: "Herbalism → Distillation → Alchemy Lab",
    base: "Herbs",
    refined: "Extract",
    crafted: "Potion",
    amount: 5,
    type: "alchemy"
  },
  {
    name: "Kitchen",
    chain: "Fishing → Kitchen",
    base: "Fish",
    refined: null,
    crafted: "Food",
    amount: 2,
    type: "kitchen"
  }
];

function formatTime(seconds) {

  seconds = Math.round(seconds);

  if (seconds < 60) {
    return seconds + "s";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return minutes + "m " + remainingSeconds + "s";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours + "h " + remainingMinutes + "m";
}

function calculateValues(tier, profession) {

  const refineTime = refiningTimes[tier];
  const gatherTime = refineTime / 2;

  // Kitchen
  if (profession.type === "kitchen") {

    const foodValue =
      (gatherTime * 2) + refineTime;

    return {
      base: gatherTime,
      refined: null,
      crafted: foodValue
    };
  }

  // Refined
  const refinedValue =
    (gatherTime * 2) + refineTime;

  let craftAction;

  // Alchemy
  if (profession.type === "alchemy") {
    craftAction = refineTime * 5;
  }
  else {
    craftAction = craftingTimes[tier];
  }

  const craftedValue =
    (refinedValue * profession.amount)
    + craftAction;

  return {
    base: gatherTime,
    refined: refinedValue,
    crafted: craftedValue
  };
}

function populateTierSelect(selectId) {

  const select =
    document.getElementById(selectId);

  select.innerHTML = "";

  tiers.forEach((tier) => {

    const option =
      document.createElement("option");

    option.value = tier;
    option.textContent = "T" + tier;

    select.appendChild(option);
  });
}

function populateResourceSelect(selectId) {

  const select =
    document.getElementById(selectId);

  select.innerHTML = "";

  professions.forEach((profession, index) => {

    const group =
      document.createElement("optgroup");

    group.label = profession.name;

    // Base
    const baseOption =
      document.createElement("option");

    baseOption.value = JSON.stringify({
      profession: index,
      type: "base"
    });

    baseOption.textContent =
      profession.base;

    group.appendChild(baseOption);

    // Refined
    if (profession.refined) {

      const refinedOption =
        document.createElement("option");

      refinedOption.value = JSON.stringify({
        profession: index,
        type: "refined"
      });

      refinedOption.textContent =
        `${profession.refined} (2x ${profession.base})`;

      group.appendChild(refinedOption);
    }

    // Crafted
    const craftedOption =
      document.createElement("option");

    craftedOption.value = JSON.stringify({
      profession: index,
      type: "crafted"
    });

    let recipeText = "";

    if (profession.type === "alchemy") {
      recipeText =
        `(5x ${profession.refined})`;
    }
    else if (profession.type === "kitchen") {
      recipeText =
        `(2x ${profession.base})`;
    }
    else {
      recipeText =
        `(20x ${profession.refined})`;
    }

    craftedOption.textContent =
      `${profession.crafted} ${recipeText}`;

    group.appendChild(craftedOption);

    select.appendChild(group);
  });
}

// Populate dropdowns
populateTierSelect("giveTier");
populateTierSelect("wantTier");

populateResourceSelect("giveType");
populateResourceSelect("wantType");

// Swap
document
  .getElementById("swapSides")
  .addEventListener("click", () => {

    const giveTier =
      document.getElementById("giveTier").value;

    const wantTier =
      document.getElementById("wantTier").value;

    const giveType =
      document.getElementById("giveType").value;

    const wantType =
      document.getElementById("wantType").value;

    document.getElementById("giveTier").value =
      wantTier;

    document.getElementById("wantTier").value =
      giveTier;

    document.getElementById("giveType").value =
      wantType;

    document.getElementById("wantType").value =
      giveType;
  });

// Calculate
document
  .getElementById("calculateTrade")
  .addEventListener("click", () => {

    const giveSelection =
      JSON.parse(
        document.getElementById("giveType").value
      );

    const wantSelection =
      JSON.parse(
        document.getElementById("wantType").value
      );

    const giveProfession =
      professions[giveSelection.profession];

    const wantProfession =
      professions[wantSelection.profession];

    const giveTier =
      parseInt(
        document.getElementById("giveTier").value
      );

    const wantTier =
      parseInt(
        document.getElementById("wantTier").value
      );

    const giveType =
      giveSelection.type;

    const wantType =
      wantSelection.type;

    const giveAmount =
      parseFloat(
        document.getElementById("giveAmount").value
      );

    const giveValues =
      calculateValues(
        giveTier,
        giveProfession
      );

    const wantValues =
      calculateValues(
        wantTier,
        wantProfession
      );

    const giveTimeValue =
      giveValues[giveType];

    const wantTimeValue =
      wantValues[wantType];

    const totalTime =
      giveTimeValue * giveAmount;

    const equivalentAmount =
      totalTime / wantTimeValue;

    const result =
      document.getElementById("tradeResult");

    result.style.display = "block";

    const giveName =
      giveType === "base"
        ? giveProfession.base
        : giveType === "refined"
          ? giveProfession.refined
          : giveProfession.crafted;

    const wantName =
      wantType === "base"
        ? wantProfession.base
        : wantType === "refined"
          ? wantProfession.refined
          : wantProfession.crafted;

    result.innerHTML = `
      <h2 style="margin-bottom:14px;">
        Equivalent Trade Value
      </h2>

      <p style="margin-bottom:10px;">
        <strong>
          ${giveAmount.toLocaleString()}
        </strong>

        T${giveTier} ${giveName}

        contains approximately

        <strong>
          ${formatTime(totalTime)}
        </strong>

        of total production time.
      </p>

      <p
        style="
          font-size:24px;
          color:#34d399;
          font-weight:bold;
          margin-top:18px;
        "
      >
        ≈
        ${equivalentAmount.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2
          }
        )}

        T${wantTier} ${wantName}
      </p>
    `;
  });

// Tables
const professionGrid =
  document.getElementById("professionGrid");

professions.forEach((profession) => {

  const card =
    document.createElement("div");

  card.className = "card";

  let tableHtml = `
    <h2>${profession.name}</h2>

    <div class="chain">
      ${profession.chain}
    </div>

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

    const values =
      calculateValues(tier, profession);

    tableHtml += `
      <tr>

        <td>T${tier}</td>

        <td>
          ${profession.base}<br>
          <span class="value">
            ${formatTime(values.base)}
          </span>
        </td>

        ${profession.refined ? `
          <td>
            ${profession.refined}<br>
            <span class="value">
              ${formatTime(values.refined)}
            </span>
          </td>
        ` : ""}

        <td>
          ${profession.crafted}<br>
          <span class="value">
            ${formatTime(values.crafted)}
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
});