import type { Photo } from "./Photo";

export interface IPhotoRespository {
    findById(id: number): Promise<Photo | null>;
    create(filePath: string): Promise<void>;
    delete(id: number): Promise<void>;
}
