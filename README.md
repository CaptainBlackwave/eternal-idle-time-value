# Resource Time Value Calculator

Calculates intrinsic value of in-game resources based on total gathering, refining, and crafting time.

## Live Demo

[https://captainblackwave.github.io/eternal-idle-time-value/](https://captainblackwave.github.io/eternal-idle-time-value/)

## How It Works

Each resource's value is derived from the total production time required to create it:

- **Base Resources** — Time to gather one raw material.
- **Refined Resources** — Time to gather 2 base materials + refining time.
- **Crafted Items** — Time for all required refined materials + crafting time.

## How to Use

### Trade Calculator

1. **Select a tier** (T1–T10) for the resource you're giving and the resource you want.
2. **Choose the resource type** — base, refined, or crafted item — from the dropdown for each side.
3. **Enter the amount** you're giving.
4. Click **Calculate Equivalent Trade** to see how much of the target resource you should receive in a fair trade.
5. Use the **⇄ swap button** to quickly reverse the trade sides.

### Profession Tables

Below the trade calculator, each profession is displayed in its own card with a table showing all tiers. Each row shows the production time for the base resource, refined resource (if applicable), and crafted item.

### Professions Covered

| Profession | Chain | Base | Refined | Crafted |
|------------|-------|------|---------|---------|
| Toolmaker | Lumberjack → Lumber Mill → Toolmaker | Logs | Planks | Tools |
| Warrior's Forge | Mining → Smelting → Warrior's Forge | Ore | Bars | Warrior Gear |
| Hunter's Lodge | Skinning → Tannery → Hunter's Lodge | Hides | Leather | Hunter Gear |
| Mage's Tower | Harvesting → Loom → Mage's Tower | Fiber | Cloth | Mage Gear |
| Alchemy Lab | Herbalism → Distillation → Alchemy Lab | Herbs | Extract | Potion |
| Kitchen | Fishing → Kitchen | Fish | — | Food |

## Project Structure

```
├── index.html       # HTML structure
├── css/
│   └── styles.css   # All styling
├── js/
│   └── script.js    # All logic (data, calculations, event handlers)
└── README.md
```

## Local Development

Open `index.html` in any modern browser. No build tools or server required.