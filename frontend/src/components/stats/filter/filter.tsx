'use client'

import { Flex, Radio, RangeSlider, Text, Stack, Group, ActionIcon, Tooltip, Button, Autocomplete } from '@mantine/core';
import { IconRefresh, IconFilter, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import './filter.scss';

import { useEffect, useState, useCallback } from "react";
import { DateTimePicker } from '@mantine/dates';

export interface StatsFilter {
  type?: 'soldiers' | 'workers' | 'special';
  tile?: { x: number, y: number };
  playerName?: string;
  fromFaction?: 'blue' | 'green' | 'red' | 'yellow';
  dateRange?: [number, number];
  gameId?: string;
}

export interface StatsProps {
  dateRange: [number, number];
  filter: StatsFilter;
  updateFilter: (rule: StatsFilter) => void;
  onReset?: () => void;
}

const FACTION_OPTIONS = [
  { value: '', label: 'All Factions' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
] as const;

const TYPE_OPTIONS = [
  { value: 'soldiers', label: 'Soldiers' },
  { value: 'workers', label: 'Workers' },
  { value: 'special', label: 'Special' },
] as const;

export default function FilterComponent(props: StatsProps) {
  const [player, setPlayer] = useState('');
  const [dateRange, setDateRange] = useState<[number, number]>(props.dateRange);
  const [dateStart, setDateStart] = useState<number>(props.dateRange?.[0]);
  const [dateEnd, setDateEnd] = useState<number>(props.dateRange?.[1]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerList, setPlayerList] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setDateRange(props.dateRange);
  }, [props.dateRange]);

  useEffect(() => {
    if (!props.filter.playerName) {
      setPlayer('');
    }
  }, [props.filter]);

  // Debounced player name update
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.updateFilter({ playerName: player });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [player]);

  useEffect(() => {
    setDateStart(dateRange[0]);
    setDateEnd(dateRange[1]);

    // Only include dates in filter that differ from min/max bounds by more than 60 seconds
    const filterRange: [number | null, number | null] = [
      Math.abs(dateRange[0] - props.dateRange[0]) < 60 ? null : dateRange[0],
      Math.abs(dateRange[1] - props.dateRange[1]) < 60 ? null : dateRange[1]
    ];

    console.log(filterRange);
    console.log(props.dateRange);
    // Only update filter if at least one bound is not null
    if (filterRange[0] !== null || filterRange[1] !== null) {
      props.updateFilter({ 
        dateRange: [
          filterRange[0] ?? props.dateRange[0],
          filterRange[1] ?? props.dateRange[1]
        ] 
      });
    }
    else {
      props.updateFilter({ dateRange: undefined });
    }
  }, dateRange);

  const handleReset = useCallback(() => {
    setPlayer('');
    setDateRange(props.dateRange);
    props.onReset?.();
  }, [props.dateRange, props.onReset]);

  const toggleAdvancedFilters = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Fetch player list when component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/reports/player/active?gameId=${props.filter.gameId}`);
        if (!response.ok) throw new Error('Failed to fetch players');
        const players = await response.json();
        setPlayerList(players.map((p: { player_name: string }) => ({
          value: p.player_name,
          label: p.player_name
        })));
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    if (props.filter.gameId) {
      fetchPlayers();
    }
  }, [props.filter.gameId]);

  return (
    <div className='filters-container'>
      <Group justify="space-between" mb="md">
        <Group>
          <IconFilter size={20} />
          <Text size="lg" fw={500}>Filters</Text>
        </Group>
        <Group>
          <Tooltip label="Toggle advanced filters">
            <Button
              variant="subtle"
              color="gray"
              onClick={toggleAdvancedFilters}
              rightSection={isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            >
              {isExpanded ? 'Hide Advanced' : 'Show Advanced'}
            </Button>
          </Tooltip>
          <Tooltip label="Reset all filters">
            <ActionIcon 
              variant="light" 
              color="red" 
              onClick={handleReset}
              disabled={!Object.keys(props.filter).length}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Stack gap="md">
        {/* Basic Filters */}
        <div className='basic-filters'>
          <div className='faction-filter filter'>
            <label htmlFor='faction-select'>Faction</label>
            <select 
              id='faction-select'
              value={props.filter?.fromFaction || ''}
              onChange={(e) => props.updateFilter({ fromFaction: e.target.value as StatsFilter['fromFaction'] })}
            >
              {FACTION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='player-filter filter'>
            <label htmlFor='name-input'>Player Name</label>
            <Autocomplete
              id='name-input'
              value={player}
              onChange={setPlayer}
              data={playerList}
              placeholder="Search player..."
              limit={10}
              maxDropdownHeight={200}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={`advanced-filters ${isExpanded ? 'expanded' : ''}`}>
          <div className='type-filter filter' hidden>
            <Text size="sm" fw={500} mb="xs">Type</Text>
            <Radio.Group 
              className='type-select' 
              value={props.filter.type || 'soldiers'}
              onChange={(value) => props.updateFilter({ type: value as StatsFilter['type'] })}
            >
              <Flex direction='row' gap='md'>
                {TYPE_OPTIONS.map(option => (
                  <Radio 
                    key={option.value} 
                    value={option.value} 
                    label={option.label} 
                  />
                ))}
              </Flex>
            </Radio.Group>
          </div>

          <div className='time-filter filter'>
            <Text size="sm" fw={500} mb="xs">Time Range</Text>
            <Flex className='date-inputs' justify='space-between' gap="md">
              <DateTimePicker
                className='timespan-picker'
                value={dateStart ? new Date(dateStart) : null}
                onChange={(e) => setDateRange([e?.getTime() || dateStart, dateEnd])}
                minDate={new Date(props.dateRange[0])}
                maxDate={new Date(props.dateRange[1])}
                maxLevel='month'
                label='Start Date'
                placeholder='Start Date'
                valueFormat="DD MMM YYYY hh:mm A"
              />
              <DateTimePicker
                className='timespan-picker'
                value={dateEnd ? new Date(dateEnd) : null}
                onChange={(e) => setDateRange([dateStart, e?.getTime() || dateEnd])}
                minDate={new Date(props.dateRange[0])}
                maxDate={new Date(props.dateRange[1])}
                maxLevel='month'
                label='End Date'
                placeholder='End Date'
                valueFormat="DD MMM YYYY hh:mm A"
              />
            </Flex>
            <RangeSlider
              onChange={(e) => {setDateStart(e[0]); setDateEnd(e[1])}}
              onChangeEnd={setDateRange}
              value={[dateStart, dateEnd]}
              label={null}
              minRange={60 * 60 * 1000}
              step={60}
              min={props.dateRange?.[0]}
              max={props.dateRange?.[1]}
              mt="md"
            />
          </div>
        </div>
      </Stack>
    </div>
  );
}