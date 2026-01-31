import type { IPhotoRepository } from "@/core/photos/IPhotoRepository";
import type { IPhotoService } from "@/core/photos/IPhotoService";
import { Photo } from "@/core/photos/Photo";
import multer, { type Multer } from "multer";
import path from "path"

export class PhotoService implements IPhotoService {
    private repo: IPhotoRepository;
    private uploader: Multer; 

    constructor(repo: IPhotoRepository) {
        this.repo = repo;

        const storage = multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, "/home/bun/app/images/");
            },
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname);
                const name = path.basename(file.originalname, ext);
                cb(null, `${name}-${Date.now()}${ext}`);
            },
        });

        this.uploader = multer({
            storage,
            limits: {
                fileSize: 50 * 1024 * 1024,  // 50MB
                files: 5,
                fieldSize: 10 * 1024 * 1024
            },
            fileFilter: (_req, file, cb) => {
                if (file.mimetype.startsWith('image/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Only images allowed'));
                }
            }
        });
    }

    // saves the image to disk
    uploadPhoto(fieldName: string)
    {
        return this.uploader.single(fieldName); // fieldName must match your form field name
    }

    // saves the images to disk
    uploadPhotos(profilePhotoFieldName: string, photosFieldName: string)
    {
        return this.uploader.fields([
            { name: profilePhotoFieldName, maxCount: 1 },
            { name: photosFieldName, maxCount: 5 }
        ]);
    }

    // stores the photo in the database
    async insertPhoto(path: string) : Promise<Photo>
    {
        return await this.repo.create(path);
    }

    // stores the photos in the database
    async insertPhotos(paths: string[]) : Promise<Photo[]>
    {
        let insertedPhotos : Photo[] = [];
        for (var path of paths) {
            insertedPhotos.push(await this.insertPhoto(path));
        }
        return insertedPhotos;
    }
}
