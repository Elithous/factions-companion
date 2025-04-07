import { Building, BuildingData } from "@/utils/game/building.model";
import { GameConfig, getBuildingCost, getBuildOverlap, getTotalCosts, getTotalOutput, MultiplierTypes, ScalingTypes } from "@/utils/game/game.helper";
import { Table, Text } from "@mantine/core";
import { ReactElement, useMemo } from "react";

interface BuildTipsProps {
  currentBuild: Building[];
  goalBuild: Building[];
  currentHq: number;
  goalHq: number;
  currentResources: { [key in ScalingTypes]: number };
  config: GameConfig | undefined;
}

export default function BuildTips({ currentBuild, goalBuild, currentHq, goalHq, currentResources, config }: BuildTipsProps) {
  const tips = useMemo(() => {
    if (!config) return [];

    const goalCosts = getTotalCosts(goalHq, goalBuild, config);

    const tips: ReactElement[] = [];

    // Calculate base ticks needed
    const calculateTicksToGoalBuild = (build: Building[], hqLevel: number, upgradeCost?: { [key in ScalingTypes]: number }) => {
      const usableBuildings = getBuildOverlap(build, goalBuild);
      const useableCosts = getTotalCosts(Math.min(hqLevel, goalHq), usableBuildings, config);

      const output = getTotalOutput(build, config);
      const ticks: { [key in ScalingTypes]: number } = {
        wood: 0,
        iron: 0,
        worker: 0
      };

      Object.keys(ticks).forEach(resource => {
        const resourceKey = resource === 'worker' ? 'workers' : resource as MultiplierTypes;
        const cost = goalCosts[resource as ScalingTypes] - useableCosts[resource as ScalingTypes] - currentResources[resource as ScalingTypes];
        // If there's an upgrade cost, subtract it from the current resources
        const adjustedCost = upgradeCost ? cost + upgradeCost[resource as ScalingTypes] : cost;
        const resourceOutput = output[resourceKey].final;
        ticks[resource as ScalingTypes] = Math.ceil((adjustedCost / resourceOutput) || 0);
      });

      return ticks;
    };

    const baseTicks = calculateTicksToGoalBuild(currentBuild, currentHq);

    // Analyze each building in the current build
    currentBuild.forEach(currentBuilding => {
      if (!currentBuilding.type) return;

      const buildingData = BuildingData.find(data => data.name === currentBuilding.type);
      if (!buildingData) return;

      // Create a test build with this building upgraded
      const testBuild: Building[] = JSON.parse(JSON.stringify(currentBuild));
      const testBuilding = testBuild.find((b: Building) => b.id === currentBuilding.id);
      if (!testBuilding) return;

      // Try upgrading the building by 1 level
      testBuilding.level += 1;

      // Calculate the cost of upgrading
      const upgradeCost = getBuildingCost(currentBuilding.type, currentBuilding.level + 1, config);
      const totalUpgradeCost: { [key in ScalingTypes]: number } = {
        wood: upgradeCost.wood * currentBuilding.count,
        iron: upgradeCost.iron * currentBuilding.count,
        worker: upgradeCost.worker * currentBuilding.count
      };

      // Calculate ticks with the test build, accounting for upgrade cost
      const testTicks = calculateTicksToGoalBuild(testBuild, currentHq, totalUpgradeCost);

      // Calculate the impact on ticks
      const tickImpact: { [key in ScalingTypes]: number } = {
        wood: testTicks.wood - baseTicks.wood,
        iron: testTicks.iron - baseTicks.iron,
        worker: testTicks.worker - baseTicks.worker
      };

      // Create tip element
      tips.push(
        <Table.Tr key={currentBuilding.id}>
          <Table.Td>
            <Text fw={700}>{currentBuilding.type}</Text>
            <Text size="sm">Level: {currentBuilding.level} → {currentBuilding.level + 1}</Text>
            <Text size="sm">Count: {currentBuilding.count}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">Cost Impact:</Text>
            <Text size="sm">Wood: {totalUpgradeCost.wood}</Text>
            <Text size="sm">Iron: {totalUpgradeCost.iron}</Text>
            <Text size="sm">Workers: {totalUpgradeCost.worker}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">Tick Impact:</Text>
            <Text size="sm" c={tickImpact.wood > 0 ? 'red' : 'green'}>
              Wood: {tickImpact.wood > 0 ? '+' : ''}{tickImpact.wood}
            </Text>
            <Text size="sm" c={tickImpact.iron > 0 ? 'red' : 'green'}>
              Iron: {tickImpact.iron > 0 ? '+' : ''}{tickImpact.iron}
            </Text>
            <Text size="sm" c={tickImpact.worker > 0 ? 'red' : 'green'}>
              Workers: {tickImpact.worker > 0 ? '+' : ''}{tickImpact.worker}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    });

    return tips;
  }, [currentBuild, goalBuild, currentHq, goalHq, currentResources, config]);

  if (!tips.length) return null;

  return (
    <div className="build-tips">
      <Text fw={700} size="lg" mb="md">Build Tips</Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Building</Table.Th>
            <Table.Th>Cost Impact</Table.Th>
            <Table.Th>Tick Impact</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{tips}</Table.Tbody>
      </Table>
    </div>
  );
} 