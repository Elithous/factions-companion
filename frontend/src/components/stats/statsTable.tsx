import { ToFromFaction } from "@/app/stats/page";

export default function StatsTable(props: { data: ToFromFaction, title: string }) {
  const { data, title } = props;
  if (Object.keys(data).length === 0) return <></>;
  const table = [];
  const froms = Object.keys(data).sort();
  for (const from of froms) {
    // Sort based on amount sent
    const toValues = Object.entries(data[from]).sort((a, b) => b[1] - a[1]);
    for (const values of toValues) {
      const total = values[1];
      const to = values[0];

      // Get fill width based on percentage of soliders compared to max within it's category
      const percentFilled = Math.round((total / toValues[0][1]) * 100);

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