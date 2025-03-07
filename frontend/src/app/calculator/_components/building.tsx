"use client"

import { Flex, NumberInput, Select } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Building, BuildingNames, BuildingNameType } from '../../../utils/game/building.model';
import { BuildingData } from '../../../utils/game/building.model';

export default function BuildingsComponent(props: { data: Building, updateData: (row: Building) => void, disableCount: boolean }) {
  const [type, setType] = useState<BuildingNameType | null>(props.data.type);
  const [count, setCount] = useState<string | number>(props.data.count);
  const [level, setLevel] = useState<string | number>(props.data.level);

  const [countDisabled, setCountDisabled] = useState(false);

  useEffect(() => {
    // If the type changes, re-check validation steps
    if (type != props.data.type) {
      const buildingData = BuildingData.find(data => data.name === type);
      setCountDisabled(buildingData?.unique ?? false);
      setCount(1);
    }

    props.updateData({
      id: props.data.id,
      type,
      count: +count,
      level: +level
    });
  }, [type, count, level]);

  return (
    <Flex gap='xs'>
      <Select
        label='Building'
        value={type}
        onChange={v => setType(v as BuildingNameType)}
        data={BuildingNames}
        comboboxProps={{ styles: { options: { color: 'black' } } }}
        searchable
      />
      <NumberInput
        style={{ width: '70px' }}
        label='Count'
        value={count}
        onChange={setCount}
        max={props.disableCount ? +count : undefined}
        allowNegative={false}
        disabled={countDisabled}
      />
      <NumberInput
        style={{ width: '70px' }}
        label='Level'
        value={level}
        onChange={setLevel}
        allowNegative={false}
      />
    </Flex>
  )
};