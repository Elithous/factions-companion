'use client'

import { Flex, Radio, RangeSlider } from '@mantine/core';
import './filter.scss';

import { useEffect, useState } from "react";
import { DateTimePicker } from '@mantine/dates';

export interface StatsFilter {
  type?: string,
  tile?: { x: number, y: number },
  playerName?: string,
  fromFaction?: string,
  dateRange?: [number, number]
}

export interface StatsProps {
  dateRange: [number, number],
  filter: StatsFilter,
  updateFilter: (rule: StatsFilter) => void
}

export default function FilterComponent(props: StatsProps) {
  const [player, setPlayer] = useState('');
  const [dateRange, setDateRange] = useState<[number, number]>(props.dateRange);
  const [dateStart, setDateStart] = useState<number>(props.dateRange?.[0]);
  const [dateEnd, setDateEnd] = useState<number>(props.dateRange?.[1]);

  useEffect(() => {
    setDateRange(props.dateRange);
  }, [props.dateRange]);

  useEffect(() => {
    if (!props.filter.playerName) {
      setPlayer('');
    }
  }, [props.filter]);

  // Use effect to allow a user to stop typing before the name is searched
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      props.updateFilter({ playerName: player });
    }, 1500)

    return () => clearTimeout(delayDebounceFn)
  }, [player])

  useEffect(() => {
    setDateStart(dateRange[0]);
    setDateEnd(dateRange[1]);

    props.updateFilter({ dateRange });
  }, dateRange);

  return <div className='filters-container'>
    <div className='type-filter filter' hidden>
      <p>Type</p>
      <Radio.Group className='type-select' defaultValue="soldiers"
        value={props.filter.type} onChange={(e) => props.updateFilter({ type: e })}>
        <Flex direction='row' gap='sm'>
          <Radio value="soldiers" label='Soldiers' />
          <Radio value="workers" label='Workers' />
          <Radio value="special" label='Special' />
        </Flex>
      </Radio.Group>
    </div>
    <div className='faction-filter filter'>
      <label htmlFor='faction-select'>Faction: </label>
      <select id='faction-select'
        value={props.filter?.fromFaction || ''}
        onChange={(e) => props.updateFilter({ fromFaction: e.target.value })}>
        <option value=''>None</option>
        <option value='blue'>Blue</option>
        <option value='green'>Green</option>
        <option value='red'>Red</option>
        <option value='yellow'>Yellow</option>
      </select>
    </div>
    <div className='player-filter filter'>
      <label htmlFor='name-input'>Player Name: </label>
      <input id='name-input' type='text' value={player} onChange={(e) => setPlayer(e.target.value)} />
    </div>
    <div className='time-filter filter'>
      <Flex className='date-inputs' justify='space-between'>
        <DateTimePicker
          className='timespan-picker'
          value={dateStart ? new Date(dateStart) : null}
          onChange={(e) => setDateRange([e?.getTime() || dateStart, dateEnd])}
          minDate={new Date(props.dateRange[0])}
          maxDate={new Date(props.dateRange[1])}
          withSeconds={true}
          maxLevel='month'
          label='Start Date'
          placeholder='Start Date'
          valueFormat="DD MMM YYYY hh:mm A" />
        <DateTimePicker
          className='timespan-picker'
          value={dateEnd ? new Date(dateEnd) : null}
          onChange={(e) => setDateRange([dateStart, e?.getTime() || dateEnd])}
          minDate={new Date(props.dateRange[0])}
          maxDate={new Date(props.dateRange[1])}
          withSeconds={true}
          maxLevel='month'
          label='End Date'
          placeholder='End Date'
          valueFormat="DD MMM YYYY hh:mm A" />
      </Flex>
      <RangeSlider
        onChange={(e) => {setDateStart(e[0]); setDateEnd(e[1]) }}
        onChangeEnd={setDateRange}
        value={[dateStart, dateEnd]}
        label={null}
        minRange={360000}
        step={600}
        min={props.dateRange?.[0]}
        max={props.dateRange?.[1]}
      />
    </div>
  </div>
}