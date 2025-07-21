import { Group, Line, Text } from 'react-konva';
import React from 'react';
import {Typography} from "@mui/material";

function FloorBlock({
                      id,
                      isSelected,
                      isHovered,
                      onClick,
                      onMouseEnter,
                      onMouseLeave,
                      floorWidth,
                      floorHeight,
                      originX,
                      groupY
                    }) {
  const strokeColor = isSelected ? '#f55' : isHovered ? '#55f' : '#555';
  const strokeWidth = isSelected ? 1 : isHovered ? 1 : 1;
  const depth = floorWidth / 4;
  const half = floorWidth / 2;
  const shapeHeight = floorHeight;

  // Грани изометрического блока
  const top = [half, 0, floorWidth, depth, half, depth * 2, 0, depth];
  const left = [0, depth, half, depth * 2, half, depth * 2 + floorHeight, 0, depth + floorHeight];
  const right = [floorWidth, depth, half, depth * 2, half, depth * 2 + floorHeight, floorWidth, depth + floorHeight];

  return (
    <Group
      x={originX}
      y={groupY - id * shapeHeight}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      cursor="pointer"
    >
      <Line points={left} closed stroke={strokeColor} strokeWidth={strokeWidth} fill="#bbb"/>
      <Line points={right} closed stroke={strokeColor} strokeWidth={strokeWidth} fill="#777"/>
      <Line points={top} closed stroke={strokeColor} strokeWidth={strokeWidth} fill="#ddd"/>
      <Text text={String(id)} x={floorWidth + 10} y={40} fontSize={14} fill="#002"/>
    </Group>
  );
}

export default  FloorBlock