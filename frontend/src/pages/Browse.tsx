import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Funnel } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router";

interface RecommendationUser {
    id: number;
    name: string;
    lastname: string;
    email: { email: string };
    createdAt: string;
    emailValidatedAt: string;
    details: {
        gender: string;
        sex: string;
        birthday: string;
        lat: string;
        lon: string;
        preferredGender: string;
        preferredSex: string;
        preferredMinAge: number;
        preferredMaxAge: number;
        biography: string;
        tags: { id: number; name: string }[];
        photos: { id: number; filePath: string }[];
        profilePhoto: { id: number; filePath: string } | null;
        fameRating: number;
        lastConnection: string;
    };
}

interface Recommendation {
    user: RecommendationUser;
    commonTags: { id: number; name: string }[];
    distanceBetween: string;
}

const API_URL = "/api";

export default function BrowsePage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const calculateAge = (birthday: string) => {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/search/recommendations`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
            }
            const data: Recommendation[] = await response.json();
            setRecommendations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const sortedRecommendations = useMemo(() => {
        if (!sortBy || sortBy === "no-sort") return recommendations;
        
        return [...recommendations].sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case "age":
                    comparison = calculateAge(a.user.details.birthday) - calculateAge(b.user.details.birthday);
                    break;
                case "location":
                    comparison = parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween);
                    break;
                case "fame-rating":
                    comparison = a.user.details.fameRating - b.user.details.fameRating;
                    break;
                case "common-tags":
                    comparison = a.commonTags.length - b.commonTags.length;
                    break;
                default:
                    return 0;
            }
            
            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [recommendations, sortBy, sortOrder]);

    const getImageUrl = (recommendation: Recommendation) => {
        if (recommendation.user.details.profilePhoto) {
            return `/images/${recommendation.user.details.profilePhoto.filePath}`;
        }
        return `https://lipsum.app/random/680x420?seed=${recommendation.user.id}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Sort</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit">
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px] cursor-pointer">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="age">Age</SelectItem>
                                    <SelectItem value="location">Location</SelectItem>
                                    <SelectItem value="fame-rating">Fame</SelectItem>
                                    <SelectItem value="common-tags">Common tags</SelectItem>
                                    <SelectItem value="no-sort">None</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button 
                                className="cursor-pointer" 
                                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                disabled={!sortBy || sortBy === "no-sort"}
                            >
                                {sortOrder === "asc" ? <ArrowDownNarrowWide /> : <ArrowUpNarrowWide />}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Funnel />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="age">Age</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="min-age"
                                        placeholder="min"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                    -
                                    <Input
                                        id="max-age"
                                        placeholder="max"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="fame-rating">Fame</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="min-fame"
                                        placeholder="min"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                    -
                                    <Input
                                        id="max-fame"
                                        placeholder="max"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="distance">Distance (km)</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="max-distance"
                                        placeholder="max"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="common-tags">Common tags</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input
                                        id="min-number-of-common-tags"
                                        placeholder="min"
                                        className="h-8 flex-1"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                        <Button className="cursor-pointer mt-4 w-full" variant="secondary">
                            Clear filters
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4">
                {sortedRecommendations.map((rec) => (
                    <NavLink key={rec.user.id} to={`/user/${rec.user.id}`}>
                        <Card className="w-full rounded-md py-4 gap-3">
                            <CardContent className="px-4">
                                <div className="object-cover w-full">
                                    <img
                                        className="rounded-lg w-full h-48 object-cover"
                                        src={getImageUrl(rec)}
                                        alt={`${rec.user.name} ${rec.user.lastname}`}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start px-4">
                                <div className="text-xl">
                                    <span className="font-bold">
                                        {rec.user.name} {rec.user.lastname}
                                    </span>
                                    <span>
                                        , {calculateAge(rec.user.details.birthday)}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Fame: {rec.user.details.fameRating}
                                    {' • '}{rec.distanceBetween} km
                                    {rec.commonTags.length > 0 && ` • ${rec.commonTags.length} common tags`}
                                </div>
                                <div className="w-full mt-2 flex flex-wrap gap-1">
                                    {rec.user.details.tags.map(tag => {
                                        const isCommon = rec.commonTags.some(ct => ct.id === tag.id);
                                        return (
                                            <Badge 
                                                key={tag.id} 
                                                variant={isCommon ? "default" : "outline"} 
                                                className="text-md"
                                            >
                                                {tag.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </CardFooter>
                        </Card>
                    </NavLink>
                ))}
            </div>

            {loading && (
                <>
                    {[...Array(3)].map((_, idx) => (
                        <Card key={`skeleton-${idx}`} className="w-full rounded-md py-4 gap-3">
                            <CardContent className="px-4">
                                <Skeleton className="w-full h-48 rounded-lg" />
                            </CardContent>
                            <CardFooter className="flex flex-col items-start px-4 gap-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-1 mt-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </>
            )}
        </div>
    )
}