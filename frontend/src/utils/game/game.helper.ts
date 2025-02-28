import { Building, BuildingData, BuildingNameType } from "./building.model";

const baseCostMulti = 1.5;

export const ScalingValues = ['wood', 'iron', 'worker'] as const;
export type ScalingTypes = typeof ScalingValues[number];

export const MultiplierValues = ['wood', 'iron', 'worker', 'soldier'] as const;
export type MultiplierTypes = typeof MultiplierValues[number];

export interface GameConfig {
  cost_multi: {
    building: { [key in ScalingTypes]: number }
    hq: { [key in ScalingTypes]: number }
  },
  prod_multi?: {
    [key in MultiplierTypes]: { final: number, percent: number }
  },
  useCostChange: boolean
  costChange: number
};

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

const HqData =   {
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

  const startCopy = start.map(value => ({...value})).sort(sortBuildings);
  let endCopy = end.map(value => ({...value})).sort(sortBuildings);
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