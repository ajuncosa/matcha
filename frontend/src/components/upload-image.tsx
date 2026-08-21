import { useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Keep this comfortably below the server (multer 50MB) and nginx (100MB) limits so
// oversized files are rejected here instead of failing with a raw 413/500 page.
const MAX_IMAGE_SIZE_MB = 5;

const UploadAndDisplayImage = (
    { uploadedImage, onImageUpload, onImageRemove, deletable}: {
        uploadedImage: File | null,
        onImageUpload: CallableFunction,
        onImageRemove: CallableFunction | null, // only used if "deletable" is true
        deletable: boolean
    }) => {

    const [selectedImage, setSelectedImage] = useState<File | null>(uploadedImage);

    return (
        <div className="group relative w-full aspect-square">
            <Button className="size-full relative p-0" variant="secondary">
                {
                    selectedImage ?
                    <div className="relative">
                        <img className="w-full aspect-square object-cover rounded-md"
                            src={URL.createObjectURL(selectedImage)}
                        />
                    </div>
                    :
                    <CirclePlus className="size-sm" />
                }
                <input type="file" id="picture" accept="image/*" className="cursor-pointer absolute inset-0 opacity-0"
                    onChange={(event) => {
                        const file: File | undefined = event.target.files?.[0];
                        if (!file)
                            return;
                        if (!file.type.startsWith("image/")) {
                            toast.error("Please select an image file");
                            event.target.value = "";
                            return;
                        }
                        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                            toast.error(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`);
                            event.target.value = "";
                            return;
                        }
                        setSelectedImage(file);
                        onImageUpload(file);
                        event.target.value = "";
                    }}
                />
            </Button>
            {
                selectedImage && deletable && onImageRemove &&
                <Button className="absolute cursor-pointer w-fit top-2 right-2 invisible group-hover:visible"
                    variant="destructive"
                    onClick={() => {
                        setSelectedImage(null);
                        onImageRemove();
                    }}>
                    <Trash2 />
                </Button>
            }
        </div>
    );
};

export default UploadAndDisplayImage;
