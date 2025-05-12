'use client';

import GameFilter from "@/components/general/gameFilter";
import { fetchBackend } from "@/utils/api.helper";
import { BuildingNames, BuildingNameType } from "@/utils/game/building.model";
import { GameConfig, getBuildingCost, getHqCost, defaultConfig } from "@/utils/game/game.helper";
import { Flex, NumberInput, Select, Table, TableData } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const baseCostMulti = 1.5;

interface ApiGameConfig {
  misc: {
    parameters: {
      building_iron_cost_multiplier: number,
      building_wood_cost_multiplier: number,
      building_worker_cost_multiplier: number,
      hq_iron_cost_multiplier: number,
      hq_wood_cost_multiplier: number,
      hq_worker_cost_multiplier: number
    },
  }
}

export default function ConfigPage() {
  const queryParams = useSearchParams();

  const [gameId, setGameId] = useState(queryParams.get('gameId') || '');
  const [apiConfig, setApiConfig] = useState<ApiGameConfig>();
  const [type, setType] = useState<BuildingNameType>();
  const [maxLevel, setMaxLevel] = useState(15);

  const [paramTable, setParamTable] = useState<TableData>();
  const [costTable, setCostTable] = useState<TableData>();
  const [hqCostTable, setHqCostTable] = useState<TableData>();

  useEffect(() => {
    if (gameId) {
      setApiConfig(undefined);

      fetchBackend('report/games/config', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setApiConfig(data);
        });
    }
  }, [gameId]);

  useEffect(() => {
    const paramsTableBase: TableData = {
      caption: 'Per level resource multipliers',
      head: ['Type', 'Wood', 'Iron', 'Worker'],
      body: [
        [
          'HQ',
          baseCostMulti,
          baseCostMulti,
          baseCostMulti
        ],
        [
          'Building',
          baseCostMulti,
          baseCostMulti,
          baseCostMulti
        ]
      ]
    };

    if (apiConfig?.misc?.parameters) {
      const params = apiConfig.misc.parameters;

      paramsTableBase.body = [
        [
          'HQ',
          (params.hq_wood_cost_multiplier * baseCostMulti).toFixed(4),
          (params.hq_iron_cost_multiplier * baseCostMulti).toFixed(4),
          (params.hq_worker_cost_multiplier * baseCostMulti).toFixed(4)
        ],
        [
          'Building',
          (params.building_wood_cost_multiplier * baseCostMulti).toFixed(4),
          (params.building_iron_cost_multiplier * baseCostMulti).toFixed(4),
          (params.building_worker_cost_multiplier * baseCostMulti).toFixed(4)
        ]
      ];
    }

    setParamTable(paramsTableBase);
  }, [apiConfig]);

  useEffect(() => {
    const costsTableBase: TableData = {
      head: ['Level', 'Wood', 'Iron', 'Worker'],
      body: []
    };

    const hqCostsTableBase: TableData = {
      head: ['Level', 'Wood', 'Iron', 'Worker'],
      body: []
    };

    const params = apiConfig?.misc?.parameters;
    const gameConfig: GameConfig = {
      cost_multi: {
        building: {
          wood: params?.building_wood_cost_multiplier || 1,
          iron: params?.building_iron_cost_multiplier || 1,
          worker: params?.building_worker_cost_multiplier || 1
        },
        hq: {
          wood: params?.hq_wood_cost_multiplier || 1,
          iron: params?.hq_iron_cost_multiplier || 1,
          worker: params?.hq_worker_cost_multiplier || 1
        }
      },
      prod_multi: defaultConfig.prod_multi,
      storage_multi: defaultConfig.prod_multi,
      world_multi: defaultConfig.world_multi,
      useCostChange: false,
      costChange: 0
    };

    if (type) {
      for (let level = 1; level <= maxLevel; level++) {
        const cost = getBuildingCost(type, level, gameConfig);

        costsTableBase.body!.push([
          level,
          cost.wood,
          cost.iron,
          cost.worker
        ]);
      }
    }
    setCostTable(costsTableBase);

    for (let level = 1; level <= maxLevel; level++) {
      const cost = getHqCost(level, gameConfig);

      hqCostsTableBase.body!.push([
        level,
        cost.wood,
        cost.iron,
        cost.worker
      ]);
    }

    setHqCostTable(hqCostsTableBase);
  }, [apiConfig, type, maxLevel]);

  return <div>
    <GameFilter gameId={gameId} setGameId={setGameId} />
    <Flex>
      <Table
        data={paramTable}
        style={{ width: '50%', height: 'fit-content' }} />
      <div
        className="costs"
        style={{ width: '100%' }}>
        <Flex
          gap='xl'>
          <p style={{ textAlign: 'center', alignContent: 'end', width: '230px'}}>HQ</p>
          <NumberInput
            style={{ width: '70px' }}
            label='Count'
            value={maxLevel}
            onChange={v => setMaxLevel(+v)}
            min={5} />
          <Select
            style={{ width: 'fit-content' }}
            label='Building'
            value={type}
            onChange={v => setType(v as BuildingNameType)}
            data={BuildingNames}
            comboboxProps={{ styles: { options: { color: 'black' } } }} />
        </Flex>

        <Flex gap='xl'>
          <Table withTableBorder withColumnBorders
            data={hqCostTable}
            style={{ textAlign: 'right', width: 'fit-content' }} />
          <Table withTableBorder withColumnBorders
            data={costTable}
            style={{ textAlign: 'right', width: 'fit-content' }} />
        </Flex>
      </div>
    </Flex>
  </div>
}