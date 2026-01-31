export type RelicCatalogEntry = {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  priceGold: number;
  unlockCondition?: string;
  requiresSkillId?: string;
  isLimited?: boolean;
};

export const relicCatalog: RelicCatalogEntry[] = [
  {
    id: "cinder-hood",
    name: "Cinder Hood",
    description: "Starter mantle to mark new Players.",
    slot: "Head",
    rarity: "Common",
    priceGold: 40,
  },
  {
    id: "lens-of-clarity",
    name: "Lens of Clarity",
    description: "A face relic that gleams when insights land.",
    slot: "Face",
    rarity: "Uncommon",
    priceGold: 80,
  },
  {
    id: "scribe-robes",
    name: "Scribe Robes",
    description: "Cloth etched with runes of relentless practice.",
    slot: "Body",
    rarity: "Rare",
    priceGold: 180,
  },
  {
    id: "ember-gloves",
    name: "Ember Gloves",
    description: "Warmth for steady hands in the arena.",
    slot: "Hands",
    rarity: "Uncommon",
    priceGold: 90,
  },
  {
    id: "debug-sabre",
    name: "Debug Sabre",
    description: "A ceremonial blade for clean fixes.",
    slot: "Handheld",
    rarity: "Epic",
    priceGold: 340,
    unlockCondition: "Clear 10 Quests without a crash.",
  },
  {
    id: "rift-cloak",
    name: "Rift Cloak",
    description: "Cloak of the patient wanderer.",
    slot: "Back",
    rarity: "Rare",
    priceGold: 220,
  },
  {
    id: "nocturne-backdrop",
    name: "Nocturne Backdrop",
    description: "Midnight fog behind your Character Vessel.",
    slot: "Background",
    rarity: "Epic",
    priceGold: 360,
    unlockCondition: "Bind three Relics.",
  },
  {
    id: "sigil-frame",
    name: "Sigil Frame",
    description: "A border that hums with earned mastery.",
    slot: "Frame",
    rarity: "Legendary",
    priceGold: 600,
    unlockCondition: "Master Focus Flow (Tier 3).",
    requiresSkillId: "focus-flow",
  },
  {
    id: "aether-aura",
    name: "Aether Aura",
    description: "A rare glow reserved for myth-bound Players.",
    slot: "Aura",
    rarity: "Mythic",
    priceGold: 1000,
    unlockCondition: "Defeat a seasonal boss event.",
    isLimited: true,
  },
];
