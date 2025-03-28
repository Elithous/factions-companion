import { Paper, Stack, Text, Group, Badge } from '@mantine/core';
import { IconFilter, IconChartBar } from '@tabler/icons-react';
import './stats.scss';

import { ToFromFaction } from "@/app/stats/page";
import StatsTable from './statsTable';
import { StatsFilter } from './filter/filter';

interface StatsComponentProps {
  filter: StatsFilter;
  data: {
    total: ToFromFaction;
    filtered: ToFromFaction;
  };
}

const formatDateRange = (start: number, end: number) => {
  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
};

export default function StatsComponent({ filter, data }: StatsComponentProps) {
  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <Stack className='stats-container' gap="xl">
      {/* Totals Section */}
      {data?.total && (
        <Paper className='faction-totals' shadow="sm" p="md">
          <Group justify="space-between" mb="md">
            <Group>
              <IconChartBar size={20} />
              <Text size="lg" fw={500}>Total Statistics</Text>
            </Group>
          </Group>
          <StatsTable data={data.total} title="Totals by Faction" />
        </Paper>
      )}

      {/* Filtered Section */}
      {data?.filtered && (
        <Paper className='filtered-totals' shadow="sm" p="md">
          <Group justify="space-between" mb="md">
            <Group>
              <IconFilter size={20} />
              <Text size="lg" fw={500}>Filtered Statistics</Text>
            </Group>
            {hasActiveFilters && (
              <Badge color="blue" variant="light">
                Active Filters
              </Badge>
            )}
          </Group>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Group className='active-filters' gap="sm" mb="md">
              {filter.dateRange && (
                <Badge variant="outline" color="gray">
                  {formatDateRange(filter.dateRange[0], filter.dateRange[1])}
                </Badge>
              )}
              {filter.playerName && (
                <Badge variant="outline" color="gray">
                  Player: {filter.playerName}
                </Badge>
              )}
              {filter.fromFaction && (
                <Badge variant="outline" color="gray">
                  Faction: {filter.fromFaction}
                </Badge>
              )}
              {filter.tile && (
                <Badge variant="outline" color="gray">
                  Tile: ({filter.tile.x}, {filter.tile.y})
                </Badge>
              )}
            </Group>
          )}

          <StatsTable data={data.filtered} title="Filtered Results" />
        </Paper>
      )}
    </Stack>
  );
}