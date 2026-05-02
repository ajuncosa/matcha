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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import AuthContext from "@/contexts/AuthContextProvider"
import type { PhotoAction, PhotoDto, UserProfileResponseDto } from "@/dto/UserDto"
import { ChevronDownIcon, EditIcon } from "lucide-react"
import { useContext, useEffect, useState, type ChangeEventHandler, type Dispatch, type SetStateAction } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import TagsPicker from "./tags-picker"
import { Textarea } from "./ui/textarea"
import UploadAndDisplayImage from "./upload-image"
import LocationPicker from "./location-picker"

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
    profilePhoto: PhotoAction;
    photos: [PhotoAction, PhotoAction, PhotoAction, PhotoAction];
};

function BasicInfoEditForm({ form, onChange }: { form: BasicUserInfoForm, onChange: ChangeEventHandler<HTMLInputElement> }) {
    return (
        <FieldGroup className="gap-4">
            <Field>
                <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                <Input id="firstname" type="text" value={form.firstname} onChange={onChange} />
            </Field>
            <Field>
                <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                <Input id="lastname" type="text" value={form.lastname} onChange={onChange} />
            </Field>
        </FieldGroup>
    )
}

function AccountEditForm({ form, onChange }: { form: BasicUserInfoForm, onChange: ChangeEventHandler<HTMLInputElement> }) {
    return (
        <FieldGroup className="gap-4">
            <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" onChange={onChange} value={form.email} />
            </Field>
            <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input id="password" type="password" onChange={onChange} value={form.password} />
                <FieldDescription>
                    Must be at least 8 characters long.
                </FieldDescription>
            </Field>
            <Field>
                <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                <Input id="confirm_password" type="password" onChange={onChange} value={form.confirm_password} />
            </Field>
        </FieldGroup>
    )
}

function AboutYouEditForm({ form, setSelectValue, isCalendarOpen, setOpenBirthdayCalendar }: {
    form: UserDetailsForm,
    setSelectValue: CallableFunction,
    isCalendarOpen: boolean,
    setOpenBirthdayCalendar: Dispatch<SetStateAction<boolean>>
}) {
    return (
        <FieldGroup className="gap-4">
            <Field>
                <FieldLabel htmlFor="date">Date of birth</FieldLabel>
                <Popover open={isCalendarOpen} onOpenChange={setOpenBirthdayCalendar}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="w-full justify-between font-normal"
                        >
                            {form.birthday ? form.birthday.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={form.birthday}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setSelectValue("birthday", date)
                                setOpenBirthdayCalendar(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </Field>
            <Field>
                <FieldLabel htmlFor="gender-select">Gender</FieldLabel>
                <Select value={form.gender} onValueChange={(str) => {setSelectValue("gender", str)}} >
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
                <Select value={form.sex} onValueChange={(str) => {setSelectValue("sex", str)}}>
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

function PreferencesEditForm({ form, setSelectValue, setInputValue }: {
    form: UserDetailsForm,
    setSelectValue: CallableFunction,
    setInputValue: ChangeEventHandler<HTMLInputElement>
}) {
    return (
        <FieldGroup className="gap-4">
            <Field>
                <FieldLabel htmlFor="gender-select">Gender</FieldLabel>
                <Select value={form.preferredGender} onValueChange={(str) => {setSelectValue("preferredGender", str)}} >
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
                <Select value={form.preferredSex} onValueChange={(str) => {setSelectValue("preferredSex", str)}} >
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
                        placeholder={`min (${form.preferredMinAge})`}
                        value={form.preferredMinAge}
                        className="h-8 flex-1"
                        onChange={setInputValue}
                    />
                    -
                    <Input
                        id="preferredMaxAge"
                        placeholder={`max (${form.preferredMaxAge})`}
                        value={form.preferredMaxAge}
                        className="h-8 flex-1"
                        onChange={setInputValue}
                    />
                </div>
            </Field>
        </FieldGroup>
    )
}

function PhotosEditForm({ form, originalPhotos, setUserDetailsForm }: {
    form: UserDetailsForm,
    originalPhotos: PhotoDto[],
    setUserDetailsForm: Dispatch<SetStateAction<UserDetailsForm>>
}) {
    function addPhoto(idx: number, file: File) {
        const newPhotos : [PhotoAction, PhotoAction, PhotoAction, PhotoAction] = [...form.photos];
        newPhotos[idx] = { action: "add", file };
        setUserDetailsForm({ ...form, photos: newPhotos });
    }

    function removePhoto(idx: number) {
        const newPhotos : [PhotoAction, PhotoAction, PhotoAction, PhotoAction] = [...form.photos];
        newPhotos[idx] = { action: "delete", id: originalPhotos[idx].id, file: null };
        setUserDetailsForm({ ...form, photos: newPhotos });
    }

    return (
        <div className="mt-4 flex flex-col gap-4">
            <div className="w-32">
                {
                    <UploadAndDisplayImage
                        uploadedImage={form.profilePhoto.file}
                        onImageUpload={(file: File) => setUserDetailsForm({ ...form, profilePhoto: { action: "add", file } })}
                        onImageRemove={null}
                        deletable={false}
                    />
                }
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(50px,_1fr))] gap-4">
            {
                [0, 1, 2, 3].map((i) =>
                    <UploadAndDisplayImage key={i}
                        uploadedImage={form.photos[i].file}
                        onImageUpload={(file: File) => addPhoto(i, file)}
                        onImageRemove={() => removePhoto(i)}
                        deletable={true}
                    />)
                }
            </div>
        </div>
    );
}

export default function ProfileEditDialog({ profileData }: { profileData: UserProfileResponseDto }) {
    const { user } = useContext(AuthContext);

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
        profilePhoto: { action: "none", file: null },
        photos: [{ action: "none", file: null }, { action: "none", file: null }, { action: "none", file: null }, { action: "none", file: null }]
    });

    const [formError, setFormError] = useState<string>("");

    const [openBirthdayCalendar, setOpenBirthdayCalendar] = useState(false);

    async function createFile(path: string, name: string): Promise<File> {
        let response = await fetch(path);
        let data = await response.blob();
        let metadata = { type: data.type };
        return new File([data], name, metadata);
    }

    useEffect(() => {
        const loadPhotos = async () => {
            const loadedProfilePhoto : PhotoAction = {
                action: "none",
                file: profileData.profilePhoto ? await createFile(`http://localhost/api/images/${profileData.profilePhoto.filePath}`, profileData.profilePhoto.filePath) : null
            }
            const loadedPhotos : PhotoAction[] = await Promise.all(
                profileData.photos.map(async (p) => {
                    return {
                        action: "none",
                        file: await createFile(`http://localhost/api/images/${p.filePath}`, p.filePath)
                    }
                })
            )
            setUserDetailsForm({
                ...userDetailsForm,
                profilePhoto: loadedProfilePhoto,
                photos: [
                    loadedPhotos[0] ?? { action: "none", file: null },
                    loadedPhotos[1] ?? { action: "none", file: null },
                    loadedPhotos[2] ?? { action: "none", file: null },
                    loadedPhotos[3] ?? { action: "none", file: null },
                ]
            })
        }
        loadPhotos();
    }, [])

    if (user.id != profileData.id)
        return;

    function setBasicInputFormValue(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    {
        setBasicUserInfoForm({
            ...basicUserInfoForm,
            [e.target.id]: e.target.value
        });
    }

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

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setFormError("");

        console.log("BIRDAY: " + userDetailsForm.birthday)
        console.log("PROF FOTO: " + userDetailsForm.profilePhoto.action + userDetailsForm.profilePhoto.file?.name)
        console.log("fOTOS: " + userDetailsForm.photos.map((p) => p.action + p.file?.name))
        if (!basicUserInfoForm.firstname)
        {
            setFormError("First name cannot be blank");
            return;
        }
        else if (!basicUserInfoForm.lastname)
        {
            setFormError("Last name cannot be blank");
            return;
        }
        else if (!basicUserInfoForm.email)
        {
            setFormError("Email cannot be blank");
            return;
        }
        else if (basicUserInfoForm.password && basicUserInfoForm.password != basicUserInfoForm.confirm_password) {
            setBasicUserInfoForm({ ...basicUserInfoForm, password: "", confirm_password: "" });
            setFormError("Passwords do not match");
            return;
        }
        else if (!userDetailsForm.gender || !userDetailsForm.sex || !userDetailsForm.birthday || !userDetailsForm.biography
            || !userDetailsForm.preferredGender || !userDetailsForm.preferredSex || !userDetailsForm.preferredMinAge
            || !userDetailsForm.preferredMaxAge  || !userDetailsForm.lat || !userDetailsForm.lon
            || !userDetailsForm.tags || !userDetailsForm.profilePhoto)
        {
            setFormError("Missing fields");
            return;
        }

        //TODO: check password things

        //const resp : Response = await fetch("http://localhost/api/auth/register", {
        //    method: "POST",
        //    headers: {
        //        "Content-Type": "application/json"
        //    },
        //    body: JSON.stringify({
        //        email: basicUserInfoForm.email,
        //        name: basicUserInfoForm.firstname,
        //        lastname: basicUserInfoForm.lastname,
        //        password: basicUserInfoForm.password
        //    })
        //});
//
        //if (resp.status != 200) {
        //    if (resp.body) {
        //        const reqBody = await resp.text();
        //        setFormError(reqBody);
        //    }
        //    else
        //        setFormError(`Server error (${resp.status})`);
        //    return;
        //}
        //else {
        //    navigate('/login');
        //}
    }

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="cursor-pointer">
                        <EditIcon /> Edit profile
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                            <div className="text-red-600">{formError}</div>
                    </DialogHeader>
                    <Tabs defaultValue="basic" className="w-full" orientation="vertical">
                        <TabsList>
                            <TabsTrigger value="basic">Basic info</TabsTrigger>
                            <TabsTrigger value="account">Account details</TabsTrigger>
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
                                        Basic info
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <BasicInfoEditForm form={basicUserInfoForm} onChange={setBasicInputFormValue} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="account">
                            <Card className="gap-2">
                                <CardHeader>
                                    <CardDescription>
                                        Account details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <AccountEditForm form={basicUserInfoForm} onChange={setBasicInputFormValue} />
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
                                    <PreferencesEditForm form={userDetailsForm} setSelectValue={setSelectFormValue} setInputValue={setInputFormValue} />
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
                                    <AboutYouEditForm form={userDetailsForm} setSelectValue={setSelectFormValue} isCalendarOpen={openBirthdayCalendar} setOpenBirthdayCalendar={setOpenBirthdayCalendar} />
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
                        <TabsContent value="photos">
                            <Card className="gap-2">
                                <CardHeader>
                                    <CardDescription>
                                        Let your pics talk...
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <PhotosEditForm
                                        form={userDetailsForm}
                                        originalPhotos={profileData.photos}
                                        setUserDetailsForm={setUserDetailsForm}
                                    />
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
                            {/* TODO: reset form fields on cancel so that if you open the edit menu again, it will be as it was before */}
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={submit}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
