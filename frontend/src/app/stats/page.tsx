"use client";

import './stats.scss';

import MapComponent, { MapProps } from "@/components/map/map";
import { MapConfig, MapModel, MapTilesListModel } from "@/components/map/map.model";
import StatsComponent from '@/components/stats/stats';
import { fetchBackend } from '@/utils/api.helper';
import { useEffect, useState } from 'react';

import { StaticImageData } from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import FilterComponent, { StatsFilter } from '@/components/stats/filter/filter';
import GameFilter from '@/components/general/gameFilter';

import Volbadihr from '../../../public/maps/Volbadihr.png';
import Rivers from '../../../public/maps/Rivers.png';
import Windmill from '../../../public/maps/Windmill.png';
import Smallworld from '../../../public/maps/Smallworld.png';

export interface ToFromFaction {
  [fromFaction: string]: {
    [toFaction: string]: number
  }
}

const mapImageMap: { [mapName: string]: StaticImageData } = { Windmill, Volbadihr, Rivers, Smallworld }

export default function StatsPage() {
  const router = useRouter();
  const path = usePathname();
  const queryParams = useSearchParams();

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [gameId, setGameId] = useState(queryParams.get('gameId') || '');
  const [dateRanges, setDateRanges] = useState<[number, number]>();
  const [filter, setFilter] = useState<StatsFilter>({});
  const [totalData, setTotalData] = useState<ToFromFaction>({});
  const [filteredData, setFilteredData] = useState<ToFromFaction>({});
  const [mapConfig, setMapConfig] = useState<MapConfig | undefined>();
  const [mapImage, setMapImage] = useState<StaticImageData>();
  const [mapTiles, setMapTiles] = useState<MapTilesListModel>({});

  const updateFilter = (rule: StatsFilter) => setFilter({ ...filter, ...rule });

  useEffect(() => {
    fetchBackend('websocket/parse', undefined, { method: 'POST' })
      .then(() => {
        setOptionsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Set query param for load
    if (gameId) {
      router.replace(`${path}?gameId=${gameId}`);
    }

    // Reset filters and stats data.
    setDateRanges(undefined);
    setFilter({});
    setTotalData({});
    setFilteredData({});
    setMapTiles({});

    if (gameId) {
      setTotalData({});
      fetchBackend('report/soldiers/faction', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setTotalData(data);
        });

      fetchBackend('report/games/timespan', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          setDateRanges([data[0] * 1000, data[1] * 1000]);
        });


      fetchBackend('report/games/config', { gameId })
        .then((resp) => resp.json())
        .then((data) => {
          const mapConfig: MapConfig = data.mapConfig;
          if (mapConfig) {
            setMapConfig(mapConfig);

            console.log(mapConfig);
            const mapImage = mapImageMap[mapConfig.name];
            console.log(mapImageMap);
            if (mapImage) {
              setMapImage(mapImage);
            }
          }
        });
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      const params: {
        unitType?: string,
        gameId?: string,
        tileX?: string,
        tileY?: string,
        playerName?: string,
        fromFaction?: string,
        dateStart?: string,
        dateEnd?: string
      } = { gameId: gameId };

      if (filter?.type) {
        // TODO: Change filters to make this actually work.
        params.unitType = filter.type;
      }
      if (filter?.tile !== undefined) {
        params.tileX = filter.tile.x.toString();
        params.tileY = filter.tile.y.toString();
      }
      if (filter?.playerName) {
        params.playerName = filter.playerName;
      }
      if (filter?.fromFaction) {
        params.fromFaction = filter.fromFaction;
      }
      if (filter?.dateRange) {
        params.dateStart = (filter.dateRange[0] / 1000).toString();
        params.dateEnd = (filter.dateRange[1] / 1000).toString();
      }

      setFilteredData({});
      fetchBackend('report/soldiers/faction', params)
        .then((resp) => resp.json())
        .then((data) => {
          setFilteredData(data);
        });

      fetchBackend('report/soldiers/tile', params)
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
    dimensions: { width: mapConfig?.width || 50, height: mapConfig?.height || 50 },
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

  const mapComponentProps: MapProps = {
    map: mapModel,
    wheelParentDepth: 2,
    mapScale: 4,
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
      <GameFilter gameId={gameId} setGameId={setGameId} />
      <div className='map-stats'>
        <div className='map-wrapper'>
          <MapComponent {...mapComponentProps} />
        </div>
        <FilterComponent filter={filter} updateFilter={updateFilter} dateRange={dateRanges || [0, 0]} />
        <StatsComponent {...statsProps} />
      </div>
    </div>
  );
}