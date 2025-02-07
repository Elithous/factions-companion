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