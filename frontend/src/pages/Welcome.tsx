import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from "react-router";
import AuthContext from "@/contexts/AuthContextProvider";
import UploadAndDisplayImage from "@/components/upload-image";
import LocationPicker from "@/components/location-picker";
import TagsPicker from "@/components/tags-picker";
import type { UpdateUserDetailsRequestDto } from "@/dto/UserDto";

interface FormState {
    gender: string;
    sex: string;
    birthday: Date | undefined;
    lat: number;
    lon: number;
    preferredGender: string;
    preferredSex: string;
    preferredMinAge: number;
    preferredMaxAge: number;
    biography: string;
    tags: string[];
    profilePhoto: File | null;
    photos: [File | null, File | null, File | null, File | null];
}

export default function Welcome() {
    let { user } = useContext(AuthContext);
    let navigate = useNavigate();

    const welcomeSteps : string[] = ["preferences", "about-you", "location", "photos", "tags"];
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [openBirthdayCalendar, setOpenBirthdayCalendar] = useState(false);
    const [formState, setFormState] = useState<FormState>({
        gender: "",
        sex: "",
        birthday: undefined,
        lat: 0,
        lon: 0,
        preferredGender: "any",
        preferredSex: "any",
        preferredMinAge: 18,
        preferredMaxAge: 150,
        biography: "",
        tags: [],
        profilePhoto: null,
        photos: [null, null, null, null]
    });
    const [formError, setFormError] = useState<string>("")

    function prevStep() {
        if (currentStep == 0)
            return;

        setCurrentStep(currentStep - 1);
    }

    function nextStep(e: React.MouseEvent) {
        if (currentStep == welcomeSteps.length)
            return;

        setFormError("");
        switch (welcomeSteps[currentStep])
        {
            case "preferences":
                if (!formState.preferredGender || !formState.preferredSex || !formState.preferredMinAge || !formState.preferredMaxAge) {
                    setFormError("Please fill all the required fields");
                    return;
                }
                break;
            case "about-you":
                if (!formState.gender || !formState.sex || !formState.birthday || !formState.biography) {
                    setFormError("Please fill all the required fields");
                    return;
                }
                break;
            case "location":
                // TODO:
                /*
                if (!formState.lat || !formState.lon) {
                    setFormError("Please fill all the required fields");
                    return;
                }
                */
                break;
            case "photos":
                if (!formState.profilePhoto) {
                    setFormError("You must upload at least a profile photo.");
                    return;
                }
                break;
            case "tags":
                if (formState.tags.length < 3) {
                    setFormError("You must fill at least 3 tags.");
                    return;
                }
                break;
            default:
                throw new Error(`Invalid welcome page step: \"${welcomeSteps[currentStep]}\"`);
        }

        if (currentStep == welcomeSteps.length - 1)
            submit(e);
        else
            setCurrentStep(currentStep + 1);
    }

    function setInputFormValue(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    {
        setFormState({
            ...formState,
            [e.target.id]: e.target.value
        });
    }

    function setSelectFormValue(key: string, value: string)
    {
        setFormState({
            ...formState,
            [key]: value
        });
    }

    function setLocation(lat: number, lon: number) {
        setFormState({
            ...formState,
            lat: lat,
            lon: lon
        });
        console.log(lat, lon);
    }

    function addTag(tag: string) {
        const newTags = [...formState.tags, tag];

        setFormState({
            ...formState,
            tags: newTags
        });
    }

    function removeTag(tag: string) {
        const newTags = formState.tags.filter((t) => t != tag);

        setFormState({
            ...formState,
            tags: newTags
        });
    }

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setFormError("");

        if (!formState.gender || !formState.sex || !formState.birthday || !formState.biography
            || !formState.preferredGender || !formState.preferredSex || !formState.preferredMinAge
            || !formState.preferredMaxAge  /*|| !formState.lat || !formState.lon */
            || !formState.tags || !formState.profilePhoto)
        {
            setFormError("Missing fields");
            return;
        }

        const userDetailsDto : UpdateUserDetailsRequestDto = {
            gender: formState.gender,
            sex: formState.sex,
            birthday: formState.birthday,
            lat: formState.lat,
            lon: formState.lon,
            preferredGender: formState.preferredGender,
            preferredSex: formState.preferredSex,
            preferredMinAge: formState.preferredMinAge,
            preferredMaxAge: formState.preferredMaxAge,
            biography: formState.biography,
            tags: formState.tags.map((tagName) => {return {action: "add", value: tagName}})
        }

        const resp : Response = await fetch("http://localhost/api/user/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetailsDto)
        });

        if (resp.status != 200) {
            if (resp.body) {
                const reqBody = await resp.text();
                setFormError(reqBody);
            }
            else
                setFormError(`Server error (${resp.status})`);
            return;
        }

        const photosFormData = new FormData();
        photosFormData.append("profile_photo", formState.profilePhoto); // "profile_photo" must match backend multer field name
        for (var p of formState.photos) {
            if (p) {
                photosFormData.append("photos", p);
            }
        }

        const respPhotos : Response = await fetch("http://localhost/api/user/photos", {
            method: "POST",
            body: photosFormData
        });

        if (respPhotos.status != 200) {
            if (respPhotos.body) {
                const reqBody = await respPhotos.text();
                setFormError(reqBody);
            }
            else
                setFormError(`Server error (${respPhotos.status})`);
            return;
        }

        navigate('/browser');
    }

    useEffect(() => {
       if (user.profileCompleted)
            navigate('/browser');
    }, []);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div>
                    {/** Preferences */}
                    {(welcomeSteps[currentStep] == 'preferences') && <>
                        <h1 className="text-xl font-bold">What are you looking for?</h1>

                        {/** Gender / Sex */}
                        <div className="flex justify-between gap-2">
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="gender-select" className="px-1">
                                    Gender
                                </Label>
                                <Select value={formState.preferredGender} onValueChange={(str) => {setSelectFormValue("preferredGender", str)}} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select one" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Gender</SelectLabel>
                                            <SelectItem value="man">Man</SelectItem>
                                            <SelectItem value="woman">Woman</SelectItem>
                                            <SelectItem value="non_binary">Non Binary</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="any">Any</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="sex-select" className="px-1">
                                    Sex
                                </Label>
                                <Select value={formState.preferredSex} onValueChange={(str) => {setSelectFormValue("preferredSex", str)}} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select one" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Sex</SelectLabel>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="intersex">Intersex</SelectItem>
                                            <SelectItem value="any">Any</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/** Age range */}
                        <div className="flex justify-between gap-2">
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="age" className="px-1">Age</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="preferredMinAge"
                                        placeholder={`min (${formState.preferredMinAge})`}
                                        value={formState.preferredMinAge}
                                        className="h-8 flex-1"
                                        onChange={setInputFormValue}
                                    />
                                    -
                                    <Input
                                        id="preferredMaxAge"
                                        placeholder={`max (${formState.preferredMaxAge})`}
                                        value={formState.preferredMaxAge}
                                        className="h-8 flex-1"
                                        onChange={setInputFormValue}
                                    />
                                </div>
                            </div>
                        </div>

                    </>}

                    {/** About you */}
                    {(welcomeSteps[currentStep] == 'about-you') && <>
                        <h1 className="text-xl font-bold">Introduce yourself!</h1>
                        <div className="flex flex-col gap-3 mt-4">
                            <Label htmlFor="date" className="px-1">
                                Date of birth
                            </Label>
                            <Popover open={openBirthdayCalendar} onOpenChange={setOpenBirthdayCalendar}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="w-full justify-between font-normal"
                                    >
                                        {formState.birthday ? formState.birthday.toLocaleDateString() : "Select date"}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formState.birthday}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setFormState({ ...formState, birthday: date })
                                            setOpenBirthdayCalendar(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex justify-between gap-2">
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="gender-select" className="px-1">
                                    Gender
                                </Label>
                                <Select value={formState.gender} onValueChange={(str) => {setSelectFormValue("gender", str)}} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select one" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Gender</SelectLabel>
                                            <SelectItem value="man">Man</SelectItem>
                                            <SelectItem value="woman">Woman</SelectItem>
                                            <SelectItem value="non_binary">Non Binary</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="sex-select" className="px-1">
                                    Sex
                                </Label>
                                <Select value={formState.sex} onValueChange={(str) => {setSelectFormValue("sex", str)}}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select one" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Sex</SelectLabel>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="intersex">Intersex</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="bio" className="px-1 mt-4">
                                Bio
                            </Label>
                            <Textarea id="biography" className="mt-3 h-32" placeholder="Tell people about yourself :)" value={formState.biography} onChange={setInputFormValue}/>
                        </div>
                    </>}

                    {/** Location */}
                    {(welcomeSteps[currentStep] == 'location') && <>
                        <h1 className="text-xl font-bold">Where are you?</h1>
                        <LocationPicker setLocation={setLocation}/>
                    </>}

                    {/** Photos */}
                    {(welcomeSteps[currentStep] == 'photos') && <>
                        <h1 className="text-xl font-bold">Let your pics talk...</h1>
                        <div className="mt-4 flex flex-col gap-4">
                            <UploadAndDisplayImage
                                uploadedImage={formState.profilePhoto}
                                onImageUpload={(file: File) => formState.profilePhoto = file}
                                onImageRemove={() => formState.profilePhoto = null}
                            />
                            <div className="grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-4">
                               {
                                    [0, 1, 2, 3].map((i) =>
                                    <UploadAndDisplayImage key={i}
                                        uploadedImage={formState.photos[i]}
                                        onImageUpload={(file: File) => formState.photos[i] = file}
                                        onImageRemove={() => formState.photos[i] = null}
                                    />)
                                }
                            </div>
                        </div>
                    </>}

                    {/** Tags */}
                    {(welcomeSteps[currentStep] == 'tags') && <>
                        <h1 className="text-xl font-bold">Pick your vibes</h1>
                        <p>Tell us your interests:</p>
                        <TagsPicker tags={formState.tags} addTag={addTag} removeTag={removeTag}/>
                    </>}
                </div>
                <div className="mt-6 w-full text-red-600">{formError}</div>
                <div className="flex justify-between mt-6 w-full">
                    {(currentStep != 0) &&
                        <Button className="cursor-pointer" variant="outline" onClick={prevStep}>
                            Go back
                        </Button>
                    }
                    {(currentStep == 0) && <span></span> }

                    {(currentStep != welcomeSteps.length - 1) &&
                        <Button className="cursor-pointer" variant="default" onClick={nextStep}>
                            Next
                        </Button>
                    }

                    {(currentStep == welcomeSteps.length - 1) &&
                        <Button className="cursor-pointer" variant="default" onClick={nextStep}>
                            Save and find love!
                        </Button>
                    }
                </div>
            </div>
        </div>
    )
}