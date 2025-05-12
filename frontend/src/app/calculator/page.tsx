'use client';

import './calculator.scss';
import { Button, Flex, Group, HoverCard, Modal, NumberInput, Popover, Table, Text, Textarea, Tooltip } from "@mantine/core";
import { ReactElement, useEffect, useState, useCallback } from "react";
import { FaArrowLeft, FaArrowRight, FaFileExport, FaFileImport, FaCompressAlt } from "react-icons/fa";
import CalculatorConfigComponent from "./_components/config";
import BuildingsDisplayComponent from './_components/buildingsDisplay';
import BuildTips from './_components/buildTips';
import { Building } from '../../utils/game/building.model';
import { GameConfig, WorldEffectTypes, getBuildOverlap, getTotalCosts, getTotalOutput, isValidConfig, MultiplierTypes, MultiplierValues, ScalingTypes, ScalingValues, StorageTypes, getTotalStorage } from '@/utils/game/game.helper';
import { BuildingData } from '@/utils/game/building.model';

// Types
interface BuildDataStorage {
  currentHq: number;
  currentBuild: Building[];
  goalHq: number;
  goalBuild: Building[];
}

interface ExportData extends BuildDataStorage {
  config: GameConfig | undefined;
}

type ResourceState = { [res in ScalingTypes]: number; };

// Constants
const STORAGE_KEYS = {
  BUILD: 'calculator_build',
  CONFIG: 'calculator_config'
} as const;

const DEFAULT_RESOURCES: ResourceState = {
  wood: 0,
  iron: 0,
  worker: 0
};

// Helper function to calculate world effects from buildings
function getTotalWorldEffects(buildings: Building[]) {
  // Initialize with all world effect types from the imported type
  const totalEffects: { [key in WorldEffectTypes]: number } = {
    attack: 0,
    defense: 0
  };

  buildings.forEach(building => {
    if (!building.type) return;
    const buildingData = BuildingData.find(data => data.name === building.type);

    buildingData?.baseEffects.forEach(effect => {
      if (effect.type === 'world' && 'bonus' in effect && effect.subtype in totalEffects) {
        const bonusEffect = effect.bonus * building.count * building.level;
        totalEffects[effect.subtype as WorldEffectTypes] += bonusEffect;
      }
    });
  });

  return totalEffects;
}

export default function CalculatorPage() {
  // State
  const [config, setConfig] = useState<GameConfig>();
  const [currentResources, setCurrentResources] = useState<ResourceState>(DEFAULT_RESOURCES);
  const [currentHq, setCurrentHq] = useState<number>(5);
  const [currentBuild, setCurrentBuild] = useState<Building[]>([]);
  const [goalHq, setGoalHq] = useState<number>(5);
  const [goalBuild, setGoalBuild] = useState<Building[]>([]);
  const [tickCost, setTickCost] = useState('N/A');
  const [tickBreakdown, setTickBreakdown] = useState<ReactElement | undefined>();
  const [costTable, setCostTable] = useState<ReactElement[]>([]);
  const [currentOutputTable, setCurrentOutputTable] = useState<ReactElement[]>([]);
  const [goalOutputTable, setGoalOutputTable] = useState<ReactElement[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [importError, setImportError] = useState('');

  // Handlers
  const generateOutputTable = (buildings: Building[], config: GameConfig | undefined) => {
    if (!config) return [];

    const output = getTotalOutput(buildings, config);
    const storageTotals = getTotalStorage(buildings, config);
    const worldEffects = getTotalWorldEffects(buildings);

    // Calculate effective soldiers (soldiers with attack/defense bonus)
    const soldierOutput = output.soldiers.final;

    // Apply world effects and config multipliers for attack and defense
    const attackConfig = config.world_multi.attack;
    const defenseConfig = config.world_multi.defense;

    // Calculate base building bonus percentage (from Guard Towers, etc.)
    const attackBuildingBonus = worldEffects.attack;
    const defenseBuildingBonus = worldEffects.defense;

    // Apply the config percentage bonus on top of building bonus
    const totalAttackPercent = attackBuildingBonus + attackConfig.percent;
    const totalDefensePercent = defenseBuildingBonus + defenseConfig.percent;

    // Calculate final effective soldiers with percentage and final multipliers
    const effectiveAttackSoldiers = soldierOutput * (1 + totalAttackPercent / 100) * attackConfig.final;
    const effectiveDefenseSoldiers = soldierOutput * (1 + totalDefensePercent / 100) * defenseConfig.final;

    const updatedOutputTable: ReactElement[] = MultiplierValues.map(value => (
      <Table.Tr key={value}>
        <Table.Td>{`${value[0].toUpperCase()}${value.substring(1)}`}</Table.Td>
        <Table.Td>{output[value].base.toFixed(2)}</Table.Td>
        <Table.Td>{output[value].final.toFixed(2)}</Table.Td>
        <Table.Td>{storageTotals[value as StorageTypes]?.final.toFixed(0)}</Table.Td>
      </Table.Tr>
    ));

    // Add effective soldiers rows
    updatedOutputTable.push(
      <Table.Tr key="effective-attack-soldiers">
        <Table.Td>Effective Attack</Table.Td>
        <Table.Td>{soldierOutput.toFixed(2)}</Table.Td>
        <Table.Td>{effectiveAttackSoldiers.toFixed(2)}</Table.Td>
        <Table.Td></Table.Td>
      </Table.Tr>
    );

    updatedOutputTable.push(
      <Table.Tr key="effective-defense-soldiers">
        <Table.Td>Effective Defense</Table.Td>
        <Table.Td>{soldierOutput.toFixed(2)}</Table.Td>
        <Table.Td>{effectiveDefenseSoldiers.toFixed(2)}</Table.Td>
        <Table.Td></Table.Td>
      </Table.Tr>
    );

    return updatedOutputTable;
  }

  const setCurrentResource = useCallback((resource: ScalingTypes, value: number) => {
    setCurrentResources(prev => ({
      ...prev,
      [resource]: value
    }));
  }, []);

  const handleSwapBuildings = useCallback((direction: 'forward' | 'backward') => {
    if (direction === 'forward') {
      setGoalBuild([...currentBuild]);
      setGoalHq(currentHq);
    } else {
      setCurrentBuild([...goalBuild]);
      setCurrentHq(goalHq);
    }
  }, [currentBuild, currentHq, goalBuild, goalHq]);

  // Function to condense buildings with the same type and level
  const condenseBuildings = useCallback((buildings: Building[]): Building[] => {
    // Group buildings by type and level
    const grouped: Record<string, Building> = {};

    buildings.forEach(building => {
      if (!building.type) return; // Skip buildings with no type

      const key = `${building.type}-${building.level}`;

      if (grouped[key]) {
        // If this type+level combination already exists, add the count
        grouped[key].count += building.count;
      } else {
        // Create a new entry for this type+level combination
        grouped[key] = { ...building };
      }
    });

    // Convert back to array and assign new IDs
    return Object.values(grouped).map((building, index) => ({
      ...building,
      id: index + 1
    }));
  }, []);

  const handleCondenseCurrentBuildings = useCallback(() => {
    setCurrentBuild(condenseBuildings(currentBuild));
  }, [currentBuild, condenseBuildings]);

  const handleCondenseGoalBuildings = useCallback(() => {
    setGoalBuild(condenseBuildings(goalBuild));
  }, [goalBuild, condenseBuildings]);

  // Import/Export handlers
  const handleExport = useCallback(() => {
    const exportData: ExportData = {
      currentHq,
      currentBuild,
      goalHq,
      goalBuild,
      config
    };
    const exportString = JSON.stringify(exportData, null, 2);
    setExportText(exportString);
    navigator.clipboard.writeText(exportString).catch(console.error);
    setExportModalOpen(true);
  }, [currentHq, currentBuild, goalHq, goalBuild, config]);

  const handleImport = useCallback(() => {
    try {
      const importData = JSON.parse(importText) as ExportData;

      if (typeof importData.goalBuild === 'undefined') {
        importData.goalBuild = goalBuild;
        importData.goalHq = goalHq;
      }

      if (!importData.currentHq || !importData.currentBuild || !importData.goalHq || !importData.goalBuild) {
        throw new Error('Invalid import data: missing required fields');
      }

      setCurrentHq(importData.currentHq);
      setCurrentBuild(importData.currentBuild);
      setGoalHq(importData.goalHq);
      setGoalBuild(importData.goalBuild);

      if (importData.config && isValidConfig(importData.config)) {
        setConfig(importData.config);
      }

      setImportError('');
      setImportModalOpen(false);
      setImportText('');
    } catch {
      setImportError('Invalid import data. Please check the format and try again.');
    }
  }, [importText]);

  // Local Storage
  useEffect(() => {
    const loadStoredData = () => {
      const buildData = localStorage.getItem(STORAGE_KEYS.BUILD);
      const configData = localStorage.getItem(STORAGE_KEYS.CONFIG);

      if (buildData) {
        try {
          const parsedBuild = JSON.parse(buildData) as BuildDataStorage;

          setCurrentHq(parsedBuild.currentHq);
          setCurrentBuild(parsedBuild.currentBuild);
          setGoalHq(parsedBuild.goalHq);
          setGoalBuild(parsedBuild.goalBuild);
        } catch (e) {
          console.error('Error loading build data:', e);
          localStorage.removeItem(STORAGE_KEYS.BUILD);
        }
      }

      if (configData) {
        try {
          const parsedConfig = JSON.parse(configData) as GameConfig;
          if (isValidConfig(parsedConfig)) {
            setConfig(parsedConfig);
          } else {
            localStorage.removeItem(STORAGE_KEYS.CONFIG);
          }
        } catch (e) {
          console.error('Error loading config data:', e);
          localStorage.removeItem(STORAGE_KEYS.CONFIG);
        }
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    if (currentHq && currentBuild && goalHq && goalBuild) {
      const storageBuild: BuildDataStorage = {
        currentHq,
        currentBuild,
        goalHq,
        goalBuild
      };
      localStorage.setItem(STORAGE_KEYS.BUILD, JSON.stringify(storageBuild));
    }
  }, [currentHq, currentBuild, goalHq, goalBuild]);

  useEffect(() => {
    if (config) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }
  }, [config]);

  // Calculations
  useEffect(() => {
    if (!config) return;

    const goalCosts = getTotalCosts(goalHq, goalBuild, config);
    const usableBuildings = getBuildOverlap(currentBuild, goalBuild);
    const useableCosts = getTotalCosts(Math.min(currentHq, goalHq), usableBuildings, config);

    // Update cost table
    const updatedCostTable: ReactElement[] = ScalingValues.map(value => {
      const cost = goalCosts[value] - useableCosts[value];
      return (
        <Table.Tr key={value}>
          <Table.Td>{`${value[0].toUpperCase()}${value.substring(1)}`}:</Table.Td>
          <Table.Td>
            <NumberInput
              style={{ width: '120px', marginLeft: 'auto' }}
              value={currentResources[value]}
              onValueChange={(v) => setCurrentResource(value, v.floatValue || 0)}
              allowNegative={false}
            />
          </Table.Td>
          <Table.Td>{cost}</Table.Td>
        </Table.Tr>
      );
    });
    setCostTable(updatedCostTable);

    // Calculate tick costs
    const currentOutput = getTotalOutput(currentBuild, config);
    const calculateTicks = (resource: ScalingTypes) => {
      const resourceKey = resource === 'worker' ? 'workers' : resource as MultiplierTypes;
      const cost = goalCosts[resource] - useableCosts[resource] - currentResources[resource];
      const output = currentOutput[resourceKey].final;
      return Math.ceil((cost / output) || 0);
    };

    const woodTicks = calculateTicks('wood');
    const ironTicks = calculateTicks('iron');
    const workersTicks = calculateTicks('worker');

    setTickCost(Math.max(woodTicks, ironTicks, workersTicks, 0).toFixed());
    setTickBreakdown(
      <div>
        <Text size='sm'>Wood: {Math.max(woodTicks, 0)}</Text>
        <Text size='sm'>Iron: {Math.max(ironTicks, 0)}</Text>
        <Text size='sm'>Workers: {Math.max(workersTicks, 0)}</Text>
      </div>
    );
  }, [goalHq, goalBuild, currentHq, currentBuild, config, currentResources, setCurrentResource]);

  useEffect(() => {
    setGoalOutputTable(generateOutputTable(goalBuild, config));
  }, [goalBuild, config]);

  useEffect(() => {
    setCurrentOutputTable(generateOutputTable(currentBuild, config));
  }, [currentBuild, config]);

  // Render
  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <Group>
          <Popover trapFocus closeOnClickOutside={false}>
            <Popover.Target>
              <Button>Change Config</Button>
            </Popover.Target>
            <Popover.Dropdown className="config-popover">
              <CalculatorConfigComponent config={config} setConfig={setConfig} />
            </Popover.Dropdown>
          </Popover>
          <Button onClick={() => setImportModalOpen(true)} leftSection={<FaFileImport />}>
            Import
          </Button>
          <Button onClick={handleExport} leftSection={<FaFileExport />}>
            Export
          </Button>
        </Group>
      </div>

      <Flex gap='xs'>
        <div style={{ flexGrow: '1' }}>
          <Flex justify="space-between" align="center">
            <p className='title'>Current</p>
            <Tooltip label="Combine buildings of the same type and level">
              <Button size="xs" onClick={handleCondenseCurrentBuildings} leftSection={<FaCompressAlt />}>
                Condense
              </Button>
            </Tooltip>
          </Flex>
          <BuildingsDisplayComponent
            buildings={currentBuild}
            setBuildings={setCurrentBuild}
            hq={currentHq}
            setHq={setCurrentHq}
          />
        </div>
        <Flex
          className='controls'
          style={{ justifyContent: 'center' }}
          direction={'column'}
          gap='md'
        >
          <Button onClick={() => handleSwapBuildings('forward')}>
            <FaArrowRight />
          </Button>
          <Button onClick={() => handleSwapBuildings('backward')}>
            <FaArrowLeft />
          </Button>
        </Flex>
        <div style={{ flexGrow: '1' }}>
          <Flex justify="space-between" align="center">
            <p className='title'>Goal</p>
            <Tooltip label="Combine buildings of the same type and level">
              <Button size="xs" onClick={handleCondenseGoalBuildings} leftSection={<FaCompressAlt />}>
                Condense
              </Button>
            </Tooltip>
          </Flex>
          <BuildingsDisplayComponent
            buildings={goalBuild}
            setBuildings={setGoalBuild}
            hq={goalHq}
            setHq={setGoalHq}
          />
        </div>
      </Flex>

      <p className='title'>Totals</p>
      <Flex>
      <div className='current outputs'>
          <p className='title'>Current Output</p>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Td></Table.Td>
                <Table.Td>Base</Table.Td>
                <Table.Td>Total</Table.Td>
                <Table.Td>Storage</Table.Td>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{currentOutputTable}</Table.Tbody>
          </Table>
        </div>
        <div className='goal outputs'>
          <p className='title'>Goal Output</p>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Td></Table.Td>
                <Table.Td>Base</Table.Td>
                <Table.Td>Total</Table.Td>
                <Table.Td>Storage</Table.Td>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{goalOutputTable}</Table.Tbody>
          </Table>
        </div>
      </Flex>

      <div className='costs'>
        <p className='title'>Cost</p>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Td></Table.Td>
              <Table.Td>Current</Table.Td>
              <Table.Td>Needed</Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {costTable}
            <Table.Tr>
              <Table.Td>Ticks:</Table.Td>
              <Table.Td></Table.Td>
              <Table.Td>
                <Group justify="right">
                  <HoverCard width={280} shadow="md" disabled={!tickBreakdown}>
                    <HoverCard.Target>
                      <Text size='sm' style={{ textDecoration: 'underline dotted' }}>{tickCost}</Text>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      {tickBreakdown}
                    </HoverCard.Dropdown>
                  </HoverCard>
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </div>

      <BuildTips
        currentBuild={currentBuild}
        goalBuild={goalBuild}
        currentHq={currentHq}
        goalHq={goalHq}
        currentResources={currentResources}
        config={config}
      />

      <Modal
        opened={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportError('');
          setImportText('');
        }}
        title="Import Configuration"
        size="70%"
        styles={{
          content: {
            minHeight: '50vh',
            resize: 'both',
            overflow: 'auto'
          },
          header: {
            background: 'var(--orange-700)'
          },
          body: {
            height: 'calc(100% - 60px)', // Account for header
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Flex direction="column" gap="md" style={{ flex: 1 }}>
          <Textarea
            placeholder="Paste your configuration here..."
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
            error={importError}
            styles={{
              root: { flex: 1, display: 'flex', flexDirection: 'column' },
              wrapper: { flex: 1 },
              input: { height: 'fit-content', resize: 'vertical' }
            }}
          />
          <Group justify="flex-end">
            <Button onClick={handleImport}>Import</Button>
          </Group>
        </Flex>
      </Modal>

      <Modal
        opened={exportModalOpen}
        onClose={() => {
          setExportModalOpen(false);
          setExportText('');
        }}
        title="Export Configuration"
        size="70%"
        styles={{
          content: {
            minHeight: '50vh',
            resize: 'both',
            overflow: 'auto'
          },
          header: {
            background: 'var(--orange-700)'
          },
          body: {
            height: 'calc(100% - 60px)', // Account for header
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Flex direction="column" gap="md" style={{ flex: 1 }}>
          <Text size="sm" c="dimmed">Configuration has been copied to clipboard</Text>
          <Textarea
            value={exportText}
            readOnly
            styles={{
              root: { flex: 1, display: 'flex', flexDirection: 'column' },
              wrapper: { flex: 1 },
              input: { height: 'fit-content', resize: 'vertical' }
            }}
          />
        </Flex>
      </Modal>
    </div>
  );
}