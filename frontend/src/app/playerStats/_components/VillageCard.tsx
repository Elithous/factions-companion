import { Paper, Group, Text, Stack } from '@mantine/core';
import { VillageStats } from '../page';

interface VillageCardProps {
  villageStats: VillageStats;
}

export default function VillageCard({ villageStats }: VillageCardProps) {
  return (
    <Paper p="md" withBorder className="building-group-card village-card">
      <Group align="flex-start" gap="md">
        {/* Village Image - placeholder for now */}
        <div className="building-image-placeholder">
          <Text size="xs" c="dimmed" ta="center">Image</Text>
        </div>

        {/* Village Info */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text size="lg" fw={600}>Village</Text>
          
          <Text size="md">Level {villageStats.level}</Text>
          
          <Group gap="md">
            <Text size="sm" c="dimmed">
              {villageStats.buildingCount}/{villageStats.totalCount} Buildings
            </Text>
            <Text size="sm" c="dimmed">
              {villageStats.specialSlots} Special Slots
            </Text>
          </Group>

          {/* <Group gap="md" mt="xs">
            <Badge variant="light" color="orange" size="sm">
              Wood: {villageStats.resourcesSpent.wood.toLocaleString()}
            </Badge>
            <Badge variant="light" color="gray" size="sm">
              Iron: {villageStats.resourcesSpent.iron.toLocaleString()}
            </Badge>
            <Badge variant="light" color="blue" size="sm">
              Workers: {villageStats.resourcesSpent.workers.toLocaleString()}
            </Badge>
          </Group> */}
        </Stack>
      </Group>
    </Paper>
  );
}

