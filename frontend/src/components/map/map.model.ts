import { StaticImageData } from "next/image"

export default interface MapModel {
    dimensions: {
        x: number,
        y: number
    },
    tiles: {
        [x: number]: {
            [y: number]: {
                type: string
            }
        }
    },
    image: StaticImageData
}