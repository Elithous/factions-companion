import { ToFromFaction } from "@/app/stats/page";

export default function StatsTable(props: { data: ToFromFaction, title: string }) {
  const { data, title } = props;
  if (Object.keys(data).length === 0) return <></>;
  const table = [];
  const froms = Object.keys(data).sort();
  for (const from of froms) {
    // Sort based on amount sent
    const toValues = Object.entries(data[from]).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    for (const values of toValues) {
      const total = values[1] ?? 0;
      const to = values[0];

      // Get fill width based on percentage of soldiers compared to max within it's category
      const maxValue = toValues[0][1] ?? 0;
      const percentFilled = maxValue > 0 ? Math.round((total / maxValue) * 100) : 0;

      table.push(
        <tr key={`${from}-${values[0]}`}
          className='stats-row'>
          <td className='total'>
            <div className={`fill ${from}`} style={{ width: `${percentFilled}%` }} />
            <div className='value'>{total.toLocaleString()}</div>
          </td>
          <td className={`faction ${from}`}>{from}</td>
          <td className={`faction ${to}`}>{to}</td>
        </tr>
      );
    }
  }

  return <table className='stats-table'>
    <thead>
      <tr>
        <th className='title' colSpan={3}>{title}</th>
      </tr>
      <tr>
        <th>Total</th>
        <th>Faction</th>
        <th>Sent To</th>
      </tr>
    </thead>
    <tbody>
      {table}
    </tbody>
  </table>
}