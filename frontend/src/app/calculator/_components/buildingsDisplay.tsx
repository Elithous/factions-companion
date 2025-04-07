"use client"

import { Button, CloseButton, Flex, NumberInput, ScrollArea, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import BuildingsComponent from './building';
import { Building } from '@/utils/game/building.model';

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

  useEffect(() => {
    const rows = buildings.map((building) => (
      <Table.Tr key={building.id}>
        <Table.Td>
          <BuildingsComponent
            data={building}
            updateData={handleUpdateRow}
            disableCount={addDisabled} />
        </Table.Td>
        <Table.Td>
          <Button
            bg="var(--orange-900)"
            variant="subtle"
            size="xs"
            disabled={building.count <= 1}
            onClick={() => handleSplitBuilding(building)}
            style={{ marginRight: '4px' }}
          >
            Split
          </Button>
          <CloseButton
            style={{ color: 'red', margin: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            onClick={() => handleRemoveRow(building.id)}
          />
        </Table.Td>
      </Table.Tr>
    ));
    setBuildingRows(rows);
  }, [buildings, addDisabled]);

  const handleAddRow = () => {
    const newId = buildings.length > 0 ? buildings[buildings.length - 1].id + 1 : 1;
    const newRow: Building = { id: newId, type: null, count: 1, level: 1 };
    setBuildings([...buildings, newRow]);
  };

  const handleRemoveRow = (id: number) => {
    const updatedTableData = buildings.filter(row => row.id !== id);
    setBuildings(updatedTableData);
  };

  const handleUpdateRow = (row: Building) => {
    const updatedTableData = buildings.map(building => row.id === building.id ? row : building);
    setBuildings(updatedTableData);
    return updatedTableData;
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
      level: building.level
    };
    setBuildings([...updatedTableData, newBuilding]);
  };

  return (
    <div
      style={{ width: '100%', border: '4px solid black', padding: '4px' }}>
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
        <Table>
          <Table.Tbody>
            {buildingRows}
          </Table.Tbody>
        </Table>
        <Button
          disabled={addDisabled}
          onClick={handleAddRow}
        >+</Button>
      </ScrollArea>
    </div>
  )
};