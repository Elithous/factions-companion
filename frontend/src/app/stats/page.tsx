"use client";

import './stats.scss';

import MapComponent, { MapProps } from "@/components/map/map";
import { MapConfig, MapModel, MapTilesListModel } from "@/components/map/map.model";
import StatsComponent from '@/components/stats/stats';
import { fetchBackend } from '@/utils/api.helper';
import { useEffect, useState, useCallback } from 'react';
import { StaticImageData } from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import FilterComponent, { StatsFilter } from '@/components/stats/filter/filter';
import GameFilter from '@/components/general/gameFilter';
import { Container, Loader, Text, Paper, Stack, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import Necropolis from '../../../public/maps/Necropolis.png';
import Rivers from '../../../public/maps/Rivers.png';
import Smallworld from '../../../public/maps/Smallworld.png';
import Volbadihr from '../../../public/maps/Volbadihr.png';
import Wetlands from '../../../public/maps/Wetlands.png';
import Windmill from '../../../public/maps/Windmill.png';

export interface ToFromFaction {
  [fromFaction: string]: {
    [toFaction: string]: number
  }
}

const mapImageMap: { [mapName: string]: StaticImageData } = {
  Necropolis,
  Rivers,
  Smallworld,
  Volbadihr,
  Wetlands,
  Windmill
}

interface LoadingState {
  data: boolean;
}

interface ErrorState {
  message: string;
  details?: string;
}

export default function StatsPage() {
  const router = useRouter();
  const path = usePathname();
  const queryParams = useSearchParams();

  const [loading, setLoading] = useState<LoadingState>({
    data: false
  });
  const [error, setError] = useState<ErrorState | null>(null);
  const [gameId, setGameId] = useState(queryParams.get('gameId') || '');
  const [dateRanges, setDateRanges] = useState<[number, number]>();
  const [filter, setFilter] = useState<StatsFilter>({});
  const [totalData, setTotalData] = useState<ToFromFaction>({});
  const [filteredData, setFilteredData] = useState<ToFromFaction>({});
  const [mapConfig, setMapConfig] = useState<MapConfig | undefined>();
  const [mapImage, setMapImage] = useState<StaticImageData>();
  const [mapTiles, setMapTiles] = useState<MapTilesListModel>({});

  const updateFilter = useCallback((rule: StatsFilter) => {
    setFilter(prev => ({ ...prev, ...rule }));
  }, []);

  const fetchGameData = useCallback(async (gameId: string) => {
    try {
      const [soldiersData, timespanData, configData] = await Promise.all([
        fetchBackend('report/soldiers/faction', { gameId }).then(resp => resp.json()),
        fetchBackend('report/games/timespan', { gameId }).then(resp => resp.json()),
        fetchBackend('report/games/config', { gameId }).then(resp => resp.json())
      ]);

      setTotalData(soldiersData);
      setDateRanges([timespanData[0] * 1000, timespanData[1] * 1000]);

      const mapConfig: MapConfig = configData.mapConfig;
      if (mapConfig) {
        setMapConfig(mapConfig);
        const mapImage = mapImageMap[mapConfig.name];
        if (mapImage) {
          setMapImage(mapImage);
        }
      }
    } catch (err) {
      setError({
        message: 'Failed to load game data',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  }, []);

  const fetchFilteredData = useCallback(async (gameId: string, filter: StatsFilter) => {
    try {
      setLoading(prev => ({ ...prev, data: true }));

      const params: {
        unitType?: string;
        gameId?: string;
        tileX?: string;
        tileY?: string;
        playerName?: string;
        fromFaction?: string;
        dateStart?: string;
        dateEnd?: string;
      } = { gameId };

      if (filter?.type) params.unitType = filter.type;
      if (filter?.tile !== undefined) {
        params.tileX = filter.tile.x.toString();
        params.tileY = filter.tile.y.toString();
      }
      if (filter?.playerName) params.playerName = filter.playerName;
      if (filter?.fromFaction) params.fromFaction = filter.fromFaction;
      if (filter?.dateRange) {
        params.dateStart = (filter.dateRange[0] / 1000).toString();
        params.dateEnd = (filter.dateRange[1] / 1000).toString();
      }

      const [soldiersData, tileData] = await Promise.all([
        fetchBackend('report/soldiers/faction', params).then(resp => resp.json()),
        fetchBackend('report/soldiers/tile', params).then(resp => resp.json())
      ]);

      setFilteredData(soldiersData);

      const maxValue = Object.keys(tileData).reduce((prev, x) => {
        const max: number = Object.values<number>(tileData[x]).reduce((maxY, value) => (maxY > value ? maxY : value), 0);
        return max > prev ? max : prev;
      }, 0);

      const mapTiles: MapTilesListModel = {};
      for (const xKey of Object.keys(tileData)) {
        const x = parseInt(xKey);
        if (!mapTiles[x]) mapTiles[x] = {};
        for (const yKey of Object.keys(tileData[x])) {
          const y = parseInt(yKey);
          mapTiles[x][y] = {
            weight: tileData[xKey][yKey] / maxValue
          }
        }
      }
      setMapTiles(mapTiles);
    } catch (err) {
      setError({
        message: 'Failed to load filtered data',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    // Set query param for load
    router.replace(`${path}?gameId=${gameId}`);

    // Reset state
    setDateRanges(undefined);
    setFilter({});
    setTotalData({});
    setFilteredData({});
    setMapTiles({});
    setError(null);
    setLoading(prev => ({ ...prev, data: true }));

    fetchGameData(gameId);
  }, [gameId, path, router, fetchGameData]);

  useEffect(() => {
    if (!gameId) return;
    fetchFilteredData(gameId, filter);
  }, [filter, gameId, fetchFilteredData]);

  const mapModel: MapModel = {
    dimensions: { width: mapConfig?.width || 50, height: mapConfig?.height || 50 },
    image: mapImage,
    tiles: mapTiles
  };

  const onTileClicked = useCallback((x: number, y: number) => {
    if (filter?.tile?.x === x && filter?.tile?.y === y) {
      updateFilter({ tile: undefined });
    } else {
      updateFilter({ tile: { x, y } });
    }
  }, [filter?.tile, updateFilter]);

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

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Paper p="md" withBorder color="red" className="error-container">
          <Group gap="xs" mb="xs">
            <IconAlertCircle size={20} />
            <Text fw={500} size="lg">Error</Text>
          </Group>
          <Text>{error.message}</Text>
          {error.details && (
            <Text size="sm" c="dimmed" mt="xs">
              {error.details}
            </Text>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <GameFilter gameId={gameId} setGameId={setGameId} />

        {gameId ? (
          <div className='map-stats'>
            <div className='map-wrapper'>
              <MapComponent {...mapComponentProps} />
            </div>

            <FilterComponent
              gameId={gameId}
              filter={filter}
              updateFilter={updateFilter}
              dateRange={dateRanges || [0, 0]}
            />

            <StatsComponent {...statsProps} />

            {loading.data && (
              <div className="loading-overlay">
                <Loader size="xl" />
              </div>
            )}
          </div>
        ) : (
          <Paper p="xl" withBorder>
            <Text ta="center" c="dimmed">
              Select a game to view statistics
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}