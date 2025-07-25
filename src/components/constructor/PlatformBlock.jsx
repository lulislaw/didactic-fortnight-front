import { Group, Line } from 'react-konva';
import React from 'react';

function PlatformBlock({ floorWidth, originX, centerY }) {
  const pWidth = floorWidth + 80;
  const pDepth = floorWidth / 4 + 20;
  const pHeight = 5;
  const top = [pWidth / 2, 0, pWidth, pDepth, pWidth / 2, pDepth * 2, 0, pDepth];
  const left = [0, pDepth, pWidth / 2, pDepth * 2, pWidth / 2, pDepth * 2 + pHeight, 0, pDepth + pHeight];
  const right = [pWidth, pDepth, pWidth / 2, pDepth * 2, pWidth / 2, pDepth * 2 + pHeight, pWidth, pDepth + pHeight];
  const offsetX = (pWidth - floorWidth) / 2;

  return (
    <Group x={originX - offsetX} y={centerY}>
      <Line points={left} closed stroke="#555" fill="#777"/>
      <Line points={right} closed stroke="#555" fill="#555"/>
      <Line points={top} closed stroke="#333" fill="#999"/>
    </Group>
  );
}

export default PlatformBlock;