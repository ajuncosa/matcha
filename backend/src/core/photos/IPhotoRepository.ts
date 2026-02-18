import type { Photo } from "./Photo";

export interface IPhotoRepository {
    findById(id: number): Promise<Photo | null>;
    create(filePath: string): Promise<Photo>;
    delete(id: number): Promise<void>;
}
