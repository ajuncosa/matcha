import { useState } from "react";
import { Button } from "./ui/button";
import { CirclePlus, Trash2 } from "lucide-react";

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
                <input type="file" id="picture" className="cursor-pointer absolute inset-0 opacity-0"
                    onChange={(event) => {
                        const file: File | undefined = event.target.files?.[0];
                        if (!file)
                            return;
                        setSelectedImage(file);
                        onImageUpload(file);
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
