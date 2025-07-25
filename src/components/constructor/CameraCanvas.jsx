// src/components/constructor/CameraCanvas.jsx
import React, {useState, useRef, useEffect} from 'react';
import {
  Stage, Layer, Group, Image as KonvaImage,
  Arc, Circle, Rect, Line, Label, Tag, Text
} from 'react-konva';
import useImage from 'use-image';
import PropTypes from 'prop-types';

// data‑URI иконки камеры
const cameraIconSrc = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="#000" d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2
      .9-2 2v12h20V7c0-1.1-.9-2-2-2zM12 17
      c-2.76 0-5-2.24-5-5s2.24-5 5-5 5
      2.24 5 5-2.24 5-5 5z"/>
  </svg>
`)}`;

export default function CameraCanvas({
                                       imageSrc,
                                       cameras,
                                       zones = [],
                                       selectedZoneId,
                                       onSelectZone,
                                       onZonePointDrag,
                                       onCameraDragEnd,
                                       onSelectCamera,
                                       onCameraPropertyChange,
                                       canvasSize,
                                     }) {
  const containerRef = useRef();
  const [size, setSize] = useState({width: 0, height: 0});
  const [bgImage] = useImage(imageSrc);
  const [cameraImg] = useImage(cameraIconSrc);
  const [hoverLabel, setHoverLabel] = useState(null);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([ent]) => {
      const {width, height} = ent.contentRect;
      setSize({width, height});
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const {width, height} = size;
  const maxDim = Math.max(width, height);

  // вспомогательные конвертеры
  const toNormX = cam => cam.xNorm != null ? cam.xNorm : (cam.x || 0) / (width || 1);
  const toNormY = cam => cam.yNorm != null ? cam.yNorm : (cam.y || 0) / (height || 1);
  const toNormRadius = cam => cam.viewRadiusNorm != null
      ? cam.viewRadiusNorm
      : (cam.viewRadius || 0) / maxDim;
  const toNormSize = cam => cam.sizeNorm != null
      ? cam.sizeNorm
      : (cam.size || 0) / maxDim;
  const zonePointsNorm = zone => zone.pointsNorm != null
      ? zone.pointsNorm
      : zone.points.map((v, i) => (v / (i % 2 === 0 ? width : height)));


  return (
      <div ref={containerRef} style={{
        width: canvasSize,
        height: canvasSize,
        aspectRatio: '1/1',
        position: 'relative',
      }}>
        <Stage width={width} height={height}>
          <Layer>
            <Rect x={0} y={0} width={width} height={height} fill="#fff" listening={false}/>
            {bgImage && (
                <KonvaImage image={bgImage} x={0} y={0} width={width} height={height} listening={false}/>
            )}

            {/* Зоны */}
            {zones.map(zone => {
              const ptsNorm = zonePointsNorm(zone);
              const pts = ptsNorm.map((v, i) =>
                  i % 2 === 0 ? v * width : v * height
              );
              return (
                  <Group key={zone.id}
                         onClick={() => onSelectZone(zone.id)}
                         onMouseEnter={e => {
                           const r = e.target.getClientRect();
                           setHoverLabel({text: `Зона #${zone.id}`, x: r.x + r.width / 2, y: r.y});
                         }}
                         onMouseLeave={() => setHoverLabel(null)}
                  >
                    <Line points={pts} closed fill={zone.fill || 'rgba(255,0,0,0.2)'}
                          stroke={zone.id === selectedZoneId ? 'red' : 'gray'} strokeWidth={2}/>
                    {pts.filter((_, i) => i % 2 === 0).map((x, i) => {
                      const y = pts[i * 2 + 1];
                      return <Circle key={i} x={x} y={y} radius={5}
                                     fill={zone.id === selectedZoneId ? 'white' : 'lightgray'}
                                     stroke={zone.id === selectedZoneId ? 'red' : 'gray'}
                                     strokeWidth={1}
                                     draggable={zone.id === selectedZoneId}
                                     onDragStart={() => setHoverLabel(null)}
                                     dragBoundFunc={pos => ({
                                       x: Math.max(0, Math.min(pos.x, width)),
                                       y: Math.max(0, Math.min(pos.y, height)),
                                     })}
                                     onDragMove={e => {
                                       const nx = e.target.x() / width;
                                       const ny = e.target.y() / height;
                                       onZonePointDrag(zone.id, i, nx, ny);
                                     }}/>
                    })}
                  </Group>
              );
            })}

            {/* Камеры */}
            {cameras.map(cam => {
              const xNorm = toNormX(cam);
              const yNorm = toNormY(cam);
              const rNorm = toNormRadius(cam);
              const sNorm = toNormSize(cam);
              const x = xNorm * width;
              const y = yNorm * height;
              const viewR = rNorm * maxDim;
              const sizePx = sNorm * maxDim;
              const half = sizePx / 2;

              return (
                  <Group key={cam.id} x={x} y={y}
                         draggable
                         onClick={() => onSelectCamera(cam.id)}
                         onDragStart={e => {
                           setHoverLabel(null);
                           onSelectCamera(cam.id);
                         }}
                         onDragMove={e => {
                           const nx = e.target.x() / width, ny = e.target.y() / height;
                           onCameraPropertyChange(cam.id, 'xNorm', nx);
                           onCameraPropertyChange(cam.id, 'yNorm', ny);
                         }}
                         onDragEnd={e => {
                           const nx = e.target.x() / width, ny = e.target.y() / height;
                           onCameraDragEnd(cam.id, nx, ny);
                         }}
                         dragBoundFunc={pos => ({
                           x: Math.max(0, Math.min(pos.x, width - sizePx)),
                           y: Math.max(0, Math.min(pos.y, height - sizePx)),
                         })}
                         onMouseEnter={e => {
                           setHoverLabel({text: `Камера #${cam.id}`, x: x + half, y});
                         }}
                         onMouseLeave={() => setHoverLabel(null)}
                  >
                    <Rect x={0} y={0} width={sizePx} height={sizePx} fill="transparent"/>
                    <Arc x={half} y={half}
                         innerRadius={0} outerRadius={viewR}
                         angle={cam.viewAngle} rotation={cam.rotation}
                         fill="rgba(0,0,255,0.2)" listening={false}/>
                    <Circle x={half} y={half} radius={half + 2} fill="#fff" listening={false}/>
                    {cameraImg && <KonvaImage image={cameraImg} x={0} y={0} width={sizePx} height={sizePx}/>}
                  </Group>
              );
            })}

            {/* Всплывашка */}
            {hoverLabel && (
                <Label x={hoverLabel.x} y={hoverLabel.y - 20}>
                  <Tag fill="black" opacity={0.7} cornerRadius={4}/>
                  <Text text={hoverLabel.text} fontSize={12} fill="white" padding={4}/>
                </Label>
            )}
          </Layer>
        </Stage>
      </div>
  );
}

CameraCanvas.propTypes = {
  imageSrc: PropTypes.string,
  cameras: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    // Нормализованные или абсолютные — будет обработано
    x: PropTypes.number,
    y: PropTypes.number,
    xNorm: PropTypes.number,
    yNorm: PropTypes.number,
    rotation: PropTypes.number.isRequired,
    viewRadius: PropTypes.number,
    size: PropTypes.number,
    viewRadiusNorm: PropTypes.number,
    sizeNorm: PropTypes.number,
    viewAngle: PropTypes.number.isRequired,
  })).isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    points: PropTypes.arrayOf(PropTypes.number),
    pointsNorm: PropTypes.arrayOf(PropTypes.number),
    fill: PropTypes.string,
  })),
  selectedZoneId: PropTypes.number,
  onSelectZone: PropTypes.func.isRequired,
  onZonePointDrag: PropTypes.func.isRequired,
  onCameraDragEnd: PropTypes.func.isRequired,
  onSelectCamera: PropTypes.func.isRequired,
  onCameraPropertyChange: PropTypes.func.isRequired,
};
