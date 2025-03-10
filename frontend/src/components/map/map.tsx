"use client"

import "./map.scss";

import Panzoom from "@panzoom/panzoom";
import { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { weightToColor } from "@/utils/color.helper";
import { RiSettings3Fill } from "react-icons/ri";
import { MapModel } from "./map.model";
import { Checkbox, Popover, UnstyledButton } from "@mantine/core";

interface CanvasProps {
  width: number,
  height: number
}

interface MapSettings {
  showHeatmap: boolean
}

export interface MapProps {
  map: MapModel,
  wheelParentDepth?: number,
  mapScale?: number,
  tile?: { x: number, y: number },
  coordClicked: (x: number, y: number) => void
}

function usePanzoom(wheelParentDepth: number, mapScale: number) {
  // Use PanZoom library to allow pan and zoom
  useEffect(() => {
    const innerMap = document.getElementById('inner-map');
    if (!innerMap) return;

    const panzoomObj = Panzoom(innerMap, {
      maxScale: 8 / mapScale,
      contain: 'outside',
      canvas: true,
      roundPixels: false
    });

    setTimeout(() => panzoomObj.zoom(1 / mapScale));

    let wheelEventTarget = innerMap;
    for (let i = 0; i < wheelParentDepth; i++) {
      const parent = wheelEventTarget.parentElement;
      if (parent) {
        wheelEventTarget = parent;
      }
    }
    wheelEventTarget?.addEventListener('wheel', panzoomObj.zoomWithWheel);
  }, []);
}

const heatmapGradient = [
  { weight: 0, color: '#FFFFFF' }, // White
  { weight: 0.0001, color: '#00FF00' }, // Green
  { weight: 0.01, color: '#0000FF' }, // Blue
  { weight: 1, color: '#FF0000' }  // Red
];

export default function MapComponent(props: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement>(null);

  const [mapSettings, setMapSettings] = useState<MapSettings>({ showHeatmap: true });
  const [canvasProps, setCanvasProps] = useState<CanvasProps>({ width: 0, height: 0 });
  const [canvasHover, setCanvasHover] = useState<{ x: number, y: number } | null>(null);

  const { map, coordClicked, tile } = props;
  const wheelParentDepth = props?.wheelParentDepth ?? 0;
  const mapScale = props?.mapScale ?? 1;

  // Capture click events to notify caller which tile is clicked.
  let doubleClick = false;
  const tileClicked = () => {
    if (doubleClick && canvasHover) {
      coordClicked(canvasHover.x, canvasHover.y);
    }
    doubleClick = true;
    setTimeout(() => {
      doubleClick = false;
    }, 500);
  };

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current) {
      throw Error('Canvas failed to load.');
    }
    if (!mapDivRef.current) {
      throw Error('Map container failed to load.');
    }
    const canvas = canvasRef.current;

    // Keep canvas size matching div size.
    const setCanvasDims = () => {
      const width = mapDivRef.current?.clientWidth || 0;
      const height = mapDivRef.current?.clientHeight || 0;
      setCanvasProps({
        width: Math.min(width, height),
        height: Math.min(width, height)
      });
    }

    setCanvasDims();
    window.addEventListener('resize', setCanvasDims);

    // Setup on click and on hover events
    const updateHover = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      // Get the current mouse position
      const r = canvas.getBoundingClientRect();
      // Scale the x and y based on scaled canvas width and height.
      const scaleX = r.width / canvas.width;
      const scaleY = r.height / canvas.height;
      // Get relative x and y based on position of the canvas and scale values
      let x = (clientX - r.left) / scaleX, y = (clientY - r.top) / scaleY;

      // Snap to the closes grid value based on dimensions
      x = Math.floor(x / (canvas.width / map.dimensions.x));
      y = Math.floor(y / (canvas.height / map.dimensions.y));

      setCanvasHover({ x, y });
    }

    canvas.onmousemove = updateHover;
    canvas.ontouchstart = updateHover;

    canvas.onmouseleave = () => setCanvasHover(null);

  }, []);

  // Draw on the canvas when filter data updates
  useEffect(() => {
    if (canvasRef.current) {
      // Get and clear the current canvas context.
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.reset();

      const tileWidth = canvasProps.width / map.dimensions.x;
      const tileHeight = canvasProps.height / map.dimensions.y;

      if (map?.image && mapImageRef?.current) {
        ctx.drawImage(mapImageRef.current, 0, 0, map.image.width, map.image.height, 0, 0, canvasProps.width, canvasProps.height);
      }

      if (mapSettings.showHeatmap) {
        // Set up heatmap grid based on prop input
        for (let y = 0; y < map.dimensions.y; y++) {
          for (let x = 0; x < map.dimensions.x; x++) {
            const tileData = map.tiles[x]?.[y];

            const canvasX = x * tileWidth, canvasY = y * tileHeight;

            if (tileData?.weight) {
              const color = weightToColor(tileData.weight || 0, heatmapGradient);

              ctx.fillStyle = color;
              ctx.globalAlpha = 0.6;
              ctx.fillRect(canvasX, canvasY, tileWidth, tileHeight);
            }
          }
        }
      }

      ctx.lineWidth = mapScale;
      if (canvasHover) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([2 * mapScale, 1 * mapScale]);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(canvasHover.x * tileWidth, canvasHover.y * tileHeight, tileWidth, tileHeight);
      }
      if (tile) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(tile.x * tileWidth, tile.y * tileHeight, tileWidth, tileHeight);
      }
    }
  }, [canvasProps, canvasHover, map, mapSettings]);

  usePanzoom(wheelParentDepth, mapScale);

  return (
    <div className="map-parent">

      <div className="map-container">
        <div id="inner-map" className="map" ref={mapDivRef}
          style={{
            width: `${100 * mapScale}%`,
            height: `${100 * mapScale}%`,
            backgroundColor: 'rgba(0, 0, 0, .4)'
          }}>
          {map?.image &&
            <Image ref={mapImageRef} src={map.image} priority alt='' style={{ display: 'none' }} />}
          <canvas ref={canvasRef}
            id='map-canvas'
            width={canvasProps.width}
            height={canvasProps.height}
            onClick={tileClicked} onTouchStart={tileClicked} />
        </div>
      </div>
      <div className="map-instructions">Scroll/Pinch to zoom. Double click map to filter by tile</div>
      <div className="map-settings">
        <Popover>
          <Popover.Target>
            <UnstyledButton size="md">
              <RiSettings3Fill />
            </UnstyledButton>
          </Popover.Target>
          <Popover.Dropdown className="settings-popover">
            <Checkbox
              checked={mapSettings.showHeatmap}
              label='Show Heatmap'
              onChange={(e) => setMapSettings({ ...mapSettings, showHeatmap: e.currentTarget.checked })} />
          </Popover.Dropdown>
        </Popover>
      </div>
    </div>
  )
};