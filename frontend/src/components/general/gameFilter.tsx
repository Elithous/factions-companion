"use client"

import './gameFilter.scss';

import { fetchBackend } from '@/utils/api.helper';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function GameFilter(props: { gameId: string, setGameId: Dispatch<SetStateAction<string>> }) {
  const [gameIds, setGameIds] = useState([] as string[]);

    useEffect(() => {
      fetchBackend('/report/games')
        .then((resp) => resp.json())
        .then((data) => {
          setGameIds(data);
        });
    }, []);

  return (
    <div className='game-filter'>
      <select value={props.gameId || ''} onChange={(e) => props.setGameId(e.target.value)}>
        <option value="" disabled>Select Game</option>
        {gameIds.map(id => (
          <option key={id} value={id}>
            Game {id}
          </option>
        ))}
      </select>
    </div>
  )
};