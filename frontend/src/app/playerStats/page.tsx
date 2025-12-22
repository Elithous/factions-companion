"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Container, Stack, Paper, Text, Group, Select, Tabs, Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import GameFilter from '@/components/general/gameFilter';
import { fetchBackend } from '@/utils/api.helper';
import './playerStats.scss';
import BuildingGroupCard from './_components/BuildingGroupCard';
import VillageCard from './_components/VillageCard';
import BuildTimeline from './_components/BuildTimeline';

interface PlayerStats {
  playerName: string;
  buildActivities: {
    type: 'building_built' | 'building_upgraded' | 'building_destroyed' | 'hq_upgraded';
    name: string;
    level: number;
    timestamp: number;
  }[];
  personalActivities: {
    type: 'talent_picked' | 'spec_picked' | 'personal_project_picked';
    name: string;
    category: string;
    tier: number;
    timestamp: number;
  }[];
}

interface GameStats {
  gameMinute: number;
  resourcesSpent: {
    wood: number;
    iron: number;
    workers: number;
  };
}

export interface VillageStats {
  level: number;
  totalCount: number;
  buildingCount: number;
  specialSlots: string;
  resourcesSpent: {
    wood: number;
    iron: number;
    workers: number;
  };
}

const DEFAULT_VILLAGE: VillageStats = {
  level: 4,
  totalCount: 4,
  buildingCount: 0,
  specialSlots: "0/0",
  resourcesSpent: {
    wood: 0,
    iron: 0,
    workers: 0
  }
}

export interface BuildingGroup {
  name: string;
  imageUrl?: string;
  totalCount: number;
  production?: string;
  levelBreakdown: Array<{ level: number; count: number }>;
  resourcesSpent: {
    wood: number;
    iron: number;
    workers: number;
  };
}

export default function PlayerStatsPage() {
  const router = useRouter();
  const path = usePathname();
  const queryParams = useSearchParams();

  const [gameId, setGameId] = useState(queryParams.get('gameId') || '');
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(queryParams.get('playerName') || null);
  const [playerList, setPlayerList] = useState<{ value: string; label: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('village');
  const [gameStats, setGameStats] = useState<GameStats>({
    gameMinute: 0,
    resourcesSpent: {
      wood: 0,
      iron: 0,
      workers: 0
    }
  });
  const [currentTimelineStep, setCurrentTimelineStep] = useState<number>(0);

  const [villageStats, setVillageStats] = useState<VillageStats>(DEFAULT_VILLAGE);
  const [buildingGroups, setBuildingGroups] = useState<BuildingGroup[]>([]);

  // Fetch player list when gameId changes
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!gameId) {
        setPlayerList([]);
        return;
      }
      try {
        const players = await fetchBackend('report/player/active', { gameId }).then(resp => resp.json());
        const playerOptions = players
          .map((p: { player_name: string }) => ({
            value: p.player_name,
            label: p.player_name
          }))
          .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
        setPlayerList(playerOptions);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayerList([]);
      }
    };

    fetchPlayers();
  }, [gameId]);

  const fetchPlayerStats = async (name: string) => {
    if (!name) return;
    try {
      const playerStats = await fetchBackend(`report/player/stats/${name}`, { gameId }).then(resp => resp.json());
      if (playerStats.error) {
        throw playerStats.error;
      }
      setPlayerStats(playerStats);
    } catch (error) {
      setPlayerStats(null);
      console.error('Error fetching player stats:', error);
    }
  };

  useEffect(() => {
    if (playerName) {
      fetchPlayerStats(playerName);
    } else {
      setPlayerStats(null);
    }
  }, [playerName]);

  useEffect(() => {
    handleTimelineStepChange((playerStats?.buildActivities.length || 1) - 1);

    setGameStats({
      gameMinute: 0,
      resourcesSpent: {
        wood: 0,
        iron: 0,
        workers: 0
      }
    });
  }, [playerStats]);

  // Update URL params when gameId or playerName changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (gameId) params.set('gameId', gameId);
    if (playerName) params.set('playerName', playerName);
    router.replace(`${path}?${params.toString()}`);
  }, [gameId, playerName, path, router]);

  const handleTimelineStepChange = useCallback((step: number) => {
    if (!playerStats) {
      setVillageStats(DEFAULT_VILLAGE);
      setBuildingGroups([]);
      return;
    }
    setCurrentTimelineStep(step);

    const activities = playerStats.buildActivities.slice(0, step + 1);

    const buildings: { [name: string]: number[] } = {}
    let hqLevel = 4;
    let buildingCount = 0;
    for (const activity of activities) {
      if (activity.name && !buildings[activity.name]) {
        buildings[activity.name] = [];
      }
      const index = activity.name ? buildings[activity.name].findIndex(value => value === activity.level - 1) : -1;

      switch (activity.type) {
        case 'building_built':
          buildings[activity.name].push(1);
          buildingCount++;
          break;
        case 'building_upgraded':
          if (index === -1) break;
          buildings[activity.name][index]++;
          break;
        case 'building_destroyed':
          buildings[activity.name].splice(index, 1);
          buildingCount--;
          break;
        case 'hq_upgraded':
          hqLevel = activity.level;
          break;
      }
    }

    setVillageStats({
      level: hqLevel,
      buildingCount,
      totalCount: hqLevel,
      specialSlots: '0/0',
      resourcesSpent: {
        iron: 0,
        wood: 0,
        workers: 0
      }
    });

    const buildingStats: BuildingGroup[] = [];
    for (const buildingName of Object.keys(buildings)) {
      const levels = buildings[buildingName];
      if (levels.length === 0) continue;
      const levelCounts = levels.reduce((counts, level) => {
        counts[level] = (counts[level] || 0) + 1;
        return counts;
      }, {} as Record<number, number>);

      buildingStats.push({
        name: buildingName,
        totalCount: levels.length,
        levelBreakdown: Object.keys(levelCounts).map(Number).map((level) => ({ level, count: levelCounts[level] })),
        resourcesSpent: {
          wood: 0,
          iron: 0,
          workers: 0
        }
      });
    }
    setBuildingGroups(buildingStats);
  }, [playerStats]);

  return (
    <>
      <Container size="xl" py="xl" style={{ marginBottom: activeTab === 'village' ? '60px' : undefined }}>
        <Stack gap="md" className="player-activities-stack">
          {/* Title */}
          <Group justify="space-between" align="flex-start">
            <Text size="xl" fw={700}>Player Activities</Text>
            <Tooltip label="If you would like your build to be hidden on this screen, message BurnedAether on Discord and I'll hide it.">
              <ActionIcon variant="subtle" color="gray" size="lg">
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Game and Player Selectors */}
          <Paper p="md" withBorder className="selectors-section">
            <Group gap="md" align="flex-end" wrap="wrap">
              <div style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}>
                <GameFilter gameId={gameId} setGameId={setGameId} />
              </div>
              <div style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}>
                <Select
                  label="Player Name"
                  value={playerName}
                  onChange={setPlayerName}
                  data={playerList}
                  placeholder="Select player..."
                  searchable
                  clearable
                  disabled={!gameId}
                />
              </div>
            </Group>
          </Paper>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="village">Village</Tabs.Tab>
              <Tabs.Tab value="project-tree">Project Tree</Tabs.Tab>
            </Tabs.List>

            {/* Village Tab Content */}
            <Tabs.Panel value="village" pt="md">
              <Stack gap="md">
                {/* Game Stats Section */}
                <Paper p="md" withBorder className="game-stats-section">
                  <Group gap="xl">
                    <div>
                      <Text size="sm" c="dimmed" mb={4}>Game Minute (to be calculated)</Text>
                      <Text size="lg" fw={600}>{gameStats.gameMinute}</Text>
                    </div>
                    {/* <div>
                    <Text size="sm" c="dimmed" mb={4}>Resources Spent</Text>
                    <Group gap="md">
                      <Badge variant="light" color="orange" size="lg">
                        Wood: {gameStats.resourcesSpent.wood.toLocaleString()}
                      </Badge>
                      <Badge variant="light" color="gray" size="lg">
                        Iron: {gameStats.resourcesSpent.iron.toLocaleString()}
                      </Badge>
                      <Badge variant="light" color="blue" size="lg">
                        Workers: {gameStats.resourcesSpent.workers.toLocaleString()}
                      </Badge>
                    </Group>
                  </div> */}
                  </Group>
                </Paper>

                {/* Village Card */}
                <VillageCard villageStats={villageStats} />

                {/* Building Groups */}
                <Stack gap="md">
                  {buildingGroups.map((group, index) => (
                    <BuildingGroupCard key={index} buildingGroup={group} />
                  ))}
                </Stack>
              </Stack>
            </Tabs.Panel>

            {/* Project Tree Tab Content */}
            <Tabs.Panel value="project-tree" pt="md">
              <Paper p="xl" withBorder>
                <Text ta="center" c="dimmed">
                  Project Tree view coming soon...
                </Text>
              </Paper>
            </Tabs.Panel>
          </Tabs>

        </Stack>
      </Container>

      {/* Build Timeline - only show on Village tab, fixed at bottom */}
      {activeTab === 'village' && (
        <BuildTimeline
          timelineSteps={playerStats?.buildActivities}
          currentStep={currentTimelineStep}
          onStepChange={handleTimelineStepChange}
        />
      )}
    </>
  );
}

