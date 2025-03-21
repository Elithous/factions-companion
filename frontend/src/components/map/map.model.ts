import { StaticImageData } from "next/image"

export interface MapTileModel {
    weight?: number
}

export interface MapTilesListModel {
    [x: number]: {
        [y: number]: MapTileModel
    }
}

export interface MapModel {
    dimensions: {
        x: number,
        y: number
    },
    tiles: MapTilesListModel,
    image: StaticImageData | undefined
}

export interface MapConfig {
    author: string;
    name: string;
    description: string;
    width: number;
    height: number;
    home_bonus: number;
    home_radius: number;
    hqs_positions: { [faction in 'RED' | 'BLUE' | 'GREEN' | 'YELLOW']: { x: number, y: number } };
    terrains_bonus: {
        [name: string]: {
            type: string;
            bonus: number;
            subtype: string;
        }[]
    };
    forbidden_events: string[];
    forbidden_terrain_types: string[];
}