import { API_URL } from "@/lib/config";
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
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Funnel, HeartOff } from "lucide-react";
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

const MINIMUM_AGE = 18;

export default function BrowsePage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("location");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filterMinAge, setFilterMinAge] = useState<string>("");
    const [filterMaxAge, setFilterMaxAge] = useState<string>("");
    const [filterMinFame, setFilterMinFame] = useState<string>("");
    const [filterMaxFame, setFilterMaxFame] = useState<string>("");
    const [filterMaxDistance, setFilterMaxDistance] = useState<string>("");
    const [filterMinCommonTags, setFilterMinCommonTags] = useState<string>("");

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

    const filteredRecommendations = useMemo(() => {
        return sortedRecommendations.filter(rec => {
            const age = calculateAge(rec.user.details.birthday);
            if (filterMinAge !== "" && age < parseInt(filterMinAge)) return false;
            if (filterMaxAge !== "" && age > parseInt(filterMaxAge)) return false;
            if (filterMinFame !== "" && rec.user.details.fameRating < parseInt(filterMinFame)) return false;
            if (filterMaxFame !== "" && rec.user.details.fameRating > parseInt(filterMaxFame)) return false;
            if (filterMaxDistance !== "" && parseFloat(rec.distanceBetween) > parseFloat(filterMaxDistance)) return false;
            if (filterMinCommonTags !== "" && rec.commonTags.length < parseInt(filterMinCommonTags)) return false;
            return true;
        });
    }, [sortedRecommendations, filterMinAge, filterMaxAge, filterMinFame, filterMaxFame, filterMaxDistance, filterMinCommonTags]);

    function clearFilters() {
        setFilterMinAge("");
        setFilterMaxAge("");
        setFilterMinFame("");
        setFilterMaxFame("");
        setFilterMaxDistance("");
        setFilterMinCommonTags("");
    }

    const getImageUrl = (recommendation: Recommendation) => {
        if (recommendation.user.details.profilePhoto) {
            return `${API_URL}/images/${recommendation.user.details.profilePhoto.filePath}`;
        }
        return null;
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
                                <Label>Age</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input value={filterMinAge} onChange={e => setFilterMinAge(e.target.value)} placeholder="min" className="h-8 flex-1" type="number" min={MINIMUM_AGE} />
                                    -
                                    <Input value={filterMaxAge} onChange={e => setFilterMaxAge(e.target.value)} placeholder="max" className="h-8 flex-1" type="number" min={MINIMUM_AGE} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label>Fame</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input value={filterMinFame} onChange={e => setFilterMinFame(e.target.value)} placeholder="min" className="h-8 flex-1" type="number" />
                                    -
                                    <Input value={filterMaxFame} onChange={e => setFilterMaxFame(e.target.value)} placeholder="max" className="h-8 flex-1" type="number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label>Distance (km)</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input value={filterMaxDistance} onChange={e => setFilterMaxDistance(e.target.value)} placeholder="max" className="h-8 flex-1" type="number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label>Common tags</Label>
                                <div className="col-span-2 flex gap-1">
                                    <Input value={filterMinCommonTags} onChange={e => setFilterMinCommonTags(e.target.value)} placeholder="min" className="h-8 flex-1" type="number" />
                                </div>
                            </div>
                        </div>
                        <Button className="cursor-pointer mt-4 w-full" variant="secondary" onClick={clearFilters}>
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

            <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4">
                {filteredRecommendations.map((rec) => (
                    <NavLink key={rec.user.id} to={`/user/${rec.user.id}`}>
                        <Card className="w-full rounded-md py-4 gap-3">
                            <CardContent className="px-4">
                                {getImageUrl(rec) ? (
                                    <img
                                        className="rounded-lg w-full h-48 object-cover"
                                        src={getImageUrl(rec)!}
                                        alt={`${rec.user.name} ${rec.user.lastname}`}
                                    />
                                ) : (
                                    <div className="rounded-lg w-full h-48 bg-muted flex items-center justify-center text-4xl font-semibold text-muted-foreground select-none">
                                        {rec.user.name[0]}{rec.user.lastname[0]}
                                    </div>
                                )}
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

            {!loading && !error && filteredRecommendations.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-16 text-center">
                    <HeartOff size={40} />
                    {recommendations.length === 0 ? (
                        <>
                            <p className="text-base font-medium">There are no matches available for you</p>
                            <p className="text-sm">Try updating your interests to discover more people.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <NavLink to="/profile">Update my interests</NavLink>
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-base font-medium">No profiles match your filters</p>
                            <p className="text-sm">Try adjusting or clearing your filters.</p>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}