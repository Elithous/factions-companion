"use client";

import './stats.css';

import MapComponent from "@/components/map/map";
import MapModel from "@/components/map/map.model";
import StatsComponent from '@/components/stats/stats';
import { fetchBackend } from '@/utils/api.helper';
import { useEffect, useState } from 'react';

export interface StatsFilter {
  gameId: string,
  tile: { x: number, y: number },
  playerName: string
}

export interface ToFromFaction {
  [fromFaction: string]: {
    [toFaction: string]: number
  }
}

export interface StatsData {
  total: ToFromFaction,
  filtered: ToFromFaction
}

export default function StatsPage() {
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [gameIds, setGameIds] = useState([] as string[]);
  const [filter, setFilter] = useState({} as StatsFilter);
  const [player, setPlayer] = useState('');
  const [totalData, setTotalData] = useState({} as ToFromFaction);
  const [filteredData, setFilteredData] = useState({} as ToFromFaction);

  const updateFilter = (rule: Partial<StatsFilter>) => setFilter({ ...filter, ...rule });
  // Use effect to allow a user to stop typing before the name is searched
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateFilter({ playerName: player });
    }, 1500)

    return () => clearTimeout(delayDebounceFn)
  }, [player])

  useEffect(() => {
    fetchBackend('/websocket/parse', undefined, { method: 'POST' });
    fetchBackend('/report/games')
      .then((resp) => resp.json())
      .then((data) => {
        setGameIds(data);
        setOptionsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (filter.gameId) {
      setTotalData({});
      fetchBackend('/report/soldiers', { gameId: filter.gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setTotalData(data);
        });
    }
  }, [filter.gameId]);

  useEffect(() => {
    if (filter.gameId) {
      setFilteredData({});
      const params: {
        gameId?: string,
        tileX?: string,
        tileY?: string,
        playerName?: string
      } = { gameId: filter.gameId };

      if (filter?.tile?.x && filter?.tile?.y) {
        params.tileX = filter.tile.x.toString();
        params.tileY = filter.tile.y.toString();
      }
      if (filter?.playerName) {
        params.playerName = filter.playerName;
      }

      fetchBackend('/report/soldiers', params)
        .then((resp) => resp.json())
        .then((data) => {
          setFilteredData(data);
        });
    }
  }, [filter]);

  const mapModel: MapModel = {
    dimensions: { x: 50, y: 50 },
    imageUrl: '',
    tiles: []
  };

  const onTileClicked = async (x: number, y: number) => {
    if (filter?.tile?.x === x && filter?.tile?.y === y) {
      updateFilter({ tile: undefined });
    }
    else {
      updateFilter({ tile: { x, y } });
    }
  }

  const mapComponentProps = {
    map: mapModel,
    wheelParentDepth: 2,
    tile: filter?.tile ?? {},
    coordClicked: onTileClicked
  };
  const statsProps = {
    filter,
    data: {
      total: totalData,
      filtered: filteredData
    }
  };

  if (optionsLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className='filters'>
        <div className='game-filter'>
          <select value={filter.gameId} defaultValue={""} onChange={(e) => updateFilter({ gameId: e.target.value })}>
            <option value="" disabled>Select Game</option>
            {gameIds.map(id => (
              <option key={id} value={id}>
                Game {id}
              </option>
            ))}
          </select>
        </div>
        <div className='player-filter'>
          <label htmlFor='name-input'>Player Name: </label>
          <input id='name-input' type='text' value={player} onChange={(e) => setPlayer(e.target.value)} />
        </div>
      </div>
      <div className='map-stats'>
        <div className='map-wrapper'>
          <MapComponent {...mapComponentProps} />
        </div>
        <StatsComponent {...statsProps} />
      </div>
    </div>
  );
}