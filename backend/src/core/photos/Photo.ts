export class Photo {
    id: number;
    filePath: string;

    constructor(
        id: number,
        filePath: string
    ) {
        this.id = id;
        this.filePath = filePath;
    }
}
