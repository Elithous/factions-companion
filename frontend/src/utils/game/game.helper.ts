import { Building, BuildingData, BuildingNameType } from "./building.model";

const baseCostMulti = 1.5;

export const ScalingValues = ['wood', 'iron', 'worker'] as const;
export type ScalingTypes = typeof ScalingValues[number];

export const MultiplierValues = ['wood', 'iron', 'workers', 'soldiers', 'knight', 'guardian'] as const;
export type MultiplierTypes = typeof MultiplierValues[number];

export const StorageValues = ['wood', 'iron', 'soldiers', 'workers'] as const;
export type StorageTypes = typeof StorageValues[number];

export const WorldEffectValues = ['attack', 'defense'] as const;
export type WorldEffectTypes = typeof WorldEffectValues[number];

export interface GameConfig {
  cost_multi: {
    building: { [key in ScalingTypes]: number }
    hq: { [key in ScalingTypes]: number }
  },
  prod_multi: {
    [key in MultiplierTypes]: { final: number, percent: number }
  },
  storage_multi: {
    [key in StorageTypes]: { final: number, percent: number }
  },
  world_multi: {
    [key in WorldEffectTypes]: { final: number, percent: number }
  },
  useCostChange: boolean
  costChange: number
};

export const defaultConfig: GameConfig = {
  cost_multi: {
    building: { wood: 1, iron: 1, worker: 1 },
    hq: { wood: 1, iron: 1, worker: 1 }
  },
  prod_multi: {
    wood: { final: 1, percent: 0 },
    iron: { final: 1, percent: 0 },
    workers: { final: 1, percent: 0 },
    soldiers: { final: 1, percent: 0 },
    knight: { final: 1, percent: 0 },
    guardian: { final: 1, percent: 0 },
  },
  storage_multi: {
    wood: { final: 1, percent: 0 },
    iron: { final: 1, percent: 0 },
    soldiers: { final: 1, percent: 0 },
    workers: { final: 1, percent: 0 }
  },
  world_multi: {
    attack: { final: 1, percent: 0 },
    defense: { final: 1, percent: 0 }
  },
  useCostChange: false,
  costChange: 0
};

export function isValidConfig(config: GameConfig) {
  try {
    const valid =
      config.cost_multi.building.wood !== undefined &&
      config.cost_multi.building.iron !== undefined &&
      config.cost_multi.building.worker !== undefined &&
      config.cost_multi.hq.wood !== undefined &&
      config.cost_multi.hq.iron !== undefined &&
      config.cost_multi.hq.worker !== undefined &&
      config.prod_multi.wood.percent !== undefined &&
      config.prod_multi.wood.final !== undefined &&
      config.prod_multi.iron.percent !== undefined &&
      config.prod_multi.iron.final !== undefined &&
      config.prod_multi.workers.percent !== undefined &&
      config.prod_multi.workers.final !== undefined &&
      config.prod_multi.soldiers.percent !== undefined &&
      config.prod_multi.soldiers.final !== undefined &&
      config.prod_multi.guardian.percent !== undefined &&
      config.prod_multi.guardian.final !== undefined &&
      config.prod_multi.knight.percent !== undefined &&
      config.prod_multi.knight.final !== undefined &&
      config.world_multi.attack.percent !== undefined &&
      config.world_multi.attack.final !== undefined &&
      config.world_multi.defense.percent !== undefined &&
      config.world_multi.defense.final !== undefined &&
      config.storage_multi.iron !== undefined &&
      config.storage_multi.wood !== undefined &&
      config.storage_multi.soldiers !== undefined &&
      config.storage_multi.workers !== undefined;

      return valid;
  } catch {
    return false;
  }
}

export function getBuildingCost(type: BuildingNameType, level: number, config: GameConfig | undefined) {
  const data = BuildingData.find(bData => bData.name === type);

  if (!data) {
    throw Error(`Building data not found: ${type}`);
  }

  const costs: Partial<{ [key in ScalingTypes]: number }> = {};
  for (const costType of Object.keys(data.cost) as ScalingTypes[]) {
    if (level < data.cost[costType].start) {
      costs[costType] = 0;
      continue;
    };

    const baseCost = data.cost[costType].value;
    let costMulti = config?.cost_multi?.building?.[costType] || 1;
    if (config?.useCostChange) costMulti *= config.costChange;
    const totalCostMulti = baseCostMulti * costMulti;

    costs[costType] = Math.floor(baseCost * Math.pow(totalCostMulti, level - 1));
  }

  return costs as { [key in ScalingTypes]: number };
}

const HqData = {
  name: "HQ",
  cost: {
    wood: { value: 50, start: 0 },
    iron: { value: 50, start: 0 },
    worker: { value: 2, start: 11 }
  },
  baseEffects: [
    {
      type: "production",
      subtype: "wood",
      base: 0.5
    }
  ]
};

export function getHqCost(hqLevel: number, config: GameConfig | undefined): { [key in ScalingTypes]: number } {
  if (hqLevel < 2) {
    return {
      wood: 0,
      iron: 0,
      worker: 0
    }
  }

  const costs: Partial<{ [key in ScalingTypes]: number }> = {};
  for (const costType of Object.keys(HqData.cost) as ScalingTypes[]) {
    if (hqLevel < HqData.cost[costType].start) {
      costs[costType] = 0;
      continue;
    };

    const baseCost = HqData.cost[costType].value;
    let costMulti = config?.cost_multi?.hq?.[costType] || 1;
    if (config?.useCostChange) costMulti *= config.costChange;
    const totalCostMulti = baseCostMulti * costMulti;

    costs[costType] = Math.floor(baseCost * Math.pow(totalCostMulti, hqLevel - 2));
  }

  return costs as { [key in ScalingTypes]: number };
}

export function getTotalHqCost(hqLevel: number, config: GameConfig | undefined) {
  const costs: { [key in ScalingTypes]: number } = {
    wood: 0,
    iron: 0,
    worker: 0
  };

  for (let level = 2; level <= hqLevel; level++) {
    const levelCost = getHqCost(level, config);

    costs.wood += levelCost.wood;
    costs.iron += levelCost.iron;
    costs.worker += levelCost.worker;
  }

  return costs;
}

export function getTotalCosts(hqLevel: number, buildings: Building[], config: GameConfig | undefined) {
  const costs = getTotalHqCost(hqLevel, config);

  if (!buildings?.length) {
    return costs;
  }

  buildings.forEach(building => {
    if (!building.type) return;

    for (let level = 1; level <= building.level; level++) {
      const levelCost = getBuildingCost(building.type, level, config);

      costs.wood += levelCost.wood * building.count;
      costs.iron += levelCost.iron * building.count;
      costs.worker += levelCost.worker * building.count;
    }
  });

  return costs;
}

function sortBuildings(a: Building, b: Building): number {
  if (!b.type) return -1;
  if (!a.type) return 1;
  if (a.type < b.type) return -1;
  if (a.type > b.type) return 1;

  if (a.level > b.level) return -1;
  if (a.level < b.level) return 1;

  if (a.count > b.count) return -1;
  if (a.count < b.count) return 1;

  return 0;
}

export function getBuildOverlap(start: Building[], end: Building[]): Building[] {
  const overlap: Building[] = [];

  const startCopy = start.map(value => ({ ...value })).sort(sortBuildings);
  let endCopy = end.map(value => ({ ...value })).sort(sortBuildings);
  for (let index = 0; index < startCopy.length; index++) {
    const building = startCopy[index];
    if (!building.type || building.count === 0 || building.level === 0) continue; // Don't check undefined/empty buildings.

    const match = endCopy.find(value => value.type === building.type);
    if (!match) continue; // No match found, no overlap

    const overlapCount = Math.min(building.count, match.count);
    const overlapLevels = Math.min(building.level, match.level);

    overlap.push({
      id: building.id,
      type: building.type,
      count: overlapCount,
      level: overlapLevels
    });

    // Remove already checked values and re-check current buildings if there are still some remaining.
    building.count -= overlapCount;
    match.count -= overlapCount;

    endCopy = endCopy.filter(value => value.count > 0);
    if (building.count > 0) index--;
  }
  return overlap;
}

export function getTotalProductionModifiers(buildings: Building[]) {
  const totalMods: { [key in MultiplierTypes]: { bonus: number } } = {
    wood: { bonus: 0 },
    iron: { bonus: 0 },
    workers: { bonus: 0 },
    soldiers: { bonus: 0 },
    guardian: { bonus: 0 },
    knight: { bonus: 0 }
  };

  buildings.forEach(building => {
    if (!building.type) return;
    const buildingData = BuildingData.find(data => data.name === building.type);

    buildingData?.baseEffects.forEach(effect => {
      if (effect.type === 'production' && 'bonus' in effect) {
        const bonusEffect = effect.bonus * building.count * building.level;

        totalMods[effect.subtype].bonus += bonusEffect;
      }
    });
  });

  return totalMods;
}

export function getTotalStorageModifiers(buildings: Building[]) {
  const totalMods: { [key in StorageTypes]: { bonus: number } } = {
    wood: { bonus: 0 },
    iron: { bonus: 0 },
    workers: { bonus: 0 },
    soldiers: { bonus: 0 }
  };

  buildings.forEach(building => {
    if (!building.type) return;
    const buildingData = BuildingData.find(data => data.name === building.type);

    buildingData?.baseEffects.forEach(effect => {
      if (effect.type === 'storage' && 'bonus' in effect) {
        const bonusEffect = effect.bonus * building.count * building.level;

        totalMods[effect.subtype].bonus += bonusEffect;
      }
    });
  });

  return totalMods;
}

export function getTotalStorage(buildings: Building[], config: GameConfig | undefined) {
  const bonuses = getTotalStorageModifiers(buildings);
  const buildingConfig: GameConfig = structuredClone(config ?? defaultConfig);

  StorageValues.forEach(value => {
    buildingConfig.storage_multi[value].percent += bonuses[value].bonus;
  });

  const totalStorage: { [key in StorageTypes]: { base: number, final: number } } = {
    wood: { base: 0, final: 0 },
    iron: { base: 0, final: 0 },
    workers: { base: 0, final: 0 },
    soldiers: { base: 0, final: 0 }
  };

  // Add base wood output from HQ first
  const allMulties = buildingConfig?.storage_multi;
  totalStorage.wood.base += 150;
  totalStorage.wood.final += (totalStorage.wood.base + (allMulties?.wood?.percent ?? 0) / 100) * (allMulties?.wood?.final ?? 1);
  totalStorage.iron.base += 150;
  totalStorage.iron.final += (totalStorage.iron.base + (allMulties?.iron?.percent ?? 0) / 100) * (allMulties?.iron?.final ?? 1);
  totalStorage.soldiers.base += 50;
  totalStorage.soldiers.final += (totalStorage.soldiers.base + (allMulties?.soldiers.percent ?? 0) / 100) * (allMulties?.soldiers?.final ?? 1);
  totalStorage.workers.base += 50;
  totalStorage.workers.final += (totalStorage.workers.base + (allMulties.workers?.percent ?? 0) / 100) * (allMulties?.workers?.final ?? 1);

  buildings.forEach(building => {
    if (!building.type) return;
    const buildingData = BuildingData.find(data => data.name === building.type);

    buildingData?.baseEffects.forEach(effect => {
      if (effect.type === 'storage' && 'base' in effect) {
        const multis = allMulties?.[effect.subtype];

        const baseEffect = effect.base * building.count * building.level;
        const totalEffect = (baseEffect * (1 + (multis?.percent ?? 0) / 100)) * (multis?.final ?? 1);
        totalStorage[effect.subtype].base += baseEffect;
        totalStorage[effect.subtype].final += totalEffect;
      }
    });
  });

  return totalStorage;
}

export function getTotalOutput(buildings: Building[], config: GameConfig | undefined) {
  // TODO: Modify multiplier values based on existing buildings?
  const bonuses = getTotalProductionModifiers(buildings);
  const buildingConfig: GameConfig = structuredClone(config ?? defaultConfig);

  MultiplierValues.forEach(value => {
    buildingConfig.prod_multi[value].percent += bonuses[value].bonus;
  });

  const totalOutput: { [key in MultiplierTypes]: { base: number, final: number } } = {
    wood: { base: 0, final: 0 },
    iron: { base: 0, final: 0 },
    workers: { base: 0, final: 0 },
    soldiers: { base: 0, final: 0 },
    guardian: { base: 0, final: 0 },
    knight: { base: 0, final: 0 }
  };

  // Add base wood output from HQ first
  const hqMulti = buildingConfig?.prod_multi?.wood;
  totalOutput.wood.base += 1;
  totalOutput.wood.final += (1 + (hqMulti?.percent ?? 0) / 100) * (hqMulti?.final ?? 1);

  buildings.forEach(building => {
    if (!building.type) return;
    const buildingData = BuildingData.find(data => data.name === building.type);

    buildingData?.baseEffects.forEach(effect => {
      if (effect.type === 'production' && 'base' in effect) {
        const multis = buildingConfig?.prod_multi?.[effect.subtype];

        const baseEffect = effect.base * building.count * building.level;
        const totalEffect = (baseEffect * (1 + (multis?.percent ?? 0) / 100)) * (multis?.final ?? 1);
        totalOutput[effect.subtype].base += baseEffect;
        totalOutput[effect.subtype].final += totalEffect;
      }
    });
  });

  return totalOutput;
}