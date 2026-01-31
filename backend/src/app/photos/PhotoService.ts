import type { IPhotoRepository } from "@/core/photos/IPhotoRepository";
import type { IPhotoService } from "@/core/photos/IPhotoService";
import { Photo } from "@/core/photos/Photo";
import multer, { type FileFilterCallback, type Multer } from "multer";
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

    uploadPhoto(fieldName: string)
    {
        return this.uploader.single(fieldName); // fieldName must match your form field name
    }

    uploadPhotos(profilePhotoFieldName: string, photosFieldName: string)
    {
        return this.uploader.fields([
            { name: profilePhotoFieldName, maxCount: 1 },
            { name: photosFieldName, maxCount: 5 }
        ]);
    }

    /*

    async uploadPhotos(photoFieldName: string): Promise<Photo[]>
    {
        upload.single(photoFieldName) // "photo" must match your form field name
        //TODO: save to somewhere
        await this.repo.create("/images/user1_001");

    }
        */


}