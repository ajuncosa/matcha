import type { IPhotoRepository } from "@/core/photos/IPhotoRepository";
import type { IPhotoService } from "@/core/photos/IPhotoService";
import { Photo } from "@/core/photos/Photo";
import multer, { type Multer } from "multer";
import PlatformPath from "path"
import { fileTypeFromFile } from "file-type";
import { unlink } from "node:fs/promises";
import type { Request, Response, NextFunction } from "express";

const ALLOWED_IMAGE_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

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
                const ext = PlatformPath.extname(file.originalname);
                const name = PlatformPath.basename(file.originalname, ext);
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
                    cb(new Error('Only image files are allowed'));
                }
            }
        });
    }

    private withUploadErrorHandling(middleware: ReturnType<Multer["fields"]>) {
        return (req: Request, res: Response, next: NextFunction) => {
            middleware(req, res, (err: any) => {
                if (err) {
                    return res.status(422).send(err.message || "Invalid file upload");
                }
                next();
            });
        };
    }

    // saves the image to disk
    uploadPhoto(fieldName: string)
    {
        return this.withUploadErrorHandling(this.uploader.single(fieldName) as any);
    }

    // saves the images to disk
    uploadPhotos(profilePhotoFieldName: string, photosFieldName: string)
    {
        return this.withUploadErrorHandling(this.uploader.fields([
            { name: profilePhotoFieldName, maxCount: 1 },
            { name: photosFieldName, maxCount: 5 }
        ]));
    }

    validateImages()
    {
        return async (req: Request, res: Response, next: NextFunction) => {
            const files: Express.Multer.File[] = [];
            if (req.file)
                files.push(req.file);
            if (Array.isArray(req.files))
                files.push(...req.files);
            else if (req.files)
                for (const group of Object.values(req.files as { [field: string]: Express.Multer.File[] }))
                    files.push(...group);

            for (const file of files) {
                const detected = await fileTypeFromFile(file.path);
                if (!detected || !ALLOWED_IMAGE_MIMES.has(detected.mime)) {
                    // Reject the whole request and clean up every uploaded file.
                    await Promise.all(files.map((f) => unlink(f.path).catch(() => {})));
                    return res.status(422).send("Uploaded files must be valid images (jpeg, png, webp or gif)");
                }
            }

            next();
        };
    }

    // stores the photo in the database
    async insertPhoto(path: string) : Promise<Photo>
    {
        return await this.repo.create(PlatformPath.basename(path));
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
