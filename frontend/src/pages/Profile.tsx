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
import { Mars, ThumbsDown, ThumbsUpIcon, Venus, VenusAndMars } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function ProfilePage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [userProfileData, setUserProfileData] = useState<UserProfileResponseDto>();
    const [location, setLocation] = useState<{lat: number, lon: number}>({lat: 40.4168, lon: -3.7038});
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
    }

    async function getUser(id: number): Promise<void> {
        await fetchUserData(
            `http://localhost/api/user/${id}`,
            () => navigate('/search')
        );
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

    function UserActionButton({ likeStatus, userId, onLike, onUnlike } : {likeStatus: LikeStatus, userId: string, onLike: CallableFunction, onUnlike: CallableFunction}) {
        return (
            <>
            {(likeStatus === "NOT_LIKED" || likeStatus === "LIKED_BACK") && (
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="cursor-pointer" 
                    onClick={() => onLike(Number(userId))}
                >
                <ThumbsUpIcon /> Like User
                </Button>
            )}
            {(likeStatus === "LIKED" || likeStatus === "MUTUAL") && (
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="cursor-pointer" 
                    onClick={() => onUnlike(Number(userId))}
                >
                <ThumbsDown /> Unlike User
                </Button>
            )}
            </>
        );
        }

    useEffect(() => {
        if (id) {
            getUser(Number(id));
        }
        else {
            getProfile();
        }
    }, []);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-stretch gap-4 h-32">
                <div className="flex flex-start gap-4">
                    {/* Avatar */}
                    <div>
                        <Avatar className="rounded-lg w-32 h-32">
                            {userProfileData?.profilePhoto &&
                                <AvatarImage className="object-cover"
                                    src={`http://localhost/api/images/${userProfileData?.profilePhoto.filePath}`}
                                    alt={`${userProfileData?.name} ${userProfileData?.lastname}`}
                                />
                            }
                            <AvatarFallback>No photo</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* User info */}
                    <div className="flex flex-col justify-center">
                        {/*
                            user?.id != userProfileData?.id ? 
                            <Badge className="bg-emerald-600">Online</Badge>
                            : <></>
                        */}
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
                            <div className="text-4xl font-bold">{userProfileData?.fameRating}2k</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                {
                    user?.id !== userProfileData?.id && userProfileData?.profilePhoto && id ? (
                        <UserActionButton 
                        likeStatus={userProfileData?.likeStatus}
                        userId={id}
                        onLike={likeUser}
                        onUnlike={unLikeUser}
                        />
                    ) : (
                        <ProfileEditDialog profileData={userProfileData} />
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

            <div className="w-full mt-4">
                <h2 className="text-2xl">Visit History</h2>
                <div className="mt-2 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2">
                    {
                        [1, 2, 3, 4, 5, 6, 7, 9, 11].map((i) => {
                            return (
                                <Card className="p-2" key={i}>
                                    <CardContent className="flex items-center gap-4 p-2">
                                        <Avatar className="rounded-lg w-12 h-12">
                                            <AvatarImage
                                                src="https://github.com/evilrabbit.png"
                                                alt="@evilrabbit"
                                            />
                                            <AvatarFallback>ER</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-lg">
                                                Juan manuel
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                24-03-1999 13:69
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )
}