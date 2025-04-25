const classes = {
  Warrior: {
    hp: 120, strength: 15, defense: 12,
    skills: [
      { name: "Power Strike", damage: 20 },
      { name: "Shield Wall", defenseBoost: 10 }
    ]
  },
  Mage: {
    hp: 80, strength: 20, defense: 8,
    skills: [
      { name: "Fireball", damage: 25 },
      { name: "Arcane Shield", defenseBoost: 8 }
    ]
  },
  Rogue: {
    hp: 100, strength: 12, defense: 10,
    skills: [
      { name: "Backstab", damage: 18 },
      { name: "Vanish", dodge: true }
    ]
  }
};

let player = {
  name: "Wanderer",
  class: null,
  level: 1,
  hp: 0,
  strength: 0,
  defense: 0,
  xp: 0,
  inventory: [],
  equipment: {
    weapon: null,
    armor: null,
    trinket: null,
    boots: null
  },
  skills: []
};

function chooseClass(className) {
  const stats = classes[className];
  player = {
    ...player,
    class: className,
    hp: stats.hp,
    strength: stats.strength,
    defense: stats.defense,
    skills: stats.skills
  };
  document.getElementById("classSelect").style.display = "none";
  updateStats();
  logMessage(`You have chosen the path of the ${className}.`);
  saveGame();
}

function getRandomItem() {
  const items = [
    { name: "Sword of Sparks", type: "weapon", slot: "weapon", str: 5 },
    { name: "Shield of Mist", type: "armor", slot: "armor", def: 5 },
    { name: "Cursed Ring", type: "trinket", slot: "trinket", str: -3, def: -3 },
    { name: "Healing Potion", type: "potion", hp: 30 },
    { name: "Boots of Speed", type: "boots", slot: "boots", str: 2, def: 1 },
  ];
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomEvent() {
  const events = [
    { type: "town", text: "You enter a bustling town." },
    { type: "dungeon", text: "You descend into a dark dungeon." },
    { type: "battle", text: "A wild monster appears!" },
    { type: "loot", text: "You discover a hidden stash!" },
    { type: "quest", text: getRandomQuest() }
  ];
  return events[Math.floor(Math.random() * events.length)];
}

function getRandomQuest() {
  const quests = [
    "Slay the cave troll.",
    "Find the emerald orb.",
    "Escort the merchant.",
    "Recover the stolen map.",
    "Explore the haunted ruins."
  ];
  return "Quest: " + quests[Math.floor(Math.random() * quests.length)];
}

function logMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML = `<p>${message}</p>` + log.innerHTML;
}

function continueJourney() {
  if (!player.class) {
    logMessage("Choose a class to begin your journey.");
    return;
  }
  const event = getRandomEvent();
  logMessage(event.text);

  switch (event.type) {
    case "town":
      player.hp += 10;
      logMessage("You rest and recover 10 HP.");
      break;
    case "dungeon":
      logMessage("You sense something dangerous ahead...");
      break;
    case "battle":
      const dmg = Math.floor(Math.random() * 20);
      player.hp -= dmg;
      player.xp += 10;
      logMessage(`You fight and take ${dmg} damage. Gained 10 XP.`);
      if (player.xp >= 50) {
        player.level++;
        player.strength += 2;
        player.defense += 2;
        player.hp += 20;
        player.xp = 0;
        logMessage("You leveled up! Stats increased.");
      }
      break;
    case "loot":
      const item = getRandomItem();
      if (item.type === "potion") {
        player.hp += item.hp;
        logMessage(`You used: ${item.name} (+${item.hp} HP)`);
      } else {
        player.inventory.push(item);
        logMessage(`You found: ${item.name}`);
      }
      break;
    case "quest":
      logMessage("A new adventure awaits: " + event.text);
      break;
  }

  updateStats();
  saveGame();
}

function showInventory() {
  const container = document.getElementById("log");
  let content = "<p>Inventory:</p>";
  if (player.inventory.length === 0) {
    content += "<p>Empty</p>";
  } else {
    player.inventory.forEach((item, i) => {
      content += `<button onclick="equipItem(${i})">${item.name} (${item.type})</button><br>`;
    });
  }
  container.innerHTML = content + container.innerHTML;
}

function equipItem(index) {
  const item = player.inventory[index];
  if (item && item.slot) {
    const slot = item.slot;
    const oldItem = player.equipment[slot];
    if (oldItem) {
      if (oldItem.str) player.strength -= oldItem.str;
      if (oldItem.def) player.defense -= oldItem.def;
      player.inventory.push(oldItem);
    }
    player.equipment[slot] = item;
    if (item.str) player.strength += item.str;
    if (item.def) player.defense += item.def;
    player.inventory.splice(index, 1);
    logMessage(`Equipped ${item.name} in ${slot} slot.`);
    updateStats();
    saveGame();
  } else {
    logMessage("That item cannot be equipped.");
  }
}

function showSkills() {
  if (!player.skills.length) {
    logMessage("No skills available.");
    return;
  }
  let html = "<p>Use a skill:</p>";
  player.skills.forEach((s, i) => {
    html += `<button onclick="useSkill(${i})">${s.name}</button><br>`;
  });
  document.getElementById("log").innerHTML = html + document.getElementById("log").innerHTML;
}

function useSkill(index) {
  const skill = player.skills[index];
  if (skill.damage) {
    logMessage(`${skill.name} used! Dealt ${skill.damage} magical damage.`);
  } else if (skill.defenseBoost) {
    player.defense += skill.defenseBoost;
    logMessage(`${skill.name} increases your defense by ${skill.defenseBoost}.`);
  } else if (skill.dodge) {
    logMessage(`${skill.name} used! You vanish and dodge the next attack.`);
  }
  updateStats();
  saveGame();
}

function updateStats() {
  document.getElementById("stats").innerHTML = `
    <p><strong>${player.name}</strong></p>
    <p>Class: ${player.class || "Unchosen"}</p>
    <p>Level: ${player.level}</p>
    <p>HP: ${player.hp}</p>
    <p>Strength: ${player.strength}</p>
    <p>Defense: ${player.defense}</p>
    <p>XP: ${player.xp}/50</p>
    <p>Equipment: ${Object.entries(player.equipment).map(([slot, item]) => 
      `${slot}: ${item ? item.name : "None"}`).join("<br>")}</p>
  `;
}

function saveGame() {
  localStorage.setItem("evershift_player", JSON.stringify(player));
}

function loadGame() {
  const data = localStorage.getItem("evershift_player");
  if (data) {
    player = JSON.parse(data);
    updateStats();
    document.getElementById("classSelect").style.display = "none";
    logMessage("Game loaded.");
  }
}

loadGame();


function simulatePvP() {
  const opponent = {
    name: "Challenger",
    class: "Rogue",
    level: 1,
    hp: 100,
    strength: 12,
    defense: 10,
    xp: 0,
    skills: [
      { name: "Backstab", damage: 18 },
      { name: "Vanish", dodge: true }
    ],
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      trinket: null,
      boots: null
    }
  };

  logMessage("PvP Battle Started: You vs " + opponent.name);

  const playerAttack = Math.max(0, player.strength - opponent.defense + Math.floor(Math.random() * 10));
  const opponentAttack = Math.max(0, opponent.strength - player.defense + Math.floor(Math.random() * 10));

  opponent.hp -= playerAttack;
  player.hp -= opponentAttack;

  logMessage(`You hit ${opponent.name} for ${playerAttack} damage.`);
  logMessage(`${opponent.name} hits you for ${opponentAttack} damage.`);

  if (player.hp <= 0 && opponent.hp <= 0) {
    logMessage("Both fighters collapse! It's a draw!");
  } else if (player.hp <= 0) {
    logMessage("You are defeated by the challenger.");
  } else if (opponent.hp <= 0) {
    logMessage("Victory! You defeated the challenger.");
    player.xp += 25;
    if (player.xp >= 50) {
      player.level++;
      player.hp += 20;
      player.strength += 2;
      player.defense += 2;
      player.xp = 0;
      logMessage("You leveled up from PvP battle!");
    }
  }

  updateStats();
  saveGame();
}


const towns = [
  {
    name: "Oakridge",
    shop: [
      { name: "Health Potion", type: "potion", hp: 30, price: 10 },
      { name: "Steel Sword", type: "weapon", slot: "weapon", str: 5, price: 25 },
      { name: "Leather Armor", type: "armor", slot: "armor", def: 4, price: 20 }
    ],
    npcs: [
      { name: "Elder Myra", dialog: "Welcome to Oakridge, traveler. Beware the eastern woods." },
      { name: "Blacksmith Jon", dialog: "Looking to sharpen your blade? I've got what you need." }
    ]
  }
];

let playerGold = 50;

function visitTown() {
  const town = towns[0];
  logMessage(`You arrive in ${town.name}.`);
  showTownOptions(town);
}

function showTownOptions(town) {
  let html = `<p>Welcome to ${town.name}!</p>`;
  html += "<p><strong>Shop:</strong></p>";
  town.shop.forEach((item, i) => {
    html += `<button onclick="buyItem(${i})">${item.name} (${item.price}g)</button><br>`;
  });
  html += "<p><strong>Talk to NPCs:</strong></p>";
  town.npcs.forEach((npc, i) => {
    html += `<button onclick="talkToNPC(${i})">${npc.name}</button><br>`;
  });
  html += `<p>You have ${playerGold} gold.</p>`;
  document.getElementById("log").innerHTML = html + document.getElementById("log").innerHTML;
}

function buyItem(index) {
  const item = towns[0].shop[index];
  if (playerGold >= item.price) {
    playerGold -= item.price;
    player.inventory.push(item);
    logMessage(`You bought ${item.name} for ${item.price} gold.`);
  } else {
    logMessage("You don't have enough gold.");
  }
  updateStats();
  saveGame();
}

function talkToNPC(index) {
  const npc = towns[0].npcs[index];
  logMessage(`${npc.name} says: "${npc.dialog}"`);
}
