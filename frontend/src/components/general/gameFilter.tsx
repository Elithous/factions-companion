"use client"

import { Select, Text, Group, Loader, Paper } from '@mantine/core';
import { IconDeviceGamepad } from '@tabler/icons-react';
import './gameFilter.scss';

import { fetchBackend } from '@/utils/api.helper';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface GameFilterProps {
  gameId: string;
  setGameId: Dispatch<SetStateAction<string>>;
}

interface Game {
  id: string;
  name: string;
  startDate?: string;
}

export default function GameFilter({ gameId, setGameId }: GameFilterProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchBackend('/report/games');
        const data = await response.json();

        // Transform the data to include more game information if available
        const transformedGames = data.map((id: number | string) => ({
          id: String(id), // Convert ID to string
          name: `Game ${id}`,
          startDate: undefined // You can add this if available from your API
        }));

        setGames(transformedGames);
      } catch (err) {
        setError('Failed to load games. Please try again later.');
        console.error('Error fetching games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleGameChange = (value: string | null) => {
    setGameId(value || '');
  };

  if (error) {
    return (
      <Paper className="game-filter error" p="md">
        <Text color="red" size="sm">{error}</Text>
      </Paper>
    );
  }

  return (
    <Paper className="game-filter" p="md" shadow="sm">
      <Group justify="space-between" mb="xs">
        <Group>
          <IconDeviceGamepad size={20} />
          <Text size="lg" fw={500}>Select Game</Text>
        </Group>
        {isLoading && <Loader size="sm" />}
      </Group>

      <Select
        value={gameId || null}
        onChange={handleGameChange}
        placeholder="Choose a game"
        data={games.map(game => ({
          value: game.id,
          label: game.name
        }))}
        searchable
        disabled={isLoading}
        className="game-select"
        styles={{
          dropdown: {
            backgroundColor: 'var(--orange-800)',
            borderColor: 'var(--orange-900)',
          },
          option: {
            '&[dataSelected]': {
              backgroundColor: 'var(--orange-600)',
              color: 'var(--text-color)',
            },
            '&[dataHovered]': {
              backgroundColor: 'var(--orange-700)',
            },
          },
          input: {
            backgroundColor: 'var(--orange-800)',
            borderColor: 'var(--orange-900)',
            '&:focus': {
              borderColor: 'var(--orange-500)',
              boxShadow: '0 0 0 2px rgba(var(--orange-500), 0.2)',
            },
          },
        }}
      />
    </Paper>
  );
}