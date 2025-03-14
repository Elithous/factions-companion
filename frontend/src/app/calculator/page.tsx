'use client';

import './calculator.scss';
import { Button, Flex, Popover, Table } from "@mantine/core";
import { ReactElement, useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CalculatorConfigComponent from "./_components/config";
import BuildingsDisplayComponent from './_components/buildingsDisplay';
import { Building } from '../../utils/game/building.model';
import { GameConfig, getBuildOverlap, getTotalCosts, getTotalOutput, isValidConfig, MultiplierValues, ScalingValues } from '@/utils/game/game.helper';

interface BuildDataStorage {
  currentHq: number;
  currentBuild: Building[];
  goalHq: number;
  goalBuild: Building[];
}

export default function CalculatorPage() {
  const [config, setConfig] = useState<GameConfig>();
  const [currentHq, setCurrentHq] = useState<number>(5);
  const [currentBuild, setCurrentBuild] = useState<Building[]>([]);
  const [goalHq, setGoalHq] = useState<number>(5);
  const [goalBuild, setGoalBuild] = useState<Building[]>([]);

  const [tickCost, setTickCost] = useState('N/A');

  const [costTable, setCostTable] = useState<ReactElement[]>([]);
  const [outputTable, setOutputTable] = useState<ReactElement[]>([]);

  // Load build data from localstorage
  useEffect(() => {
    const buildData = localStorage.getItem('calculator_build');
    const configData = localStorage.getItem('calculator_config');

    if (buildData) {
      try {
        const parsedBuild = JSON.parse(buildData) as BuildDataStorage;

        setCurrentHq(parsedBuild.currentHq);
        setCurrentBuild(parsedBuild.currentBuild);
        setGoalHq(parsedBuild.goalHq);
        setGoalBuild(parsedBuild.goalBuild);
      }
      catch (e) {
        console.error('Error caught, clearing storage: ', e)
        localStorage.removeItem('calculator_build');
      }
    }

    if (configData) {
      try {
        const parsedConfig = JSON.parse(configData) as GameConfig;

        // Deep verify config data is set correctly
        if (!isValidConfig(parsedConfig)) {
          localStorage.removeItem('calculator_config');
        }
        else {
          setConfig(parsedConfig);
        }
      }
      catch (e) {
        console.error('Error caught, clearing storage: ', e)
        localStorage.removeItem('calculator_config');
      }
    }
  }, []);

  // Save build data to localstorage
  useEffect(() => {
    if (currentHq && currentBuild && goalHq && goalBuild) {
      const storageBuild: BuildDataStorage = {
        currentHq,
        currentBuild,
        goalHq,
        goalBuild
      };

      localStorage.setItem('calculator_build', JSON.stringify(storageBuild));
    }
  }, [currentHq, currentBuild, goalHq, goalBuild]);

  useEffect(() => {
    if (config) {
      localStorage.setItem('calculator_config', JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    const goalCosts = getTotalCosts(goalHq, goalBuild, config);
    const usableBuildings = getBuildOverlap(currentBuild, goalBuild);

    const useableCosts = getTotalCosts(Math.min(currentHq, goalHq), usableBuildings, config);

    const updatedCostTable: ReactElement[] = [];
    ScalingValues.forEach(value => {
      const cost = goalCosts[value] - useableCosts[value];
      updatedCostTable.push((
        <Table.Tr key={value}>
          <Table.Td>{`${value[0].toUpperCase()}${value.substring(1)}`}:</Table.Td>
          <Table.Td>{cost}</Table.Td>
        </Table.Tr>
      ));
    });
    setCostTable(updatedCostTable);

    // Calculate tick cost based on total cost and current output
    const currentOutput = getTotalOutput(currentBuild, config);

    const woodTicks = ((goalCosts.wood - useableCosts.wood) / currentOutput.wood.final) || 0;
    const ironTicks = ((goalCosts.iron - useableCosts.iron) / currentOutput.iron.final) || 0;
    const workersTicks = ((goalCosts.worker - useableCosts.worker) / currentOutput.workers.final) || 0;

    setTickCost(Math.max(woodTicks, ironTicks, workersTicks).toFixed());
  }, [goalHq, goalBuild, currentHq, currentBuild, config]);

  useEffect(() => {
    const goalOutput = getTotalOutput(goalBuild, config);

    const updatedOutputTable: ReactElement[] = [];
    MultiplierValues.forEach(value => {
      updatedOutputTable.push((
        <Table.Tr key={value}>
          <Table.Td>{`${value[0].toUpperCase()}${value.substring(1)}`}</Table.Td>
          <Table.Td>{goalOutput[value].base.toFixed(2)}</Table.Td>
          <Table.Td>{goalOutput[value].final.toFixed(2)}</Table.Td>
        </Table.Tr>
      ));
    });
    setOutputTable(updatedOutputTable);
  }, [goalBuild, config]);

  return <div>
    <Popover>
      <Popover.Target>
        <Button>Change Config</Button>
      </Popover.Target>
      <Popover.Dropdown className="config-popover">
        <CalculatorConfigComponent config={config} setConfig={setConfig} />
      </Popover.Dropdown>
    </Popover>

    <Flex gap='xs'>
      <div style={{ flexGrow: '1' }}>
        <p className='title'>Current</p>
        <BuildingsDisplayComponent buildings={currentBuild} setBuildings={setCurrentBuild}
          hq={currentHq} setHq={setCurrentHq} />
      </div>
      <Flex
        className='controls'
        style={{ justifyContent: 'center' }}
        direction={'column'}
        gap='md'
      >
        <Button onClick={() => { setGoalBuild(currentBuild); setGoalHq(currentHq); }}>
          <FaArrowRight />
        </Button>
        <Button onClick={() => { setCurrentBuild(goalBuild); setCurrentHq(goalHq); }}>
          <FaArrowLeft />
        </Button>
      </Flex>
      <div style={{ flexGrow: '1' }}>
        <p className='title'>Goal</p>
        <BuildingsDisplayComponent buildings={goalBuild} setBuildings={setGoalBuild}
          hq={goalHq} setHq={setGoalHq} />
      </div>
    </Flex>
    <p className='title'>Totals</p>
    <Flex>
      <div className='costs'>
        <p className='title'>Cost</p>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Td></Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {costTable}
            <Table.Tr>
              <Table.Td>Ticks:</Table.Td>
              <Table.Td>{tickCost}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </div>
      <div className='outputs'>
        <p className='title'>Output</p>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Td></Table.Td>
              <Table.Td>Base</Table.Td>
              <Table.Td>Total</Table.Td>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{outputTable}</Table.Tbody>
        </Table>
      </div>
    </Flex>
  </div>
}