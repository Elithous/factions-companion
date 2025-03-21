"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { fetchBackend } from "@/utils/api.helper";
import GameFilter from "@/components/general/gameFilter";
import { Button, Checkbox, Flex, NumberInput, Slider, Table } from "@mantine/core";
import { GameConfig, MultiplierValues, ScalingValues, defaultConfig } from '@/utils/game/game.helper';

export default function CalculatorConfigComponent(props: { config?: GameConfig, setConfig: Dispatch<SetStateAction<GameConfig | undefined>> }) {
  const [gameId, setGameId] = useState('');
  const [localConfig, setLocalConfig] = useState<GameConfig>(props.config ? { ...props.config } : defaultConfig);

  const [useCostChange, setUseCostChange] = useState(props?.config?.useCostChange || false);
  const [costChange, setCostChange] = useState<number>(props?.config?.costChange || 0.92);

  const [scaleRows, setScaleRows] = useState<React.JSX.Element[]>();
  const [multiRows, setMultiRows] = useState<React.JSX.Element[]>();

  const saveConfig = () => {
    const updateConfig = {
      ...localConfig,
      useCostChange,
      costChange
    };
    props.setConfig(updateConfig);
  };

  const resetConfig = () => {
    setLocalConfig(defaultConfig);
    props.setConfig(defaultConfig);

    setCostChange(0.92);
    setUseCostChange(false);
  }

  // Save config before unmounting
  useEffect(() => {
    console.log('Saved');
    saveConfig();
  }, [localConfig, useCostChange, costChange]);

  useEffect(() => {
    if (gameId) {
      fetchBackend('report/games/config', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          const params = data.misc.parameters;
          const gameConfig: GameConfig = {
            cost_multi: {
              building: {
                wood: params.building_wood_cost_multiplier,
                iron: params.building_iron_cost_multiplier,
                worker: params.building_worker_cost_multiplier
              },
              hq: {
                wood: params.hq_wood_cost_multiplier,
                iron: params.hq_iron_cost_multiplier,
                worker: params.hq_worker_cost_multiplier
              }
            },
            prod_multi: localConfig.prod_multi ?? defaultConfig.prod_multi,
            useCostChange: localConfig.useCostChange,
            costChange: localConfig.costChange
          }
          setLocalConfig(gameConfig);
        });
    }
  }, [gameId]);

  useEffect(() => {
    setScaleRows(ScalingValues
      .map(type => {
        const hqScaling = localConfig.cost_multi?.hq?.[type] || 1;
        const buildingScaling = localConfig.cost_multi?.building?.[type] || 1;

        return <Table.Tr key={`${type}-scale`}>
          <Table.Td>{`${type[0].toUpperCase()}${type.substring(1)}`}</Table.Td>
          <Table.Td>
            <NumberInput
              style={{ width: '70px' }}
              value={hqScaling}
              onValueChange={(e) => {
                localConfig.cost_multi.hq[type] = e.floatValue || 1;
                setLocalConfig(structuredClone(localConfig));
              }}
              decimalScale={4}
              fixedDecimalScale
              hideControls
            />
          </Table.Td>
          <Table.Td>
            <NumberInput
              style={{ width: '70px' }}
              value={buildingScaling}
              onValueChange={(e) => {
                localConfig.cost_multi.building[type] = e.floatValue || 1;
                setLocalConfig(structuredClone(localConfig));
              }}
              decimalScale={4}
              fixedDecimalScale
              hideControls
            />
          </Table.Td>
        </Table.Tr>
      }));
  }, [localConfig])

  useEffect(() => {
    setMultiRows(MultiplierValues
      .map(type => {
        const multis = localConfig.prod_multi?.[type] || defaultConfig.prod_multi![type];
        return <Table.Tr key={`${type}-multi`}>
          <Table.Td>{`${type[0].toUpperCase()}${type.substring(1)}`}</Table.Td>
          <Table.Td>
            <NumberInput
              value={multis.percent}
              onValueChange={(e) => {
                localConfig.prod_multi![type].percent = e.floatValue || 0;
                setLocalConfig(structuredClone(localConfig));
              }}
              style={{ width: '70px' }}
              decimalScale={1}
              fixedDecimalScale
              hideControls
            />
          </Table.Td>
          <Table.Td>
            <NumberInput
              value={multis.final}
              onValueChange={(e) => {
                localConfig.prod_multi![type].final = e.floatValue || 1;
                setLocalConfig(structuredClone(localConfig));
              }}
              style={{ width: '70px' }}
              decimalScale={2}
              fixedDecimalScale
              hideControls
            />
          </Table.Td>
        </Table.Tr>
      }));
  }, [localConfig]);

  return (
    <div className='calc-config' suppressHydrationWarning>
      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px' }}>Level Scaling</p>
      <Flex>
        <p style={{ paddingRight: '10px' }}>Set from Game:</p>
        <GameFilter gameId={gameId} setGameId={setGameId} />
      </Flex>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>HQ</Table.Th>
            <Table.Th>Building</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{scaleRows}</Table.Tbody>
      </Table>
      <Checkbox
        checked={useCostChange}
        label='Simulate cost change'
        onChange={(e) => setUseCostChange(e.currentTarget.checked)} />
      <Slider
        disabled={!useCostChange}
        style={{ marginBottom: '20px' }}
        label={(value) => `${(value * 100).toPrecision(4)}%`}
        value={costChange}
        onChange={setCostChange}
        step={0.00001}
        min={0.92}
        max={0.98}
        marks={[{ value: 0.92, label: '92%' }, { value: 0.98, label: '98%' }]}
      />


      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px' }}>Stat Multis</p>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>+%</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>X</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{multiRows}</Table.Tbody>
      </Table>

      <Flex>
        <Button onClick={saveConfig} hidden>Save</Button>
        <Button variant='default' onClick={resetConfig}>Reset</Button>
      </Flex>
    </div>
  )
};