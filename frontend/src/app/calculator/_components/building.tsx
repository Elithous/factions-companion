"use client"

import { Button, CloseButton, Flex, NumberInput, Select, Paper } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Building, BuildingNames, BuildingNameType } from '../../../utils/game/building.model';
import { BuildingData } from '../../../utils/game/building.model';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';

export default function BuildingsComponent(props: { 
  data: Building, 
  updateData: (row: Building) => void, 
  disableCount: boolean,
  id: string,
  onSplit: (building: Building) => void,
  onRemove: (id: number) => void
}) {
  const [type, setType] = useState<BuildingNameType | null>(props.data.type);
  const [count, setCount] = useState<string | number>(props.data.count);
  const [level, setLevel] = useState<string | number>(props.data.level);

  const [countDisabled, setCountDisabled] = useState(false);

  // Set up sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  useEffect(() => {
    // If the type changes, re-check validation steps
    if (type != props.data.type) {
      const buildingData = BuildingData.find(data => data.name === type);
      if (buildingData?.unique) {
        setCountDisabled(true);
        setCount(1);
      }
      setCountDisabled(false);
    }

    props.updateData({
      id: props.data.id,
      type,
      count: +count,
      level: +level,
      sortOrder: props.data.sortOrder
    });
  }, [type, count, level]);

  useEffect(() => {
    setType(props.data.type);
    setCount(props.data.count);
    setLevel(props.data.level);
  }, [props.data]);

  return (
    <Paper 
      ref={setNodeRef} 
      style={style} 
      p="xs" 
      withBorder
      className="building-row"
    >
      <Flex gap='xs' align="center" justify="space-between">
        <Flex gap='xs' align="center">
          <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
            <IconGripVertical size={20} />
          </div>
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
        <Flex gap='xs' align="center">
          <Button
            bg="var(--orange-900)"
            variant="subtle"
            size="xs"
            disabled={props.data.count <= 1}
            onClick={() => props.onSplit(props.data)}
          >
            Split
          </Button>
          <CloseButton
            style={{ color: 'red', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            onClick={() => props.onRemove(props.data.id)}
          />
        </Flex>
      </Flex>
    </Paper>
  )
};