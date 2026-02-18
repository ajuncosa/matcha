import type { IPhotoRespository } from "@/core/photos/IPhotoRepository";
import { Photo } from "@/core/photos/Photo";
import type { Pool } from "pg";

export default class PhotoRepositoryPostgres implements IPhotoRespository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findById(id: number): Promise<Photo | null> {
        const query = await this.pool.query("SELECT * FROM photos WHERE id=$1", [id]);
        if (query.rows.length == 0)
            return null;

        return new Photo(
            query.rows[0].id,
            query.rows[0].file_path
        );
    }

    async create(filePath: string): Promise<Photo> {
        const query = await this.pool.query("\
            INSERT INTO photos(file_path) VALUES($1) RETURNING id", [filePath]
        );

        return new Photo(
            query.rows[0].id,
            query.rows[0].file_path
        );
    }

    async delete(id: number): Promise<void> {
        await this.pool.query("DELETE FROM photos WHERE id=$1", [id]);
    }
}
