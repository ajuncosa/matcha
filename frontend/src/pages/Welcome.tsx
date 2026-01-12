import { Button } from "@/components/ui/button";
import { useState } from "react"
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
    const [currentStep, setCurrentStep] = useState<string>("preferences"); //preferences, about-you, location, photos, tags
    const [openBirthdayCalendar, setOpenBirthdayCalendar] = useState(false);
    const [formState, setFormState] = useState<FormState>({
        gender: "",
        sex: "",
        birthday: undefined,
        lat: 0,
        lon: 0,
        preferredGender: "",
        preferredSex: "",
        preferredMinAge: 18,
        preferredMaxAge: 150,
        biography: "",
        tags: [],
        photos: [],
    });

    function prevStep() {
        if (currentStep == 'about-you') {
            setCurrentStep('preferences');
        }
    }

    function nextStep() {
        if (currentStep == 'preferences') {
            setCurrentStep('about-you');
        }
        else if (currentStep == 'about-you') {
            setCurrentStep('location');
        }
        else if (currentStep == 'location') {
            setCurrentStep('photos');
        }
        else if (currentStep == 'photos') {
            setCurrentStep('tags');
        }
    }

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
                                <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select one" />
                                </SelectTrigger>
                                <SelectContent id="gender-select">
                                    <SelectGroup>
                                        <SelectLabel>Gender</SelectLabel>
                                        <SelectItem value="man">Man</SelectItem>
                                        <SelectItem value="woman">Woman</SelectItem>
                                        <SelectItem value="non-binary">Non Binary</SelectItem>
                                        <SelectItem value="other">other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="sex-select" className="px-1">
                                    Sex
                                </Label>
                                <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select one" />
                                </SelectTrigger>
                                <SelectContent id="sex-select">
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
                        
                        {/** Age range */}
                        <div className="flex justify-between gap-2">
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="age" className="px-1">Age</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="min-age"
                                        placeholder="min"
                                        className="h-8 flex-1"
                                    />
                                    -
                                    <Input
                                        id="max-age"
                                        placeholder="max"
                                        className="h-8 flex-1"
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
                                        setFormState({...formState, birthday: date})
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
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select one" />
                                    </SelectTrigger>
                                    <SelectContent id="gender-select">
                                        <SelectGroup>
                                            <SelectLabel>Gender</SelectLabel>
                                            <SelectItem value="man">Man</SelectItem>
                                            <SelectItem value="woman">Woman</SelectItem>
                                            <SelectItem value="non-binary">Non Binary</SelectItem>
                                            <SelectItem value="other">other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 mt-4">
                                <Label htmlFor="sex-select" className="px-1">
                                    Sex
                                </Label>
                                <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select one" />
                                </SelectTrigger>
                                <SelectContent id="sex-select">
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
                            <Textarea id="bio" className="mt-3 h-32" placeholder="Tell people about yourself :)" />
                        </div>
                    </>}

                    {(currentStep == 'location') && <>
                        {/** TODO: mapa */}
                    </>}

                    {(currentStep == 'photos') && <>
                        photos
                    </>}

                    {(currentStep == 'tags') && <>
                        tags
                    </>}
                </div>
                <div className="flex justify-between mt-6 w-full">
                    {(currentStep != 'preferences') && 
                        <Button variant="outline" onClick={prevStep}>
                            Prev step
                        </Button>
                    }
                    {(currentStep == 'preferences') && <span></span>}
                    
                    <Button variant="default" onClick={nextStep}>
                        Next step
                    </Button>
                </div>
            </div>
        </div>
    )
}