import { StaticImageData } from "next/image"

/**
 * Represents available factions in the game
 */
export type Faction = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';


export interface Position {
  x: number;
  y: number;
}

/**
 * Represents a single tile on the heatmap
 */
export interface MapTileModel {
  /** Color weight (0-1) for heatmap display */
  weight?: number;
}

export interface MapTilesListModel {
  [x: number]: {
    [y: number]: MapTileModel;
  };
}

/**
 * Full map model including dimensions and tiles
 */
export interface MapModel {
  /** Map dimensions */
  dimensions: { width: number, height: number };
  tiles: MapTilesListModel;
  image?: StaticImageData;
}

export interface TerrainBonus {
  type: string;
  subtype: string;
  /** Flat bonus */
  base: number;
  /** Additive percentage bonus */
  bonus: number;
  /** Multiplicative percentage bonus */
  multiplier: number;
}

export interface MapConfig {
  author: string;
  name: string;
  description: string;

  width: number;
  height: number;

  /** Bonus provided to units near their home base */
  home_bonus: number;
  /** Radius around home bases where bonus applies */
  home_radius: number;

  hqs_positions: Record<Faction, { x: number, y: number }>;
  /** Terrain bonuses by tile type */
  terrains_bonus: Record<string, TerrainBonus[]>;
  /** List of events that are not allowed on this map */
  forbidden_events: string[];
  /** Types of terrain not passable on this map */
  forbidden_terrain_types: string[];
}