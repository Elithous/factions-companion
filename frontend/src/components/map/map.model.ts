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
    imageUrl: string
}