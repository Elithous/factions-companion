"use client"

import "./map.scss";

import Panzoom from "@panzoom/panzoom";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { MapModel } from "./map.model";
import { weightToColor } from "@/utils/color.helper";
import { Button, Icon, Stack } from "@chakra-ui/react";
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from "../ui/popover";
import { RiSettings3Fill } from "react-icons/ri";
import { Checkbox } from "../ui/checkbox";

interface CanvasProps {
  width: number,
  height: number
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

    const panzoom = Panzoom(innerMap, {
      maxScale: 8 / mapScale,
      startScale: 1 / mapScale,
      contain: 'outside'
    });

    let wheelEventTarget = innerMap;
    for (let i = 0; i < wheelParentDepth; i++) {
      const parent = wheelEventTarget.parentElement;
      if (parent) {
        wheelEventTarget = parent;
      }
    }
    wheelEventTarget?.addEventListener('wheel', panzoom.zoomWithWheel);
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

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapStyles, setMapStyles] = useState<CSSProperties>({});
  const [canvasProps, setCanvasProps] = useState<CanvasProps>({ width: 0, height: 0 });
  const [canvasHover, setCanvasHover] = useState<{ x: number, y: number } | null>(null);

  const { map, coordClicked, tile } = props;
  const wheelParentDepth = props?.wheelParentDepth ?? 0;
  const mapScale = props?.mapScale ?? 1;

  // Capture click events to notify caller which tile is clicked.
  let doubleClick = false;
  const tileClicked = () => {
    console.log('Clicked');
    if (doubleClick && canvasHover) {
      console.log(`${canvasHover.x}, ${canvasHover.y}`);
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
      setCanvasProps({
        width: (mapDivRef.current?.clientWidth || 0),
        height: (mapDivRef.current?.clientHeight || 0)
      });
    }

    setCanvasDims();
    window.addEventListener('resize', setCanvasDims);

    // Setup on click and on hover events
    canvas.onmousemove = (e) => {
      // Get the current mouse position
      const r = canvas.getBoundingClientRect();
      // Scale the x and y based on scaled canvas width and height.
      const scaleX = r.width / canvas.width;
      const scaleY = r.height / canvas.height;
      // Get relative x and y based on position of the canvas and scale values
      let x = (e.clientX - r.left) / scaleX, y = (e.clientY - r.top) / scaleY;

      // Snap to the closes grid value based on dimensions
      x = Math.floor(x / (canvas.width / map.dimensions.x));
      y = Math.floor(y / (canvas.height / map.dimensions.y));

      setCanvasHover({ x, y });
    }
    canvas.onmouseleave = () => setCanvasHover(null);
  }, []);

  // Keep map image up to date
  useEffect(() => {
    const backgroundStyles: CSSProperties = {};
    if (map.image) {
      backgroundStyles.backgroundImage = `url(${map.image.src})`;
    } else {
      backgroundStyles.backgroundColor = 'black';
      backgroundStyles.opacity = '40%';
    }
    setMapStyles(backgroundStyles);
  }, [map.image]);

  // Draw on the canvas when filter data updates
  useEffect(() => {
    if (canvasRef.current) {
      // Get and clear the current canvas context.
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.reset();

      const width = canvasProps.width / map.dimensions.x;
      const height = canvasProps.height / map.dimensions.y;

      if (showHeatmap) {
        // Set up heatmap grid based on prop input
        for (let y = 0; y < map.dimensions.y; y++) {
          for (let x = 0; x < map.dimensions.x; x++) {
            const tileData = map.tiles[x]?.[y];

            const canvasX = x * width, canvasY = y * height;

            if (tileData?.weight) {
              const color = weightToColor(tileData.weight || 0, heatmapGradient);

              ctx.fillStyle = color;
              ctx.globalAlpha = 0.6;
              ctx.fillRect(canvasX, canvasY, width, height);
            }
          }
        }
      }

      ctx.lineWidth = mapScale;
      if (canvasHover) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([2 * mapScale, 1 * mapScale]);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(canvasHover.x * width, canvasHover.y * height, width, height);
      }
      if (tile) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(tile.x * width, tile.y * height, width, height);
      }
    }
  }, [canvasProps, canvasHover, map, showHeatmap]);

  usePanzoom(wheelParentDepth, mapScale);

  return (
    <div className="map-parent">

      <div className="map-container">
        <div id="inner-map" className="map" ref={mapDivRef}
          style={{
            ...mapStyles,
            width: `${100 * mapScale}%`,
            height: `${100 * mapScale}%`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%'
          }}>
          <canvas ref={canvasRef} width={canvasProps.width} height={canvasProps.height} id='map-canvas' onClick={tileClicked}/>
        </div>
      </div>
      <div className="map-instructions">Scroll/Pinch to zoom. Double click map to filter by tile</div>
      <div className="map-settings">
        <PopoverRoot>
          <PopoverTrigger asChild>
            <Button size="md" variant="outline">
              <Icon asChild>
                <RiSettings3Fill />
              </Icon>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody className="settings-popover" outline={"2px solid black"}>
              <Stack gap="4">
                <Checkbox variant='subtle'
                  checked={showHeatmap}
                  onCheckedChange={(e) => setShowHeatmap(!!e.checked)}>
                  Show Heatmap
                </Checkbox>
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>
      </div>
    </div>
  )
};