"use client"

import { useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';
import Panzoom, { PanzoomObject } from "@panzoom/panzoom";
import { RiSettings3Fill } from "react-icons/ri";
import {
  Checkbox,
  Popover,
  UnstyledButton,
  Tooltip,
  Group,
  Stack,
  Text
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { MapModel, Position } from "./map.model";
import { weightToColor } from "@/utils/color.helper";
import "./map.scss";

// Types
interface CanvasProps {
  width: number;
  height: number;
}

interface MapSettings {
  showHeatmap: boolean;
  showGrid: boolean;
}

export interface MapProps {
  map: MapModel;
  wheelParentDepth?: number;
  mapScale?: number;
  tile?: Position;
  coordClicked: (x: number, y: number) => void;
  className?: string;
}

// Constants
const DEFAULT_SETTINGS: MapSettings = {
  showHeatmap: true,
  showGrid: false
};

const HEATMAP_GRADIENT = [
  { weight: 0, color: '#FFFFFF' }, // White
  { weight: 0.0001, color: '#00FF00' }, // Green
  { weight: 0.01, color: '#0000FF' }, // Blue
  { weight: 1, color: '#FF0000' }  // Red
];

/**
 * Custom hook to initialize and manage the panzoom functionality
 */
function usePanzoom(
  wheelParentDepth: number,
  mapScale: number
): React.MutableRefObject<PanzoomObject | null> {
  const panzoomRef = useRef<PanzoomObject | null>(null);

  useEffect(() => {
    const innerMap = document.getElementById('inner-map');
    if (!innerMap) return;

    const panzoomObj = Panzoom(innerMap, {
      maxScale: 8 / mapScale,
      contain: 'outside',
      canvas: true,
      roundPixels: false
    });

    // Set initial zoom
    setTimeout(() => panzoomObj.zoom(1 / mapScale));

    // Attach wheel event to appropriate parent element
    let wheelEventTarget = innerMap;
    for (let i = 0; i < wheelParentDepth; i++) {
      const parent = wheelEventTarget.parentElement;
      if (parent) {
        wheelEventTarget = parent;
      }
    }

    wheelEventTarget?.addEventListener('wheel', panzoomObj.zoomWithWheel);

    // Store the panzoom object in the ref for potential external access
    panzoomRef.current = panzoomObj;

    return () => {
      wheelEventTarget?.removeEventListener('wheel', panzoomObj.zoomWithWheel);
      panzoomObj.destroy();
    };
  }, [wheelParentDepth, mapScale]);

  return panzoomRef;
}

/**
 * Custom hook to manage canvas rendering and mouse interactions
 */
function useMapCanvas(
  map: MapModel,
  mapSettings: MapSettings,
  mapScale: number,
  tile?: Position,
  onTileClick?: (x: number, y: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement>(null);

  const [canvasProps, setCanvasProps] = useState<CanvasProps>({ width: 0, height: 0 });
  const [canvasHover, setCanvasHover] = useState<Position | null>(null);

  // Set up and resize canvas to match container
  useEffect(() => {
    if (!canvasRef.current || !mapDivRef.current) {
      console.error('Canvas or map container failed to load.');
      return;
    }

    // Keep canvas size matching div size
    const setCanvasDims = () => {
      const width = mapDivRef.current?.clientWidth || 0;
      const height = mapDivRef.current?.clientHeight || 0;
      setCanvasProps({
        width: Math.min(width, height),
        height: Math.min(width, height)
      });
    };

    setCanvasDims();
    window.addEventListener('resize', setCanvasDims);

    return () => {
      window.removeEventListener('resize', setCanvasDims);
    };
  }, []);

  // Set up mouse/touch interaction
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Calculate tile position from mouse/touch coordinates
    const updateHover = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      // Get the current mouse position relative to canvas
      const r = canvas.getBoundingClientRect();
      const scaleX = r.width / canvas.width;
      const scaleY = r.height / canvas.height;
      let x = (clientX - r.left) / scaleX;
      let y = (clientY - r.top) / scaleY;

      // Snap to the closest grid value
      x = Math.floor(x / (canvas.width / map.dimensions.width));
      y = Math.floor(y / (canvas.height / map.dimensions.height));

      setCanvasHover({ x, y });
    };

    canvas.addEventListener('mousemove', updateHover);
    canvas.addEventListener('touchstart', updateHover);
    canvas.addEventListener('mouseleave', () => setCanvasHover(null));

    return () => {
      canvas.removeEventListener('mousemove', updateHover);
      canvas.removeEventListener('touchstart', updateHover);
      canvas.removeEventListener('mouseleave', () => setCanvasHover(null));
    };
  }, [map.dimensions.width, map.dimensions.height]);

  // Tile click handler with double-click detection
  const handleTileClick = useCallback(() => {
    if (!canvasHover || !onTileClick) return;

    const currentX = canvasHover.x;
    const currentY = canvasHover.y;

    // Check if this is a double click on the same tile
    if (doubleClickRef.current &&
      lastClickPosRef.current.x === currentX &&
      lastClickPosRef.current.y === currentY) {
      onTileClick(currentX, currentY);
      return;
    }

    // Store current position and set double click flag
    lastClickPosRef.current = { x: currentX, y: currentY };
    doubleClickRef.current = true;

    setTimeout(() => {
      doubleClickRef.current = false;
    }, 500);
  }, [canvasHover, onTileClick]);

  // Use refs to track double click state and position across renders
  const doubleClickRef = useRef(false);
  const lastClickPosRef = useRef({ x: -1, y: -1 });

  // Draw canvas when data changes
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.reset();

    const tileWidth = canvasProps.width / map.dimensions.width;
    const tileHeight = canvasProps.height / map.dimensions.height;

    // Draw map background image if available
    if (map?.image && mapImageRef?.current) {
      ctx.drawImage(
        mapImageRef.current,
        0, 0,
        map.image.width, map.image.height,
        0, 0,
        canvasProps.width, canvasProps.height
      );
    }

    // Draw heatmap overlay if enabled
    if (mapSettings.showHeatmap) {
      for (let y = 0; y < map.dimensions.height; y++) {
        for (let x = 0; x < map.dimensions.width; x++) {
          const tileData = map.tiles[x]?.[y];
          if (!tileData?.weight) continue;

          const canvasX = x * tileWidth, canvasY = y * tileHeight;
          const color = weightToColor(tileData.weight, HEATMAP_GRADIENT);

          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6;
          ctx.fillRect(canvasX, canvasY, tileWidth, tileHeight);
        }
      }
    }

    // Draw grid if enabled
    if (mapSettings.showGrid) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5 * mapScale;

      for (let x = 0; x <= map.dimensions.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileWidth, 0);
        ctx.lineTo(x * tileWidth, canvasProps.height);
        ctx.stroke();
      }

      for (let y = 0; y <= map.dimensions.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileHeight);
        ctx.lineTo(canvasProps.width, y * tileHeight);
        ctx.stroke();
      }
    }

    // Draw hover highlight
    ctx.lineWidth = mapScale;
    if (canvasHover) {
      ctx.globalAlpha = 1;
      ctx.setLineDash([2 * mapScale, 1 * mapScale]);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(
        canvasHover.x * tileWidth,
        canvasHover.y * tileHeight,
        tileWidth,
        tileHeight
      );
    }

    // Draw selected tile highlight
    if (tile) {
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(
        tile.x * tileWidth,
        tile.y * tileHeight,
        tileWidth,
        tileHeight
      );
    }
  }, [canvasProps, canvasHover, map, mapSettings, mapScale, tile]);

  return {
    canvasRef,
    mapDivRef,
    mapImageRef,
    handleTileClick,
    canvasProps,
    canvasHover
  };
}

export default function MapComponent({
  map,
  coordClicked,
  tile,
  wheelParentDepth = 0,
  mapScale = 1,
  className = ''
}: MapProps) {
  const [mapSettings, setMapSettings] = useState<MapSettings>(DEFAULT_SETTINGS);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Initialize panzoom
  const panzoomRef = usePanzoom(wheelParentDepth, mapScale);

  // Initialize canvas and interactions
  const {
    canvasRef,
    mapDivRef,
    mapImageRef,
    handleTileClick,
    canvasProps
  } = useMapCanvas(map, mapSettings, mapScale, tile, coordClicked);

  return (
    <div className={`map-parent ${className}`}>
      <div className="map-container">
        <div
          id="inner-map"
          className="map"
          ref={mapDivRef}
          style={{
            width: `${100 * mapScale}%`,
            height: `${100 * mapScale}%`,
            backgroundColor: 'rgba(0, 0, 0, .4)'
          }}
        >
          {map?.image && (
            <Image
              ref={mapImageRef}
              src={map.image}
              priority
              alt='Map background'
              style={{ display: 'none' }}
            />
          )}

          <canvas
            ref={canvasRef}
            id='map-canvas'
            width={canvasProps.width}
            height={canvasProps.height}
            onClick={handleTileClick}
            aria-label="Interactive game map"
          />
        </div>
      </div>

      <Text className="map-instructions" size="sm" color="dimmed">
        {isMobile ? 'Pinch to zoom. Double tap to select tile' : 'Scroll to zoom. Double click to select tile'}
      </Text>

      <div className="map-settings">
        <Popover width={200} position="bottom-end" shadow="md">
          <Popover.Target>
            <Tooltip label="Map Settings">
              <UnstyledButton aria-label="Map settings">
                <RiSettings3Fill size={20} />
              </UnstyledButton>
            </Tooltip>
          </Popover.Target>

          <Popover.Dropdown>
            <Stack gap="xs">
              <Checkbox
                checked={mapSettings.showHeatmap}
                label='Show Heatmap'
                onChange={(e) => setMapSettings({
                  ...mapSettings,
                  showHeatmap: e.currentTarget.checked
                })}
              />

              <Checkbox
                checked={mapSettings.showGrid}
                label='Show Grid'
                onChange={(e) => setMapSettings({
                  ...mapSettings,
                  showGrid: e.currentTarget.checked
                })}
              />

              <Group justify="center" mt="xs">
                <UnstyledButton
                  onClick={() => panzoomRef.current?.zoom(1 / mapScale, { animate: true })}
                  className="reset-button"
                >
                  Reset View
                </UnstyledButton>
              </Group>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </div>
    </div>
  );
}