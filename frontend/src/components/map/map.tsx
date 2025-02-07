"use client"

import "./map.css";

import Panzoom from "@panzoom/panzoom";
import { MouseEvent, useEffect } from "react";
import MapModel from "./map.model";

function usePanzoom(wheelParentDepth: number) {
  // Use PanZoom library to allow pan and zoom
  useEffect(() => {
    const innerMap = document.getElementById('inner-map');
    if (!innerMap) return;

    const panzoom = Panzoom(innerMap, {
      maxScale: 8,
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

export default function MapComponent(props: {
  map: MapModel,
  wheelParentDepth?: number,
  tile: { x: number, y: number },
  coordClicked: (x: number, y: number) => void
}) {
  const { map, coordClicked, tile } = props;
  const wheelParentDepth = props?.wheelParentDepth ?? 0

  // Capture click events to notify caller which tile is clicked.
  let doubleClick = false;
  const tileClicked = (e: MouseEvent) => {
    if (doubleClick) {
      doubleClicked(e);
    }
    doubleClick = true;
    setTimeout(() => {
      doubleClick = false;
    }, 300);
  }

  const doubleClicked = (e: MouseEvent) => {
    if (!e) return;
    const id = e.currentTarget.id;
    if (!id) return;
    const [x, y] = id.split(',');
    if (Number.isNaN(parseInt(x)) || Number.isNaN(parseInt(y))) return;
    coordClicked(parseInt(x), parseInt(y));
  }

  // Set up map grid based on prop input
  const mapArray = [];
  for (let y = 0; y < map.dimensions.y; y++) {
    for (let x = 0; x < map.dimensions.x; x++) {
      let mapClass = 'map-square';
      mapClass += tile?.x === x && tile?.y === y ? ' selected' : '';

      mapArray.push(
        <div id={`${x},${y}`}
          className={mapClass}
          key={(y * map.dimensions.y) + x}
          style={{ gridRow: y + 1, gridColumn: x + 1 }}
          onClick={tileClicked}>
        </div>
      );
    }
  }

  usePanzoom(wheelParentDepth);

  return (
    <div className="map-container">
      <div id="inner-map" className="map"
        style={{
          backgroundImage: `url(${map.image.src})`,
          width: '100%',
          height: 'auto',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%'
        }}>
        {mapArray}
      </div>
      <div className="map-instructions">Scroll/Pinch to zoom. Double click map to filter by tile</div>
    </div>
  )
};