'use client';

import GameFilter from "@/components/general/gameFilter";
import { fetchBackend } from "@/utils/api.helper";
import { Flex, Table, TableData } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const baseCostMulti = 1.5;

interface GameConfig {
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
  const [config, setConfig] = useState<GameConfig>();

  const [paramTable, setParamTable] = useState<TableData>();

  useEffect(() => {
    if (gameId) {
      setConfig(undefined);

      fetchBackend('/report/games/config', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setConfig(data);
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

    if (config?.misc?.parameters) {
      const params = config.misc.parameters;

      paramsTableBase.body = [
        [
          'HQ',
          params.hq_wood_cost_multiplier * baseCostMulti,
          params.hq_iron_cost_multiplier * baseCostMulti,
          params.hq_worker_cost_multiplier * baseCostMulti
        ],
        [
          'Building',
          params.building_wood_cost_multiplier * baseCostMulti,
          params.building_iron_cost_multiplier * baseCostMulti,
          params.building_worker_cost_multiplier * baseCostMulti
        ]
      ];
    }

    setParamTable(paramsTableBase);
  }, [config]);

  return <div>
    <GameFilter gameId={gameId} setGameId={setGameId} />
    <Flex>
      <Table data={paramTable} />
    </Flex>
  </div>
}