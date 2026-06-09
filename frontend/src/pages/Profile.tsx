import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import AuthContext from "@/contexts/AuthContextProvider"
import LocationDisplayMap from "@/components/location-display-map";
import ProfileEditDialog from "@/components/profile-edit-dialogs";
import type { LikeStatus, UserProfileResponseDto } from "@/dto/UserDto";
import 'leaflet/dist/leaflet.css';
import { toast } from "sonner";
import { Ban, Flag, Mars, ThumbsDown, ThumbsUpIcon, Venus, VenusAndMars } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router";

interface ProfileVisitorDto {
    id: number;
    name: string;
    lastname: string;
    profilePhotoPath: string | null;
    lastVisitedAt: string;
}

interface LikerDto {
    id: number;
    name: string;
    lastname: string;
    profilePhotoPath: string | null;
    likedAt: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function ProfilePage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [userProfileData, setUserProfileData] = useState<UserProfileResponseDto>();
    const [location, setLocation] = useState<{lat: number, lon: number}>({lat: 40.4168, lon: -3.7038});
    const [visitors, setVisitors] = useState<ProfileVisitorDto[]>([]);
    const [likers, setLikers] = useState<LikerDto[]>([]);
    const navigate = useNavigate();

    async function fetchUserData(url: string, onError?: () => void): Promise<void> {
        const resp: Response = await fetch(url);

        if (resp.status !== 200) {
            onError?.();
            return;
        }

        if (!resp.body) {
            console.error("Empty response body");
            return;
        }

        const respBody: UserProfileResponseDto = await resp.json();
        
        const filteredPhotos = respBody.profilePhoto
            ? respBody.photos.filter((photo) => photo.id !== respBody.profilePhoto.id)
            : respBody.photos;
        
        setUserProfileData({...respBody, photos: filteredPhotos});
        
        if (respBody?.lat && respBody?.lon) {
            setLocation({lat: respBody.lat, lon: respBody.lon});
        }
    }

    async function getProfile(): Promise<void> {
        await fetchUserData("http://localhost/api/user/profile");
        const [visitorsResp, likersResp] = await Promise.all([
            fetch("/api/user/visitors"),
            fetch("/api/user/likers"),
        ]);
        if (visitorsResp.ok) setVisitors(await visitorsResp.json());
        if (likersResp.ok) setLikers(await likersResp.json());
    }

    async function getUser(id: number): Promise<void> {
        const resp = await fetch(`/api/user/${id}`);
        if (resp.status === 403 || resp.status === 404) {
            navigate('/browser');
            return;
        }
        if (!resp.ok || !resp.body) return;
        const respBody: UserProfileResponseDto = await resp.json();
        const filteredPhotos = respBody.profilePhoto
            ? respBody.photos.filter((photo) => photo.id !== respBody.profilePhoto!.id)
            : respBody.photos;
        setUserProfileData({ ...respBody, photos: filteredPhotos });
        if (respBody?.lat && respBody?.lon) setLocation({ lat: respBody.lat, lon: respBody.lon });
    }

    function calculateAge() : number
    {
        if (!userProfileData)
            return 999;

        const today = new Date();
        const birthday = new Date(userProfileData.birthday);
        const age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        if (monthDiff < 0
            || (monthDiff == 0 && today.getDate() < birthday.getDate()))
        {
            return age - 1;
        }
        return age;
    }

    const SexIcon = ({ sex }: { sex: string | undefined }) => {
        if (!sex)
            return <></>;
        const Icon = sex == "male" ? Mars : sex == "female" ? Venus : VenusAndMars;
        return <Icon size={20} />;
    };

    async function likeUser(id: number) {
        const resp : Response = await fetch(`http://localhost/api/user/like/${id}`, {
            method: "POST"
        });

        if (resp.status == 200) {
            setUserProfileData({...userProfileData, likeStatus: "LIKED"} as UserProfileResponseDto);
            toast.success(`You liked ${userProfileData!.name}`);
        }
        else {
            toast.error(`Error liking ${userProfileData!.name}`);
        }
    }

    async function unLikeUser(id: number) {
        const resp : Response = await fetch(`http://localhost/api/user/unlike/${id}`, {
            method: "POST"
        });

        if (resp.status == 200) {
            setUserProfileData({...userProfileData, likeStatus: "NOT_LIKED"} as UserProfileResponseDto);
            toast.success(`You unliked ${userProfileData!.name}`);
        }
        else {
            toast.error(`Error un-liking ${userProfileData!.name}`);
        }
    }

    async function blockUser(id: number) {
        const resp = await fetch(`/api/user/block/${id}`, { method: "POST" });
        if (resp.ok) {
            setUserProfileData(prev => prev ? { ...prev, isBlockedByMe: true, likeStatus: "NOT_LIKED" } : prev);
            toast.success(`You blocked ${userProfileData!.name}`);
        } else {
            toast.error(`Error blocking ${userProfileData!.name}`);
        }
    }

    async function unblockUser(id: number) {
        const resp = await fetch(`/api/user/unblock/${id}`, { method: "POST" });
        if (resp.ok) {
            setUserProfileData(prev => prev ? { ...prev, isBlockedByMe: false } : prev);
            toast.success(`You unblocked ${userProfileData!.name}`);
        } else {
            toast.error(`Error unblocking ${userProfileData!.name}`);
        }
    }

    async function reportUser(id: number) {
        const resp = await fetch(`/api/user/report/${id}`, { method: "POST" });
        if (resp.ok) {
            toast.success(`You reported ${userProfileData!.name} as fake.`);
        } else {
            toast.error(`Error reporting ${userProfileData!.name}`);
        }
    }

    function UserActionButton({ likeStatus, isBlockedByMe, userId, onLike, onUnlike, onBlock, onUnblock, onReport } : {likeStatus: LikeStatus | undefined, isBlockedByMe: boolean, userId: string, onLike: CallableFunction, onUnlike: CallableFunction, onBlock: CallableFunction, onUnblock: CallableFunction, onReport: CallableFunction}) {
        const isMutual = likeStatus === "MUTUAL";

        const statusLabels: Record<string, string> = {
            "NOT_LIKED": "Like",
            "LIKED": "Liked",
            "LIKED_BACK": "Like Back",
            "MUTUAL": "Mutual ❤️"
        };

        const reportButton = (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="lg" className="cursor-pointer text-destructive hover:text-destructive">
                        <Flag className="mr-2" /> Report
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report this profile?</DialogTitle>
                        <DialogDescription>
                            This will flag the profile as fake for review. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="destructive" onClick={() => onReport(Number(userId))}>Report</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        const blockButton = isBlockedByMe ? (
            <Button variant="outline" size="lg" className="cursor-pointer" onClick={() => onUnblock(Number(userId))}>
                <Ban className="mr-2" /> Unblock
            </Button>
        ) : (
            <Button variant="outline" size="lg" className="cursor-pointer text-destructive hover:text-destructive" onClick={() => onBlock(Number(userId))}>
                <Ban className="mr-2" /> Block
            </Button>
        );

        if (isBlockedByMe) {
            return <div className="flex gap-2">{blockButton}</div>;
        }

        if (isMutual) {
            return (
                <div className="flex gap-2">
                    <Button variant="default" size="lg" disabled>
                        <ThumbsUpIcon className="mr-2" />
                        {statusLabels[likeStatus || ""]}
                    </Button>
                    <Button variant="destructive" size="lg" className="cursor-pointer" onClick={() => onUnlike(Number(userId))}>
                        <ThumbsDown className="mr-2" />
                        Remove
                    </Button>
                    {blockButton}
                    {reportButton}
                </div>
            );
        }

        const isLiked = likeStatus === "LIKED";

        return (
            <div className="flex gap-2">
                <Button
                    variant={isLiked ? "default" : "outline"}
                    size="lg"
                    className="cursor-pointer"
                    onClick={() => isLiked ? onUnlike(Number(userId)) : onLike(Number(userId))}
                >
                    {isLiked ? <ThumbsDown className="mr-2" /> : <ThumbsUpIcon className="mr-2" />}
                    {statusLabels[likeStatus || ""] || "Like"}
                </Button>
                {blockButton}
                {reportButton}
            </div>
        );
    }

    useEffect(() => {
        setUserProfileData(undefined);
        setVisitors([]);
        setLikers([]);
        if (id) {
            getUser(Number(id));
        }
        else {
            getProfile();
        }
    }, [id]);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-stretch gap-4 h-32">
                <div className="flex flex-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        {
                            user?.id != userProfileData?.id ? 
                                <Badge className={`${userProfileData?.isOnline ? 'bg-emerald-600' : 'bg-red-600'}  h-6 w-6 absolute top-[-12px] right-[-12px] z-1`}></Badge>
                            : <></>
                        }
                        <Avatar key={userProfileData?.id} className="rounded-lg w-32 h-32">
                            {userProfileData?.profilePhoto &&
                                <AvatarImage className="object-cover"
                                    src={`http://localhost/api/images/${userProfileData?.profilePhoto.filePath}`}
                                    alt={`${userProfileData?.name} ${userProfileData?.lastname}`}
                                />
                            }
                            <AvatarFallback className="rounded-lg text-2xl font-semibold">
                                {userProfileData?.name?.[0]}{userProfileData?.lastname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {/* User info */}
                    <div className="flex flex-col justify-center">
                        <div className="flex gap-2 mt-2">
                            <span className="text-lg sm:text-xl md:text-2xl lg:text-4xl">{userProfileData?.name}</span>
                            <span className="text-lg sm:text-xl md:text-2xl lg:text-4xl">{userProfileData?.lastname}</span>
                        </div>
                        <div className="flex mt-1 items-center gap-1 text-md">
                            <SexIcon sex={userProfileData?.sex}/>
                            <span className="mr-1">| {userProfileData?.gender} | {calculateAge()}</span>
                        </div>
                        <div className="flex mt-2 justify-center flex-col">
                            <span className="text-xs text-muted-foreground uppercase">rating</span>
                            <div className="text-4xl font-bold">{userProfileData?.fameRating}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                {
                    userProfileData &&
                    (
                        user?.id !== userProfileData.id && id ? (
                            <UserActionButton
                                likeStatus={userProfileData.likeStatus}
                                isBlockedByMe={userProfileData.isBlockedByMe}
                                userId={id}
                                onLike={likeUser}
                                onUnlike={unLikeUser}
                                onBlock={blockUser}
                                onUnblock={unblockUser}
                                onReport={reportUser}
                            />
                        ) : (
                            <ProfileEditDialog profileData={userProfileData} onUpdate={getProfile} />
                        )
                    )
                }
            </div>

            {/* Body */}

            <div className="w-full mt-4">
                <h2 className="text-2xl">Interests</h2>
                <div className="w-full mt-2 flex flex-wrap gap-1">
                    {
                        userProfileData?.tags.map((tag) => {
                            return <Badge variant="outline" className="text-md">#{`${tag.name}`}</Badge>
                        })
                    }
                </div>
            </div>

            <div className="w-full mt-4">
                <h2 className="text-2xl">Preferences</h2>
                <div className="flex mt-2 items-center gap-1">
                    <SexIcon sex={userProfileData?.preferredSex}/>
                    <span>| {userProfileData?.preferredGender} | {userProfileData?.preferredMinAge}-{userProfileData?.preferredMaxAge}</span>
                </div>
            </div>
            
            <div className="w-full mt-4">
                <h2 className="text-2xl">Biography</h2>
                <p className="mt-2 text-justify">
                    {userProfileData?.biography}
                </p>
            </div>
            
            <div className="w-full mt-4">
                <h2 className="text-2xl">Photos</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {
                        userProfileData?.photos.map((photo) => {
                            return <div className="object-cover w-full">
                                <img className="rounded-lg" src={`http://localhost/api/images/${photo.filePath}`} alt="#" />
                            </div>
                        })
                    }
                </div>
            </div>
            
            <div className="w-full mt-4">
                <h2 className="text-2xl">Location</h2>
                <div className="mt-4 h-96">
                    <LocationDisplayMap location={location}/>
                </div>
            </div>

            {!id && (
                <div className="w-full mt-4">
                    <h2 className="text-2xl">Who Liked Me</h2>
                    {likers.length === 0 ? (
                        <p className="mt-2 text-muted-foreground text-sm">Nobody has liked your profile yet.</p>
                    ) : (
                        <div className="mt-2 grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-2">
                            {likers.map((l) => (
                                <NavLink key={l.id} to={`/user/${l.id}`}>
                                    <Card className="p-2 hover:bg-accent transition-colors">
                                        <CardContent className="flex items-center gap-3 p-2">
                                            <Avatar className="rounded-lg w-12 h-12 shrink-0">
                                                {l.profilePhotoPath && (
                                                    <AvatarImage className="object-cover" src={`/api/images/${l.profilePhotoPath}`} alt={`${l.name} ${l.lastname}`} />
                                                )}
                                                <AvatarFallback className="rounded-lg text-sm font-semibold">{l.name[0]}{l.lastname[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{l.name} {l.lastname}</p>
                                                <p className="text-muted-foreground text-sm">{timeAgo(l.likedAt)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!id && (
                <div className="w-full mt-4">
                    <h2 className="text-2xl">Visit History</h2>
                    {visitors.length === 0 ? (
                        <p className="mt-2 text-muted-foreground text-sm">Nobody has visited your profile yet.</p>
                    ) : (
                        <div className="mt-2 grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-2">
                            {visitors.map((v) => (
                                <NavLink key={v.id} to={`/user/${v.id}`}>
                                    <Card className="p-2 hover:bg-accent transition-colors">
                                        <CardContent className="flex items-center gap-3 p-2">
                                            <Avatar className="rounded-lg w-12 h-12 shrink-0">
                                                {v.profilePhotoPath && (
                                                    <AvatarImage
                                                        className="object-cover"
                                                        src={`/api/images/${v.profilePhotoPath}`}
                                                        alt={`${v.name} ${v.lastname}`}
                                                    />
                                                )}
                                                <AvatarFallback className="rounded-lg text-sm font-semibold">
                                                    {v.name[0]}{v.lastname[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{v.name} {v.lastname}</p>
                                                <p className="text-muted-foreground text-sm">{timeAgo(v.lastVisitedAt)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}