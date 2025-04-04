

export const BuildingData = [
  {
    name: "WOODCUTTER",
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
    unique: false
  },
  {
    name: "MINE",
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
    unique: false
  },
  {
    name: "SAWMILL",
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
        bonus: 3
      },
      {
        type: "storage",
        subtype: "wood",
        base: 200
      }
    ],
    requires: "SAWMILL",
    unique: false
  },
  {
    name: "FURNACE",
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
        bonus: 3
      },
      {
        type: "storage",
        subtype: "iron",
        base: 200
      }
    ],
    requires: "FURNACE",
    unique: false
  },
  {
    name: "STORAGE",
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
    unique: false
  },
  {
    name: "TRAINING_CENTER",
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
    unique: false
  },
  {
    name: "BARRACK",
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
    unique: false
  },
  {
    name: "TAVERN",
    cost: {
      wood: { value: 150, start: 0 },
      iron: { value: 100, start: 0 },
      worker: { value: 10, start: 4 }
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
    unique: false
  },
  {
    name: "HOUSE",
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
    unique: false
  },
  {
    name: "COMMAND_CENTER",
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 1000, start: 0 },
      worker: { value: 15, start: 0 }
    },
    hq: 10,
    baseEffects: [
      {
        type: "talent",
        subtype: "talent",
        base: 1
      }
    ],
    requires: "COMMAND_CENTER",
    unique: true
  },
  {
    name: "KNIGHT_TRAINING_CENTER",
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 1000, start: 0 },
      worker: { value: 15, start: 0 }
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
    unique: false
  },
  {
    name: "GUARDIAN_TRAINING_CENTER",
    cost: {
      wood: { value: 500, start: 0 },
      iron: { value: 1000, start: 0 },
      worker: { value: 15, start: 0 }
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
    unique: false
  },
  {
    name: "GUARD_TOWER",
    cost: {
      wood: { value: 400, start: 0 },
      iron: { value: 900, start: 0 },
      worker: { value: 10, start: 0 }
    },
    hq: 12,
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
    requires: "GUARD_TOWER",
    unique: false
  },
  {
    name: "ARENA",
    cost: {
      wood: { value: 600, start: 0 },
      iron: { value: 1200, start: 0 },
      worker: { value: 30, start: 0 }
    },
    hq: 12,
    baseEffects: [
      {
        type: "world",
        subtype: "guardianPower",
        bonus: 3
      },
      {
        type: "production",
        subtype: "guardian",
        bonus: 3
      },
      {
        type: "world",
        subtype: "knightPower",
        bonus: 3
      },
      {
        type: "production",
        subtype: "knight",
        bonus: 3
      },
      {
        type: "production",
        subtype: "soldiers",
        bonus: 3
      }
    ],
    requires: "ARENA",
    unique: false
  },
  {
    name: "MERCENARY_OFFICE",
    cost: {
      wood: { value: 350, start: 0 },
      iron: { value: 350, start: 0 },
      worker: { value: 12, start: 0 }
    },
    hq: 12,
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
      },
      {
        type: "production",
        subtype: "iron",
        bonus: -3
      },
      {
        type: "production",
        subtype: "wood",
        bonus: -3
      }
    ],
    requires: "MERCENARY_OFFICE",
    unique: false
  },
  {
    name: "TOWN_HALL",
    cost: {
      wood: { value: 1000, start: 0 },
      iron: { value: 600, start: 0 },
      worker: { value: 15, start: 0 }
    },
    hq: 12,
    baseEffects: [
      {
        type: "production",
        subtype: "wood",
        bonus: 5
      },
      {
        type: "production",
        subtype: "iron",
        bonus: 5
      },
      {
        type: "storage",
        subtype: "wood",
        bonus: 8
      },
      {
        type: "storage",
        subtype: "iron",
        bonus: 8
      }
    ],
    requires: "TOWN_HALL",
    unique: false
  }
] as const;

export const BuildingNames = BuildingData.map(data => data.name);
export type BuildingNameType = typeof BuildingNames[number];

export interface Building {
  id: number
  type: BuildingNameType | null
  count: number
  level: number
}