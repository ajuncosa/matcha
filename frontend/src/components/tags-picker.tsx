import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Hash, X } from "lucide-react";

interface TagsPickerProps {
    tags: string[],
    addTag: CallableFunction,
    removeTag: CallableFunction
}

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export default function TagsPicker({tags, addTag, removeTag}: TagsPickerProps) {
    const [input, setInput] = useState<string>("");
    const [inputError, setInputError] = useState<string>("");

    function onInputchange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    function addClick(e: React.MouseEvent) {
        e.preventDefault();

        setInputError("");
        if (tags.length >= MAX_TAGS) {
            setInputError(`Error: you can only add up to ${MAX_TAGS} tags`);
            return;
        }
        if (input.length < 3) {
            setInputError("Error: tag must be 3 or longer characters");
            return;
        }
        if (input.length > MAX_TAG_LENGTH) {
            setInputError(`Error: tag must be ${MAX_TAG_LENGTH} characters or fewer`);
            return;
        }

        // Remove spaces and substitute them with '-'
        // "Helo  world      with spaces" => "hello-world-with-spaces"
        const formattedTag = input.replace(/\s+/g, "-").toLowerCase();

        // Check if tag is already added
        const tagExists = tags.find((t) => {return t == formattedTag});

        if (tagExists) {
            setInput("");
            return;
        };

        addTag(formattedTag);

        setInput("");
    }

    return (
        <form>
            <div className="flex w-full flex-wrap justify-start gap-1 mt-3">
                {tags.map((t) => 
                    <Badge variant="outline" className="hover:border-gray-500">
                        <span className="text-md">#{t}</span>
                        <span className="cursor-pointer" onClick={(e: any) => {e.preventDefault(); removeTag(t)}}>
                            <X width={"20px"}/>
                        </span>
                    </Badge>
                )}
                
            </div>
            <p className="text-red-500 px-1 mt-2">
                {inputError}
            </p>
            <Field className="mt-2" orientation="horizontal">
                <InputGroup>
                    <InputGroupInput
                        placeholder="Tag"
                        onChange={onInputchange}
                        value={input}
                        maxLength={MAX_TAG_LENGTH}
                        disabled={tags.length >= MAX_TAGS}
                    />
                    <InputGroupAddon>
                        <Hash />
                    </InputGroupAddon>
                </InputGroup>
                <Button type="submit" className="cursor-pointer" onClick={addClick} disabled={tags.length >= MAX_TAGS}>Add</Button>
            </Field>
        </form>
    );
}