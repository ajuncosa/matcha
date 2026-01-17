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
import { AuthContext } from "@/entities/AuthContext";
import { useNavigate } from "react-router";

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
    photos: string[];
}

export default function Welcome() {
    const { user } = useContext(AuthContext);
    let navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<string>("preferences"); //preferences, about-you, location, photos, tags
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
        photos: [],
    });
    const [formError, setFormError] = useState<string>("")

    function prevStep() {
        if (currentStep == 'about-you') {
            setCurrentStep('preferences');
        }
        else if (currentStep == 'location') {
            setCurrentStep('about-you');
        }
        else if (currentStep == 'photos') {
            setCurrentStep('location');
        }
        else if (currentStep == 'tags') {
            setCurrentStep('photos');
        }
    }

    function nextStep() {
        setFormError("");
        if (currentStep == 'preferences') {
            if (!formState.preferredGender || !formState.preferredSex || !formState.preferredMinAge || !formState.preferredMaxAge) {
                setFormError("Please fill all the required fields");
                return;
            }
            setCurrentStep('about-you');
        }
        else if (currentStep == 'about-you') {
            if (!formState.gender || !formState.sex || !formState.birthday || !formState.biography) {
                setFormError("Please fill all the required fields");
                return;
            }
            setCurrentStep('location');
        }
        else if (currentStep == 'location') {
            /*
            if (!formState.lat || !formState.lon) {
                setFormError("Please fill all the required fields");
                return;
            }
            */
            setCurrentStep('photos');
        }
        else if (currentStep == 'photos') {
            /*
            if (formState.photos.empty()) {
                setFormError("You must upload at least one photo");
                return;
            }
            */
            setCurrentStep('tags');
        }
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

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setFormError("");

        if (!formState.gender || !formState.sex || !formState.birthday || !formState.biography
            || !formState.preferredGender || !formState.preferredSex || !formState.preferredMinAge
            || !formState.preferredMaxAge  /*|| !formState.lat || !formState.lon || !formState.tags
            || !formState.photos*/)
        {
            setFormError("Missing fields");
            return;
        }
        
        const resp : Response = await fetch("http://localhost/api/user/update-user-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                gender: formState.gender,
                sex: formState.sex,
                birthday: formState.birthday,
                lat: formState.lat,
                lon: formState.lon,
                preferredGender: formState.preferredGender,
                preferredSex: formState.preferredSex,
                preferredMinAge: formState.preferredMinAge,
                preferredMaxAge: formState.preferredMaxAge,
                biography: formState.biography
            })
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

        // TODO: post to photos
        // TODO: post to tags

        navigate('/browser');
    }

    useEffect(() => {
        if (user && user.hasProfileCompleted())
            navigate('/browser');
    }, []);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div>
                    {/** Preferences */}
                    {(currentStep == 'preferences') && <>
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
                                            <SelectItem value="non-binary">Non Binary</SelectItem>
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

                    {(currentStep == 'about-you') && <>
                        <h1 className="text-xl font-bold">Tell us about yourself</h1>
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
                                            <SelectItem value="non-binary">Non Binary</SelectItem>
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

                    {(currentStep == 'location') && <>
                        <h1 className="text-xl font-bold">Where are you? o_O</h1>
                        TODO
                        {/** TODO: mapa */}
                    </>}

                    {(currentStep == 'photos') && <>
                        <h1 className="text-xl font-bold">Qué llevas puesto? e.e</h1>
                        photos
                    </>}

                    {(currentStep == 'tags') && <>
                        <h1 className="text-xl font-bold">What are you interested in?</h1>
                        suggestions
                        or add your own tags
                    </>}
                </div>
                <div className="mt-6 w-full text-red-600">{formError}</div>
                <div className="flex justify-between mt-6 w-full">
                    {(currentStep != 'preferences') &&
                        <Button variant="outline" onClick={prevStep}>
                            Go back
                        </Button>
                    }
                    {(currentStep == 'preferences') && <span></span> }

                    {(currentStep != 'tags') &&
                        <Button variant="default" onClick={nextStep}>
                            Next
                        </Button>
                    }

                    {(currentStep == 'tags') &&
                        <Button variant="default" onClick={submit}>
                            Save and find love!
                        </Button>
                    }
                </div>
            </div>
        </div>
    )
}