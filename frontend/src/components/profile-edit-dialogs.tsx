import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import AuthContext from "@/contexts/AuthContextProvider"
import type { UserProfileResponseDto } from "@/dto/UserDto"
import { ChevronDownIcon, EditIcon } from "lucide-react"
import { useContext, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import TagsPicker from "./tags-picker"
import { Textarea } from "./ui/textarea"
import UploadAndDisplayImage from "./upload-image"
import LocationPicker from "./location-picker"

type profileSection = "name" | "identity" | "preferences" | "tags" | "bio" | "profilePhoto" | "photos";

interface BasicUserInfoForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm_password: string;
}

interface UserDetailsForm {
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
};

export default function ProfileEditDialog({ type, profileData }: { type: profileSection, profileData: UserProfileResponseDto | undefined }) {
    const { user } = useContext(AuthContext);
    if (!profileData)
        return;

    const [basicUserInfoForm, setBasicUserInfoForm] = useState<BasicUserInfoForm>({
        firstname: profileData.name,
        lastname: profileData.lastname,
        email: profileData.email,
        password: "",
        confirm_password: ""
    });

    const [userDetailsForm, setUserDetailsForm] = useState<UserDetailsForm>({
        gender: profileData.gender,
        sex: profileData.sex,
        birthday: new Date(profileData.birthday),
        lat: profileData.lat,
        lon: profileData.lon,
        preferredGender: profileData.preferredGender,
        preferredSex: profileData.preferredSex,
        preferredMinAge: profileData.preferredMinAge,
        preferredMaxAge: profileData.preferredMaxAge,
        biography: profileData.biography,
        tags: profileData.tags.map((t) => t.name),
        profilePhoto: null,
        photos: [null, null, null, null]
    });

    const [formError, setFormError] = useState<string>("")


    function setInputFormValue(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    {
        setUserDetailsForm({
            ...userDetailsForm,
            [e.target.id]: e.target.value
        });
    }

    function setSelectFormValue(key: string, value: string)
    {
        setUserDetailsForm({
            ...userDetailsForm,
            [key]: value
        });
    }

    function setLocation(lat: number, lon: number) {
        setUserDetailsForm({
            ...userDetailsForm,
            lat: lat,
            lon: lon
        });
        console.log(lat, lon);
    }


    function addTag(tag: string) {
        const newTags = [...userDetailsForm.tags, tag];

        setUserDetailsForm({
            ...userDetailsForm,
            tags: newTags
        });
    }

    function removeTag(tag: string) {
        const newTags = userDetailsForm.tags.filter((t) => t != tag);

        setUserDetailsForm({
            ...userDetailsForm,
            tags: newTags
        });
    }

    function BasicInfoEditForm() {
        function setBasicInputFormValue(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
        {
            setBasicUserInfoForm({
                ...basicUserInfoForm,
                [e.target.id]: e.target.value
            });
        }
        return (
            <FieldGroup className="gap-4">
                <Field>
                    <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                    <Input id="firstname" type="text" defaultValue={profileData?.name} onChange={setBasicInputFormValue} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                    <Input id="lastname" type="text" defaultValue={profileData?.lastname} onChange={setBasicInputFormValue} />
                </Field>
                {
                /* // TODO: add email & password, or maybe in a separate "DANGER" area?
                }
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        defaultValue={profileData?.email}
                        onChange={setBasicInputFormValue}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" onChange={setBasicInputFormValue} value={userDetailsForm.password} />
                    <FieldDescription>
                        Must be at least 8 characters long.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                    </FieldLabel>
                    <Input id="confirm_password" type="password" onChange={setBasicInputFormValue} value={userDetailsForm.confirm_password} />
                    <FieldDescription>Please confirm your password.</FieldDescription>
                </Field>
                */
                }
            </FieldGroup>
        )
    }

    function AboutYouEditForm() {
        const [openBirthdayCalendar, setOpenBirthdayCalendar] = useState(false);
        return (
            <FieldGroup className="gap-4">
                <Field>
                    <FieldLabel htmlFor="date">Date of birth</FieldLabel>
                    <Popover open={openBirthdayCalendar} onOpenChange={setOpenBirthdayCalendar}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date"
                                className="w-full justify-between font-normal"
                            >
                                {userDetailsForm.birthday ? userDetailsForm.birthday.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={userDetailsForm.birthday}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setUserDetailsForm({ ...userDetailsForm, birthday: date })
                                    setOpenBirthdayCalendar(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>
                <Field>
                    <FieldLabel htmlFor="gender-select">Gender</FieldLabel>
                    <Select value={userDetailsForm.gender} onValueChange={(str) => {setSelectFormValue("gender", str)}} >
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
                </Field>
                <Field>
                    <FieldLabel htmlFor="sex-select">Sex</FieldLabel>
                    <Select value={userDetailsForm.sex} onValueChange={(str) => {setSelectFormValue("sex", str)}}>
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
                </Field>
            </FieldGroup>
        )
    }

    function PreferencesEditForm() {
        return (
            <FieldGroup className="gap-4">
                <Field>
                    <FieldLabel htmlFor="gender-select">Gender</FieldLabel>
                    <Select value={userDetailsForm.preferredGender} onValueChange={(str) => {setSelectFormValue("preferredGender", str)}} >
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
                </Field>
                <Field>
                    <FieldLabel htmlFor="sex-select">Sex</FieldLabel>
                    <Select value={userDetailsForm.preferredSex} onValueChange={(str) => {setSelectFormValue("preferredSex", str)}} >
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
                </Field>
                <Field>
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <div className="col-span-2 flex gap-1">
                        <Input
                            id="preferredMinAge"
                            placeholder={`min (${userDetailsForm.preferredMinAge})`}
                            value={userDetailsForm.preferredMinAge}
                            className="h-8 flex-1"
                            onChange={setInputFormValue}
                        />
                        -
                        <Input
                            id="preferredMaxAge"
                            placeholder={`max (${userDetailsForm.preferredMaxAge})`}
                            value={userDetailsForm.preferredMaxAge}
                            className="h-8 flex-1"
                            onChange={setInputFormValue}
                        />
                    </div>
                </Field>
            </FieldGroup>
        )
    }

    return (
        user.id != profileData.id ? <></> :
            <Dialog>
                <form>
                    <DialogTrigger asChild>
                        <Button variant="outline"><EditIcon /></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you&apos;re
                                done.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="basic" className="w-full" orientation="vertical">
                            <TabsList>
                                <TabsTrigger value="basic">Basic info</TabsTrigger>
                                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                                <TabsTrigger value="about-you">About you</TabsTrigger>
                                <TabsTrigger value="bio">Bio</TabsTrigger>
                                <TabsTrigger value="tags">Interests</TabsTrigger>
                                <TabsTrigger value="photos">Photos</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                            </TabsList>
                            <TabsContent value="basic">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Basic account info
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <BasicInfoEditForm/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="preferences">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            What are you looking for?
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <PreferencesEditForm/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="about-you">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Introduce yourself!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <AboutYouEditForm/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="bio">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Tell them a bit more about yourself...
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <Textarea id="biography" className="mt-3 h-32" placeholder="Tell people about yourself :)" value={userDetailsForm.biography} onChange={setInputFormValue}/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="tags">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Pick your vibes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <TagsPicker tags={userDetailsForm.tags} addTag={addTag} removeTag={removeTag}/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                                        {/* TODO: this entire section */}
                            <TabsContent value="photos">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Let your pics talk...
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <div className="mt-4 flex flex-col gap-4">
                                            <UploadAndDisplayImage
                                                uploadedImage={userDetailsForm.profilePhoto}
                                                onImageUpload={(file: File) => userDetailsForm.profilePhoto = file}
                                                onImageRemove={() => userDetailsForm.profilePhoto = null}
                                            />
                                            <div className="grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-4">
                                            {
                                                    [0, 1, 2, 3].map((i) =>
                                                    <UploadAndDisplayImage key={i}
                                                        uploadedImage={userDetailsForm.photos[i]}
                                                        onImageUpload={(file: File) => userDetailsForm.photos[i] = file}
                                                        onImageRemove={() => userDetailsForm.photos[i] = null}
                                                    />)
                                                }
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="location">
                                <Card className="gap-2">
                                    <CardHeader>
                                        <CardDescription>
                                            Where are you?
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        {/* TODO: add default location to current one */}
                                        <LocationPicker setLocation={setLocation}/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
    )
}
