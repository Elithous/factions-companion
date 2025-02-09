"use client";

import './stats.scss';

import MapComponent from "@/components/map/map";
import { MapModel, MapTilesListModel } from "@/components/map/map.model";
import StatsComponent from '@/components/stats/stats';
import { fetchBackend } from '@/utils/api.helper';
import { useEffect, useState } from 'react';

import Volbadihr from '../../../public/maps/Volbadihr.png';
import Rivers from '../../../public/maps/Rivers.png';
import { StaticImageData } from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export interface StatsFilter {
  gameId?: string,
  tile?: { x: number, y: number },
  playerName?: string
}

export interface ToFromFaction {
  [fromFaction: string]: {
    [toFaction: string]: number
  }
}

export default function StatsPage() {
  const router = useRouter();
  const path = usePathname();
  const queryParams = useSearchParams();

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [gameIds, setGameIds] = useState([] as string[]);
  const [gameId, setGameId] = useState(queryParams.get('gameId'));
  const [filter, setFilter] = useState<StatsFilter>({});
  const [player, setPlayer] = useState('');
  const [totalData, setTotalData] = useState<ToFromFaction>({});
  const [filteredData, setFilteredData] = useState<ToFromFaction>({});
  const [mapImage, setMapImage] = useState<StaticImageData>();
  const [mapTiles, setMapTiles] = useState<MapTilesListModel>({});

  const updateFilter = (rule: StatsFilter) => setFilter({ ...filter, ...rule });
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
    // Set query param for load
    router.replace(`${path}?gameId=${gameId}`);

    // Reset filters and stats data.
    setFilter({});
    setTotalData({});
    setFilteredData({});
    setMapTiles({});
    setPlayer('');

    if (gameId) {
      setTotalData({});
      fetchBackend('/report/soldiers/faction', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setTotalData(data);
        });

      // TODO: Set this based on game config api response
      if (gameId === '20') {
        setMapImage(Volbadihr);
      }
      else if (gameId === '22') {
        setMapImage(Rivers);
      }
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      const params: {
        gameId?: string,
        tileX?: string,
        tileY?: string,
        playerName?: string
      } = { gameId: gameId };

      if (filter?.tile?.x && filter?.tile?.y) {
        params.tileX = filter.tile.x.toString();
        params.tileY = filter.tile.y.toString();
      }
      if (filter?.playerName) {
        params.playerName = filter.playerName;
      }

      setFilteredData({});
      fetchBackend('/report/soldiers/faction', params)
        .then((resp) => resp.json())
        .then((data) => {
          setFilteredData(data);
        });

      fetchBackend('/report/soldiers/tile', params)
        .then((resp) => resp.json())
        .then((data) => {
          const maxValue = Object.keys(data).reduce((prev, x) => {
            const max: number = Object.values<number>(data[x]).reduce((maxY, value) => (maxY > value ? maxY : value), 0);
            return max > prev ? max : prev;
          }, 0);

          const mapTiles: MapTilesListModel = {};
          for (const xKey of Object.keys(data)) {
            const x = parseInt(xKey);
            if (!mapTiles[x]) mapTiles[x] = {};
            for (const yKey of Object.keys(data[x])) {
              const y = parseInt(yKey);
              mapTiles[x][y] = {
                weight: data[xKey][yKey] / maxValue
              }
            }
          }
          setMapTiles(mapTiles);
        });
    }
  }, [filter]);

  const mapModel: MapModel = {
    dimensions: { x: 50, y: 50 },
    image: mapImage,
    tiles: mapTiles
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
    tile: filter?.tile,
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
          <select value={gameId || ''} onChange={(e) => setGameId(e.target.value)}>
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