import { StatsFilter } from "@/app/stats/page";

export default function StatsComponent(props: { filter: StatsFilter }) {
  const { filter } = props;

  return (
    <div className='stats-container'>
      Stats 🫡
      { filter?.tile && <div>Tile: {filter.tile.x}, {filter.tile.y}</div> }
      { filter?.gameId && <div>GameId: {filter.gameId}</div>}
    </div>
  )
};