import { Button } from "@/components/ui/button"

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter",  test: (p: string) => /[a-z]/.test(p) },
    { label: "One number",            test: (p: string) => /[0-9]/.test(p) },
];

function isPasswordValid(password: string) {
    return passwordRules.every(r => r.test(password));
}

const MINIMUM_AGE = 18;

function calculateAge(birthday: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
}

const maxBirthday = new Date();
maxBirthday.setFullYear(maxBirthday.getFullYear() - MINIMUM_AGE);
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
import type { PhotoAction, PhotoDto, UpdateUserRequestDto, UserProfileResponseDto } from "@/dto/UserDto"
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface UserForm {
    /* Basic info */
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm_password: string;

    /* Details */
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

function BasicInfoEditForm({ form, onChange }: { form: UserForm, onChange: ChangeEventHandler<HTMLInputElement> }) {
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

function AccountEditForm({ form, onChange }: { form: UserForm, onChange: ChangeEventHandler<HTMLInputElement> }) {
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
    form: UserForm,
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
                            disabled={{ after: maxBirthday }}
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
    form: UserForm,
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
                        type="number"
                        min={MINIMUM_AGE}
                        onChange={setInputValue}
                    />
                    -
                    <Input
                        id="preferredMaxAge"
                        placeholder={`max (${form.preferredMaxAge})`}
                        value={form.preferredMaxAge}
                        className="h-8 flex-1"
                        type="number"
                        min={MINIMUM_AGE}
                        onChange={setInputValue}
                    />
                </div>
            </Field>
        </FieldGroup>
    )
}

function PhotosEditForm({ form, originalPhotos, setUserForm }: {
    form: UserForm,
    originalPhotos: PhotoDto[],
    setUserForm: Dispatch<SetStateAction<UserForm>>
}) {
    function addPhoto(idx: number, file: File) {
        const newPhotos : [PhotoAction, PhotoAction, PhotoAction, PhotoAction] = [...form.photos];
        newPhotos[idx] = { action: "add", file };
        setUserForm({ ...form, photos: newPhotos });
    }

    function removePhoto(idx: number) {
        const newPhotos: [PhotoAction, PhotoAction, PhotoAction, PhotoAction] = [...form.photos];
        if (originalPhotos[idx]) {
            newPhotos[idx] = { action: "delete", id: originalPhotos[idx].id, file: null };
        } else {
            newPhotos[idx] = { action: "none", file: null };
        }
        setUserForm({ ...form, photos: newPhotos });
    }

    return (
        <div className="gap-4">
            <Carousel className="w-full max-w-[12rem] sm:max-w-xs mx-auto">
                <CarouselContent>
                    <CarouselItem>
                        <div className="p-1">
                            <UploadAndDisplayImage
                                uploadedImage={form.profilePhoto.file}
                                onImageUpload={(file: File) => setUserForm({ ...form, profilePhoto: { action: "add", file } })}
                                onImageRemove={null}
                                deletable={false}
                            />
                        </div>
                    </CarouselItem>
                    {[0, 1, 2, 3].map((i) =>
                        <CarouselItem key={i}>
                            <div className="p-1">
                                <UploadAndDisplayImage key={i}
                                    uploadedImage={form.photos[i].file}
                                    onImageUpload={(file: File) => addPhoto(i, file)}
                                    onImageRemove={() => removePhoto(i)}
                                    deletable={true}
                                />
                            </div>
                        </CarouselItem>
                    )}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>
    );
}

export default function ProfileEditDialog({ profileData, onUpdate }: {
    profileData: UserProfileResponseDto,
    onUpdate: CallableFunction })
{
    const { user } = useContext(AuthContext);

    // Builds a fresh form state from the current profile data (photos are loaded
    // separately by loadPhotos). Used for both the initial state and for resetting
    // when the dialog is closed without saving.
    function buildFormFromProfile(): UserForm {
        return {
            firstname: profileData.name,
            lastname: profileData.lastname,
            email: profileData.email,
            password: "",
            confirm_password: "",
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
        };
    }

    const [userForm, setUserForm] = useState<UserForm>(buildFormFromProfile);

    const [formError, setFormError] = useState<string>("");

    const [openBirthdayCalendar, setOpenBirthdayCalendar] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);

    async function createFile(path: string, name: string): Promise<File> {
        const response = await fetch(path);
        const data = await response.blob();
        const metadata = { type: data.type };
        return new File([data], name, metadata);
    }

    async function loadPhotos() {
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
        setUserForm((prev) => ({
            ...prev,
            profilePhoto: loadedProfilePhoto,
            photos: [
                loadedPhotos[0] ?? { action: "none", file: null },
                loadedPhotos[1] ?? { action: "none", file: null },
                loadedPhotos[2] ?? { action: "none", file: null },
                loadedPhotos[3] ?? { action: "none", file: null },
            ]
        }))
    }

    // Discards any unsaved edits, restoring the form to the current profile data.
    function resetForm() {
        setFormError("");
        setUserForm(buildFormFromProfile());
        loadPhotos();
    }

    useEffect(() => {
        loadPhotos();
    }, [])

    if (user.id != profileData.id)
        return;

    function setInputFormValue(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    {
        setUserForm({
            ...userForm,
            [e.target.id]: e.target.value
        });
    }

    function setSelectFormValue(key: string, value: string)
    {
        setUserForm({
            ...userForm,
            [key]: value
        });
    }

    function setLocation(lat: number, lon: number) {
        setUserForm({
            ...userForm,
            lat: lat,
            lon: lon
        });
    }

    function addTag(tag: string) {
        const newTags = [...userForm.tags, tag];

        setUserForm({
            ...userForm,
            tags: newTags
        });
    }

    function removeTag(tag: string) {
        const newTags = userForm.tags.filter((t) => t != tag);

        setUserForm({
            ...userForm,
            tags: newTags
        });
    }

    async function submit(e: React.MouseEvent) {
        e.preventDefault();
        setFormError("");

        if (!userForm.firstname || !userForm.lastname || !userForm.email
            || !userForm.gender || !userForm.sex || !userForm.birthday
            || !userForm.preferredGender || !userForm.preferredSex || !userForm.biography) {
            setFormError("Please fill all the required fields");
            return;
        }
        if (calculateAge(userForm.birthday) < MINIMUM_AGE) {
            setFormError(`You must be at least ${MINIMUM_AGE} years old to use this platform`);
            return;
        }
        const preferredMinAge = Number(userForm.preferredMinAge);
        const preferredMaxAge = Number(userForm.preferredMaxAge);
        if (!preferredMinAge || !preferredMaxAge) {
            setFormError("Please provide a minimum and maximum age preference");
            return;
        }
        if (preferredMinAge < MINIMUM_AGE) {
            setFormError(`Minimum age preference must be at least ${MINIMUM_AGE}`);
            return;
        }
        if (preferredMinAge >= preferredMaxAge) {
            setFormError("Minimum age must be smaller than maximum age");
            return;
        }
        if (userForm.biography.length > 300) {
            setFormError("Biography must be 300 characters or fewer");
            return;
        }
        if (userForm.tags.length < 3) {
            setFormError("You must fill at least 3 tags.");
            return;
        }
        if (userForm.password && !isPasswordValid(userForm.password)) {
            setFormError("Password does not meet the requirements (min 8 chars, uppercase, lowercase, number)");
            return;
        }
        if (userForm.password && userForm.password !== userForm.confirm_password) {
            setUserForm({ ...userForm, password: "", confirm_password: "" });
            setFormError("Passwords do not match");
            return;
        }

        const originalTagNames = profileData.tags.map(t => t.name);
        type TagAction = { action: "add"; value: string } | { action: "delete"; id: number; value: string };
        const tagActions: TagAction[] = [
            ...userForm.tags
                .filter(name => !originalTagNames.includes(name))
                .map(name => ({ action: "add" as const, value: name })),
            ...profileData.tags
                .filter(t => !userForm.tags.includes(t.name))
                .map(t => ({ action: "delete" as const, id: t.id, value: t.name }))
        ];

        const dto: UpdateUserRequestDto = {
            firstname: userForm.firstname,
            lastname: userForm.lastname,
            email: userForm.email,
            password: userForm.password || undefined,
            gender: userForm.gender,
            sex: userForm.sex,
            birthday: userForm.birthday,
            lat: userForm.lat,
            lon: userForm.lon,
            preferredGender: userForm.preferredGender,
            preferredSex: userForm.preferredSex,
            preferredMinAge: Number(userForm.preferredMinAge),
            preferredMaxAge: Number(userForm.preferredMaxAge),
            biography: userForm.biography,
            tags: tagActions,
        };

        const resp: Response = await fetch("http://localhost/api/user/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (resp.status != 200) {
            const message = resp.body ? await resp.text() : `Server error (${resp.status})`;
            // Email already in use (409): revert the email field to the current one so
            // the leftover conflicting email doesn't block editing other fields.
            if (resp.status === 409) {
                setUserForm(prev => ({ ...prev, email: profileData.email }));
            }
            setFormError(message);
            return;
        }

        for (const p of userForm.photos) {
            if (p.action === "delete") {
                await fetch(`http://localhost/api/user/photos/${p.id}`, { method: "DELETE" });
            }
        }

        const hasNewPhotos = userForm.profilePhoto.action === "add"
            || userForm.photos.some(p => p.action === "add");

        if (hasNewPhotos) {
            const formData = new FormData();

            if (userForm.profilePhoto.action === "add") {
                if (profileData.profilePhoto)
                    await fetch(`http://localhost/api/user/photos/${profileData.profilePhoto.id}`, { method: "DELETE" });
                formData.append("profile_photo", userForm.profilePhoto.file);
            }

            for (let [idx, p] of userForm.photos.entries()) {
                if (p.action === "add") {
                    if (profileData.photos[idx])
                        await fetch(`http://localhost/api/user/photos/${profileData.photos[idx].id}`, { method: "DELETE" });

                    formData.append("photos", p.file);
                }
            }

            const respPhotos: Response = await fetch("http://localhost/api/user/photos", {
                method: "POST",
                body: formData
            });

            if (respPhotos.status != 200) {
                setFormError(respPhotos.body ? await respPhotos.text() : `Server error (${respPhotos.status})`);
                return;
            }
        }

        onUpdate();

        setOpenDialog(false);
    }

    return (
        <Dialog open={openDialog} onOpenChange={(open) => {
            // Closing the dialog (Esc, outside click, Cancel) discards unsaved edits.
            if (!open) resetForm();
            setOpenDialog(open);
        }} >
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
                            {formError && (
                                <div className="mt-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                                    {formError}
                                </div>
                            )}
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
                                    <BasicInfoEditForm form={userForm} onChange={setInputFormValue} />
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
                                    <AccountEditForm form={userForm} onChange={setInputFormValue} />
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
                                    <PreferencesEditForm form={userForm} setSelectValue={setSelectFormValue} setInputValue={setInputFormValue} />
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
                                    <AboutYouEditForm form={userForm} setSelectValue={setSelectFormValue} isCalendarOpen={openBirthdayCalendar} setOpenBirthdayCalendar={setOpenBirthdayCalendar} />
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
                                    <Textarea id="biography" className="mt-3 h-32" maxLength={300} placeholder="Tell people about yourself :)" value={userForm.biography} onChange={setInputFormValue}/>
                                    <p className={`text-xs mt-1 text-right ${userForm.biography.length >= 300 ? "text-destructive" : "text-muted-foreground"}`}>
                                        {userForm.biography.length}/300
                                    </p>
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
                                    <TagsPicker tags={userForm.tags} addTag={addTag} removeTag={removeTag}/>
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
                                        form={userForm}
                                        originalPhotos={profileData.photos}
                                        setUserForm={setUserForm}
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
                                    <LocationPicker setLocation={setLocation} defaultLat={profileData.lat} defaultLon={profileData.lon} askForLocation={false}/>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter>
                        <DialogClose asChild>
                            {/* TODO: reset form fields on cancel so that if you open the edit menu again, it will be as it was before */}
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="default" type="submit" onClick={submit}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
