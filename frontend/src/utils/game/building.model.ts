export const BuildingData = [
  {
    name: "WOODCUTTER",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 40, start: 0 },
      iron: { value: 0, start: 0 },
      worker: { value: 0.5, start: 8 }
    },
    hq: 1,
    baseEffects: [
      {
        type: "production",
        subtype: "wood",
        base: 0.5
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "MINE",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 40, start: 1 },
      iron: { value: 10, start: 2 },
      worker: { value: 0.5, start: 8 }
    },
    hq: 2,
    baseEffects: [
      {
        type: "production",
        subtype: "iron",
        base: 0.5
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "SAWMILL",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 150, start: 0 },
      iron: { value: 37, start: 0 },
      worker: { value: 2, start: 0 }
    },
    hq: 5,
    baseEffects: [
      {
        type: "production",
        subtype: "wood",
        base: 0.5
      },
      {
        type: "production",
        subtype: "wood",
        multiplier: 1.01
      },
      {
        type: "storage",
        subtype: "wood",
        base: 200
      }
    ],
    requires: null,
    unique: false,
    tiers: 2,
    destructible: true,
    upgradeable: true
  },
  {
    name: "FURNACE",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 150, start: 0 },
      iron: { value: 37, start: 0 },
      worker: { value: 2, start: 0 }
    },
    hq: 5,
    baseEffects: [
      {
        type: "production",
        subtype: "iron",
        base: 0.5
      },
      {
        type: "production",
        subtype: "iron",
        multiplier: 1.01
      },
      {
        type: "storage",
        subtype: "iron",
        base: 200
      }
    ],
    requires: null,
    unique: false,
    tiers: 2,
    destructible: true,
    upgradeable: true
  },
  {
    name: "STORAGE",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 80, start: 0 },
      iron: { value: 20, start: 0 },
      worker: { value: 1, start: 3 }
    },
    hq: 3,
    baseEffects: [
      {
        type: "storage",
        subtype: "iron",
        base: 1000
      },
      {
        type: "storage",
        subtype: "wood",
        base: 1000
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "TRAINING_CENTER",
    category: ["MILITARY"],
    cost: {
      wood: { value: 100, start: 0 },
      iron: { value: 150, start: 0 },
      worker: { value: 8, start: 4 }
    },
    hq: 4,
    baseEffects: [
      {
        type: "production",
        subtype: "soldiers",
        base: 0.05
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "BARRACK",
    category: ["MILITARY"],
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 500, start: 0 },
      worker: { value: 15, start: 4 }
    },
    hq: 5,
    baseEffects: [
      {
        type: "storage",
        subtype: "soldiers",
        base: 250
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "TAVERN",
    category: ["WORKER"],
    cost: {
      wood: { value: 150, start: 0 },
      iron: { value: 100, start: 0 },
      worker: { value: 0, start: 0 }
    },
    hq: 5,
    baseEffects: [
      {
        type: "production",
        subtype: "workers",
        base: 0.1
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "HOUSE",
    category: ["WORKER"],
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 400, start: 0 },
      worker: { value: 8, start: 4 }
    },
    hq: 6,
    baseEffects: [
      {
        type: "storage",
        subtype: "workers",
        base: 500
      }
    ],
    requires: null,
    unique: false,
    tiers: 1,
    destructible: true,
    upgradeable: true
  },
  {
    name: "KNIGHT_TRAINING_CENTER",
    category: ["SUPPORT"],
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 1000, start: 0 },
      worker: { value: 5, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "production",
        subtype: "knight",
        base: 0.1
      }
    ],
    requires: "KNIGHT_TRAINING_CENTER",
    unique: false,
    tiers: 2,
    destructible: true,
    upgradeable: true
  },
  {
    name: "GUARDIAN_TRAINING_CENTER",
    category: ["SUPPORT"],
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 1000, start: 0 },
      worker: { value: 5, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "production",
        subtype: "guardian",
        base: 0.1
      }
    ],
    requires: "GUARDIAN_TRAINING_CENTER",
    unique: false,
    tiers: 2,
    destructible: true,
    upgradeable: true
  },
  {
    name: "GUARD_TOWER",
    category: ["MILITARY"],
    cost: {
      wood: { value: 400, start: 0 },
      iron: { value: 900, start: 0 },
      worker: { value: 10, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "world",
        subtype: "attack",
        bonus: 3
      },
      {
        type: "world",
        subtype: "defense",
        bonus: 3
      }
    ],
    requires: null,
    unique: false,
    tiers: 2,
    destructible: true,
    upgradeable: true
  },
  {
    name: "ARENA",
    category: ["MILITARY", "SUPPORT"],
    cost: {
      wood: { value: 600, start: 0 },
      iron: { value: 1200, start: 0 },
      worker: { value: 30, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "world",
        subtype: "guardianPower",
        multiplier: 1.03
      },
      {
        type: "production",
        subtype: "guardian",
        multiplier: 1.01
      },
      {
        type: "world",
        subtype: "knightPower",
        multiplier: 1.03
      },
      {
        type: "production",
        subtype: "knight",
        multiplier: 1.01
      },
      {
        type: "production",
        subtype: "soldiers",
        multiplier: 1.01
      }
    ],
    requires: null,
    unique: false,
    tiers: 3,
    destructible: true,
    upgradeable: true
  },
  {
    name: "GUILD_HALL",
    category: ["WORKER"],
    cost: {
      wood: { value: 1200, start: 0 },
      iron: { value: 800, start: 0 },
      worker: { value: 25, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "world",
        subtype: "worker",
        multiplier: 1.01
      },
      {
        type: "production",
        subtype: "workers",
        multiplier: 1.01
      },
      {
        type: "storage",
        subtype: "workers",
        base: 300
      }
    ],
    requires: null,
    unique: false,
    tiers: 3,
    destructible: true,
    upgradeable: true
  },
  {
    name: "TOWN_HALL",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 1000, start: 0 },
      iron: { value: 600, start: 0 },
      worker: { value: 15, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "production",
        subtype: "wood",
        multiplier: 1.03
      },
      {
        type: "production",
        subtype: "iron",
        multiplier: 1.03
      },
      {
        type: "storage",
        subtype: "wood",
        multiplier: 1.03
      },
      {
        type: "storage",
        subtype: "iron",
        multiplier: 1.03
      }
    ],
    requires: null,
    unique: false,
    tiers: 3,
    destructible: true,
    upgradeable: true
  },
  {
    name: "MERCENARY_OFFICE",
    category: ["MILITARY", "WORKER"],
    cost: {
      wood: { value: 150, start: 0 },
      iron: { value: 150, start: 0 },
      worker: { value: 10, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "production",
        subtype: "soldiers",
        base: 0.05
      },
      {
        type: "production",
        subtype: "workers",
        base: 0.1
      }
    ],
    requires: null,
    unique: false,
    tiers: 4,
    destructible: true,
    upgradeable: true
  },
  {
    name: "GARRISON_HALL",
    category: ["MILITARY", "WORKER"],
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 500, start: 0 },
      worker: { value: 20, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "storage",
        subtype: "soldiers",
        base: 500
      },
      {
        type: "storage",
        subtype: "workers",
        base: 1000
      }
    ],
    requires: null,
    unique: false,
    tiers: 4,
    destructible: true,
    upgradeable: true
  },
  {
    name: "MARKET",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 10000, start: 0 },
      iron: { value: 10000, start: 0 },
      worker: { value: 500, start: 0 }
    },
    hq: 10,
    baseEffects: [],
    requires: "MARKET",
    unique: true,
    tiers: 4,
    destructible: true,
    upgradeable: false
  },
  {
    name: "RECYCLING_WORKSHOP",
    category: ["ECONOMY"],
    cost: {
      wood: { value: 10000, start: 0 },
      iron: { value: 10000, start: 0 },
      worker: { value: 500, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "buildings",
        subtype: "recycling",
        bonus: 40
      }
    ],
    requires: null,
    unique: true,
    tiers: 4,
    destructible: false,
    upgradeable: false
  }
] as const;

export const BuildingNames = BuildingData.map(data => data.name);
export type BuildingNameType = typeof BuildingNames[number];

export interface Building {
  id: number
  type: BuildingNameType | null
  count: number
  level: number
  sortOrder?: number
}