import { Table, Text, Group } from '@mantine/core';
import { ToFromFaction } from "@/app/stats/page";

interface StatsTableProps {
  data: ToFromFaction;
  title: string;
}

export default function StatsTable({ data, title }: StatsTableProps) {
  if (Object.keys(data).length === 0) return null;

  const tableRows = Object.keys(data)
    .sort()
    .flatMap(from => {
      // Sort based on amount sent
      const toValues = Object.entries(data[from])
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

      return toValues.map(([to, total]) => {
        const maxValue = toValues[0][1] ?? 0;
        const percentFilled = maxValue > 0 ? Math.round((total / maxValue) * 100) : 0;

        return (
          <Table.Tr key={`${from}-${to}`} className='stats-row'>
            <Table.Td className='total'>
              <div className={`fill ${from}`} style={{ width: `${percentFilled}%` }} />
              <div className='value'>{total.toLocaleString()}</div>
            </Table.Td>
            <Table.Td className={`faction ${from}`}>{from}</Table.Td>
            <Table.Td className={`faction ${to}`}>{to}</Table.Td>
          </Table.Tr>
        );
      });
    });

  return (
    <Table className='stats-table'>
      <Table.Thead>
        <Table.Tr>
          <Table.Th colSpan={3}>
            <Group justify="center">
              <Text size="lg" fw={500}>{title}</Text>
            </Group>
          </Table.Th>
        </Table.Tr>
        <Table.Tr>
          <Table.Th>Total</Table.Th>
          <Table.Th>From Faction</Table.Th>
          <Table.Th>To Faction</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tableRows}
      </Table.Tbody>
    </Table>
  );
}