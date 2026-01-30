export type TagId = number;

export class Tag {
    id: TagId;
    name: string;

    constructor(id: TagId, name: string) {
        this.id = id;
        this.name = name;
    }
}
