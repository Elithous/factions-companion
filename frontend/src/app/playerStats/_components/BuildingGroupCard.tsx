import { Paper, Group, Text, Stack } from '@mantine/core';
import { BuildingGroup } from '../page';

interface BuildingGroupCardProps {
  buildingGroup: BuildingGroup;
}

export default function BuildingGroupCard({ buildingGroup }: BuildingGroupCardProps) {
  return (
    <Paper p="md" withBorder className="building-group-card">
      <Group align="flex-start" gap="md">
        {/* Building Image - placeholder for now */}
        <div className="building-image-placeholder">
          <Text size="xs" c="dimmed" ta="center">Image</Text>
        </div>

        {/* Building Info */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text size="lg" fw={600}>{buildingGroup.name}</Text>
          
          <Group gap="md">
            <Text size="sm">
              {buildingGroup.totalCount} Total
            </Text>
          </Group>

          {/* {buildingGroup.production && (
            <Text size="sm" fw={500} c="green">
              {buildingGroup.production}
            </Text>
          )} */}

          {buildingGroup.levelBreakdown.length > 0 && (
            <Group gap="xs" mt="xs">
              {buildingGroup.levelBreakdown.map((item, idx) => (
                <Text key={idx} size="sm">
                  {item.count}x Level {item.level}
                  {idx < buildingGroup.levelBreakdown.length - 1 && ','}
                </Text>
              ))}
            </Group>
          )}

          {/* <Group gap="md" mt="xs">
            <Badge variant="light" color="orange" size="sm">
              Wood: {buildingGroup.resourcesSpent.wood.toLocaleString()}
            </Badge>
            <Badge variant="light" color="gray" size="sm">
              Iron: {buildingGroup.resourcesSpent.iron.toLocaleString()}
            </Badge>
            <Badge variant="light" color="blue" size="sm">
              Workers: {buildingGroup.resourcesSpent.workers.toLocaleString()}
            </Badge>
          </Group> */}
        </Stack>
      </Group>
    </Paper>
  );
}

