"use client"

import { Button, Flex, NumberInput, ScrollArea, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import BuildingsComponent from './building';
import { Building } from '@/utils/game/building.model';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export default function BuildingsDisplayComponent(props: {
  buildings: Building[],
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>,
  hq: number,
  setHq: React.Dispatch<React.SetStateAction<number>>
}) {
  const { buildings, setBuildings, hq, setHq } = props;
  const [buildingRows, setBuildingRows] = useState<React.ReactNode[]>([]);

  const totalBuildings = buildings.reduce((total, building) => total + building.count, 0)
  const addDisabled = totalBuildings >= hq;

  // Initialize sortOrder for existing buildings if not set
  useEffect(() => {
    const hasSortOrder = buildings.some(b => 'sortOrder' in b);
    if (!hasSortOrder) {
      const updatedBuildings = buildings.map((building, index) => ({
        ...building,
        sortOrder: index
      }));
      setBuildings(updatedBuildings);
    }
  }, []);

  useEffect(() => {
    const rows = buildings
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((building) => (
        <Table.Tr key={building.id}>
          <Table.Td style={{ padding: 0 }}>
            <BuildingsComponent
              data={building}
              updateData={handleUpdateRow}
              disableCount={addDisabled}
              id={building.id.toString()}
              onSplit={handleSplitBuilding}
              onRemove={handleRemoveRow}
            />
          </Table.Td>
        </Table.Tr>
      ));
    setBuildingRows(rows);
  }, [buildings, addDisabled]);

  const handleAddRow = () => {
    const newId = buildings.length > 0 ? buildings[buildings.length - 1].id + 1 : 1;
    const newRow: Building = { 
      id: newId, 
      type: null, 
      count: 1, 
      level: 1,
      sortOrder: buildings.length 
    };
    setBuildings([...buildings, newRow]);
  };

  const handleRemoveRow = (id: number) => {
    const updatedTableData = buildings.filter(row => row.id !== id);
    // Update sortOrder for remaining buildings
    const reorderedBuildings = updatedTableData.map((building, index) => ({
      ...building,
      sortOrder: index
    }));
    setBuildings(reorderedBuildings);
  };

  const handleUpdateRow = (row: Building) => {
    const updatedTableData = buildings.map(building => row.id === building.id ? row : building);
    setBuildings(updatedTableData);
    return updatedTableData;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = buildings.findIndex(b => b.id.toString() === active.id);
    const newIndex = buildings.findIndex(b => b.id.toString() === over.id);

    const reorderedBuildings = arrayMove(buildings, oldIndex, newIndex).map((building, index) => ({
      ...building,
      sortOrder: index
    }));

    setBuildings(reorderedBuildings);
  };

  const handleSplitBuilding = (building: Building) => {
    if (building.count <= 1) return; // Can't split a single building

    const firstHalf = Math.floor(building.count / 2);
    const secondHalf = building.count - firstHalf;

    // Update the current building with first half
    const updatedBuilding = { ...building, count: firstHalf };
    const updatedTableData = handleUpdateRow(updatedBuilding);

    // Add new building with second half
    const newId = updatedTableData.length > 0 ? updatedTableData[updatedTableData.length - 1].id + 1 : 1;
    const newBuilding: Building = {
      id: newId,
      type: building.type,
      count: secondHalf,
      level: building.level,
      sortOrder: updatedTableData.length
    };
    setBuildings([...updatedTableData, newBuilding]);
  };

  return (
    <div style={{ width: '100%', border: '4px solid black', padding: '4px' }}>
      <Flex className='hq-level'
        style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ paddingRight: '10px' }}>HQ Level</p>
        <NumberInput
          style={{ width: '60px' }}
          value={hq}
          onChange={(e) => setHq(+e)}
          min={totalBuildings}
        />
      </Flex>
      <ScrollArea h={500}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={buildings.map(b => b.id.toString())} strategy={verticalListSortingStrategy}>
            <Table>
              <Table.Tbody>
                {buildingRows}
              </Table.Tbody>
            </Table>
          </SortableContext>
        </DndContext>
        <Button
          disabled={addDisabled}
          onClick={handleAddRow}
        >+</Button>
      </ScrollArea>
    </div>
  )
};