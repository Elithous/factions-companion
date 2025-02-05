"use client";

import './stats.css';

import MapComponent from "@/components/map/map";
import MapModel from "@/components/map/map.model";
import StatsComponent from '@/components/stats/stats';
import { useEffect, useState } from 'react';

enum LoadingState {
  OptionsLoading,
  DataLoading,
  Loaded
}

export interface StatsFilter {
  gameId: string,
  tile: { x: number, y: number }
}

export default function StatsPage() {
  const [loadingState, setLoadingState] = useState(LoadingState.OptionsLoading);
  const [gameIds, setGameIds] = useState([] as string[]);
  const [filter, setFilter] = useState({} as StatsFilter);

  const updateFilter = (rule: Partial<StatsFilter>) => setFilter({ ...filter, ...rule });

  useEffect(() => {
    setLoadingState(LoadingState.OptionsLoading);
    setGameIds(['20', '21']);
    setLoadingState(LoadingState.DataLoading);
  }, []);

  useEffect(() => {
    setLoadingState(LoadingState.DataLoading);
    setLoadingState(LoadingState.Loaded);
  }, [filter]);

  const mapModel: MapModel = {
    dimensions: { x: 50, y: 50 },
    imageUrl: '',
    tiles: []
  };

  const onTileClicked = async (x: number, y: number) => updateFilter({ tile: { x, y } });

  const mapComponentProps = {
    map: mapModel,
    wheelParentDepth: 2,
    tile: filter?.tile ?? {},
    coordClicked: onTileClicked
  };
  const statsProps = {
    filter
  };

  if (loadingState === LoadingState.OptionsLoading) return <p>Loading...</p>;

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
      </div>
      {loadingState === LoadingState.Loaded ?
        <div className='map-stats'>
          <div className='map-wrapper'>
            <MapComponent {...mapComponentProps} />
          </div>
          <StatsComponent {...statsProps} />
        </div>
      : <p>Loading...</p>}
    </div>
  );
}