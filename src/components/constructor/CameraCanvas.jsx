// src/components/constructor/CameraCanvas.jsx
import React, { useState } from 'react';
import {
  Stage,
  Layer,
  Group,
  Image as KonvaImage,
  Arc,
  Circle,
  Rect,
  Line,
  Label,
  Tag,
  Text,
} from 'react-konva';
import useImage from 'use-image';
import PropTypes from 'prop-types';

// data‑URI MUI‑SVG CameraAlt
const cameraIconSrc = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#000000" d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12h20V7c0-1.1-.9-2-2-2zM12 17
      c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
  </svg>
`)}`;

export default function CameraCanvas({
                                       imageSrc,
                                       width,
                                       height,
                                       cameras,
                                       zones = [],
                                       selectedZoneId,
                                       onSelectZone,
                                       onZonePointDrag,
                                       onCameraDragEnd,
                                       onSelectCamera,
                                       onCameraPropertyChange,
    scaleCoef,
                                     }) {
  const [bgImage] = useImage(imageSrc);
  const [cameraImg] = useImage(cameraIconSrc);
  const [hoverLabel, setHoverLabel] = useState(null);

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* фон */}
        <Rect x={0} y={0} width={width} height={height} fill="#fff" listening={false}/>
        {bgImage && (
          <KonvaImage
            image={bgImage}
            x={0}
            y={0}
            width={width}
            height={height}
            listening={false}
          />
        )}

        {/* зоны */}
        {zones.map(zone => (
          <Group
            key={zone.id}
            onClick={() => onSelectZone(zone.id)}
          >
            <Line
              points={zone.points}
              closed
              fill={zone.fill || 'rgba(255,0,0,0.2)'}
              stroke={zone.id === selectedZoneId ? 'red' : 'gray'}
              strokeWidth={2}
              // включаем события hover
              onMouseEnter={e => {
                const rect = e.target.getClientRect();
                setHoverLabel({
                  text: `Зона #${zone.id}`,
                  x: rect.x + rect.width / 2,
                  y: rect.y,
                });
              }}
              onMouseLeave={() => setHoverLabel(null)}
            />
            {zone.points.reduce((acc, _, idx) => {
              if (idx % 2 !== 0) return acc;
              const x = zone.points[idx];
              const y = zone.points[idx + 1];
              const ptIndex = idx / 2;
              acc.push(
                <Circle
                  key={`${zone.id}-pt${ptIndex}`}
                  x={x}
                  y={y}
                  radius={5}
                  fill={zone.id === selectedZoneId ? 'white' : 'lightgray'}
                  stroke={zone.id === selectedZoneId ? 'red' : 'gray'}
                  strokeWidth={1}
                  draggable={zone.id === selectedZoneId}
                  dragBoundFunc={pos => ({
                    x: Math.max(0, Math.min(pos.x, width)),
                    y: Math.max(0, Math.min(pos.y, height)),
                  })}
                  onDragStart={() => setHoverLabel(null)}
                  onDragMove={e =>
                    onZonePointDrag(zone.id, ptIndex, e.target.x(), e.target.y())
                  }
                />
              );
              return acc;
            }, [])}
          </Group>
        ))}

        {/* камеры */}
        {cameras.map(cam => {
          const half = cam.size / 2;
          return (
            <Group
              key={cam.id}
              x={cam.x}
              y={cam.y}
              draggable
              onClick={() => onSelectCamera(cam.id)}
              onTap={() => onSelectCamera(cam.id)}
              onDragStart={e => {
                setHoverLabel(null);
                onSelectCamera(cam.id);
              }}
              onDragMove={e => {
                const x = e.target.x();
                const y = e.target.y();
                onCameraPropertyChange(cam.id, 'x', x);
                onCameraPropertyChange(cam.id, 'y', y);
              }}
              onDragEnd={e =>
                onCameraDragEnd(cam.id, e.target.x(), e.target.y())
              }
              dragBoundFunc={pos => ({
                x: Math.max(0, Math.min(pos.x, width - cam.size / (1 / scaleCoef))),
                y: Math.max(0, Math.min(pos.y, height - cam.size / (1 / scaleCoef))),
              })}
              onMouseEnter={e => {
                const pos = e.target.getAbsolutePosition();
                setHoverLabel({
                  text: `Камера #${cam.id}`,
                  x: pos.x + half,
                  y: pos.y,
                });
              }}
              onMouseLeave={() => setHoverLabel(null)}
            >
              <Rect x={0} y={0} width={cam.size} height={cam.size} fill="transparent"/>
              <Arc
                x={half}
                y={half}
                innerRadius={0}
                outerRadius={cam.viewRadius}
                angle={cam.viewAngle}
                rotation={cam.rotation}
                fill="rgba(0,0,255,0.2)"
                listening={false}
              />
              <Circle x={half} y={half} radius={half + 2} fill="#fff" listening={false}/>
              {cameraImg && (
                <KonvaImage image={cameraImg} x={0} y={0} width={cam.size} height={cam.size}/>
              )}
            </Group>
          );
        })}

        {/* всплывашка */}
        {hoverLabel && (
          <Label x={hoverLabel.x} y={hoverLabel.y - 15}>
            <Tag fill="black" opacity={0.75} cornerRadius={3}/>
            <Text text={hoverLabel.text} fontSize={12} fill="white" padding={4}/>
          </Label>
        )}
      </Layer>
    </Stage>
  );
}

CameraCanvas.propTypes = {
  imageSrc: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  cameras: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      rotation: PropTypes.number,
      viewRadius: PropTypes.number,
      viewAngle: PropTypes.number,
      size: PropTypes.number,
    })
  ).isRequired,

  zones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      points: PropTypes.arrayOf(PropTypes.number).isRequired,
      fill: PropTypes.string,
    })
  ),

  selectedZoneId: PropTypes.number,
  onSelectZone: PropTypes.func.isRequired,
  onZonePointDrag: PropTypes.func.isRequired,
  onCameraDragEnd: PropTypes.func.isRequired,
  onSelectCamera: PropTypes.func.isRequired,
  onCameraPropertyChange: PropTypes.func.isRequired,
};
