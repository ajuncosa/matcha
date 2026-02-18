import type { Photo } from "@/core/photos/Photo";

export interface IPhotoService {
    uploadPhoto(photoFieldName: string) : any;
    uploadPhotos(profilePhotoFieldName: string, photosFieldName: string) : any;
    insertPhoto(path: string) : Promise<Photo>;
    insertPhotos(paths: string[]) : Promise<Photo[]>;
}
