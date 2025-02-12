import './stats.scss';

import { ToFromFaction } from "@/app/stats/page";
import StatsTable from './statsTable';
import { StatsFilter } from '../filter/filter';

export default function StatsComponent(props: { filter: StatsFilter, data: { total: ToFromFaction, filtered: ToFromFaction} }) {
  const { filter, data } = props;

  return (
    <div className='stats-container'>
      {data?.total &&
        <div className='faction-totals'>
          <StatsTable data={data.total} title={'Totals by Faction'} />
        </div>
      }
      {data?.filtered &&
        <div className='filtered-totals'>
          <div className='filters'>
            { filter.playerName && <p>Player: {filter.playerName}</p>}
            { filter.tile && <p>Tile: {filter.tile.x}, {filter.tile.y}</p>}
          </div>
          <StatsTable data={data.filtered} title={'Totals by Filter'} />
        </div>
      }
    </div>
  )
};