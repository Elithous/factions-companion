'use client'

import { useEffect, useState } from "react";

export interface StatsFilter {
  tile?: { x: number, y: number },
  playerName?: string,
  fromFaction?: string
}

export default function FilterComponent(props: { filter: StatsFilter, updateFilter: (rule: StatsFilter) => void }) {
  const [player, setPlayer] = useState('');

  // Use effect to allow a user to stop typing before the name is searched
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.updateFilter({ playerName: player });
    }, 1500)

    return () => clearTimeout(delayDebounceFn)
  }, [player])

  useEffect(() => {
    if (!props.filter.playerName) {
      setPlayer('');
    }
  }, [props.filter]);

  return <div className='filters'>
    <div className='player-filter'>
      <label htmlFor='name-input'>Player Name: </label>
      <input id='name-input' type='text' value={player} onChange={(e) => setPlayer(e.target.value)} />
    </div>
    <div className='faction-filter'>
      <label htmlFor='faction-select'>Faction: </label>
      <select id='faction-select'
        value={props.filter?.fromFaction || ''}
        onChange={(e) => props.updateFilter({ fromFaction: e.target.value })}>
        <option value=''>None</option>
        <option value='blue'>Blue</option>
        <option value='green'>Green</option>
        <option value='red'>Red</option>
        <option value='yellow'>Yellow</option>
      </select>
    </div>
  </div>
}