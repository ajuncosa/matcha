import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowDownNarrowWide, ArrowUpNarrowWide, SearchIcon } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink } from "react-router";

interface SearchResultItem {
    id: number;
    name: string;
    lastname: string;
    age: number;
    tags: { id: number; name: string }[];
    profilePhoto: { id: number; filePath: string } | null;
    fameRating: number;
    distance: number | null;
    commonTags: { id: number; name: string }[];
    commonTagsCount: number;
}

interface SearchResponse {
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

const API_URL = "/api";
const MINIMUM_AGE = 18;

export default function SearchPage() {
    // Search inputs
    const [searchText, setSearchText] = useState("");
    const [minAge, setMinAge] = useState("");
    const [maxAge, setMaxAge] = useState("");
    const [minFame, setMinFame] = useState("");
    const [maxFame, setMaxFame] = useState("");
    const [maxDistance, setMaxDistance] = useState("");
    const [tags, setTags] = useState("");
    const [minCommonTags, setMinCommonTags] = useState("");
    const [sortBy, setSortBy] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Results state
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const buildSearchUrl = useCallback((pageNum: number) => {
        const params = new URLSearchParams();
        
        if (searchText) params.set("q", searchText);
        if (minAge) params.set("minAge", minAge);
        if (maxAge) params.set("maxAge", maxAge);
        if (minFame) params.set("minFame", minFame);
        if (maxFame) params.set("maxFame", maxFame);
        if (maxDistance) params.set("maxDistance", maxDistance);
        if (tags) params.set("tags", tags);
        if (minCommonTags) params.set("minCommonTags", minCommonTags);
        if (sortBy && sortBy !== "no-sort") params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
        params.set("page", pageNum.toString());
        params.set("limit", "20");

        return `${API_URL}/search?${params.toString()}`;
    }, [searchText, minAge, maxAge, minFame, maxFame, maxDistance, tags, minCommonTags, sortBy, sortOrder]);

    const performSearch = useCallback(async (pageNum: number, append: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(buildSearchUrl(pageNum), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data: SearchResponse = await response.json();

            if (append) {
                setResults(prev => [...prev, ...data.items]);
            } else {
                setResults(data.items);
            }
            
            setHasMore(data.hasMore);
            setTotal(data.total);
            setPage(data.page);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [buildSearchUrl]);

    // Initial search on mount and when filters change
    useEffect(() => {
        performSearch(1, false);
    }, [performSearch]);

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                performSearch(page + 1, true);
            }
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading, page, performSearch]);

    const handleSearchSubmit = () => {
        performSearch(1, false);
    };

    const clearFilters = () => {
        setSearchText("");
        setMinAge("");
        setMaxAge("");
        setMinFame("");
        setMaxFame("");
        setMaxDistance("");
        setTags("");
        setMinCommonTags("");
        setSortBy("");
        setSortOrder("asc");
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    };

    const getImageUrl = (item: SearchResultItem) => {
        if (item.profilePhoto) {
            return `${API_URL}/images/${item.profilePhoto.filePath}`;
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-4">
            <InputGroup>
                <InputGroupInput 
                    placeholder="Search..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                />
                <InputGroupAddon>
                    <SearchIcon className="cursor-pointer" onClick={handleSearchSubmit} />
                </InputGroupAddon>
            </InputGroup>
            
            <div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="min-age">Age</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="min-age"
                                placeholder="min"
                                className="h-8 flex-1"
                                type="number"
                                min={MINIMUM_AGE}
                                value={minAge}
                                onChange={(e) => setMinAge(e.target.value)}
                            />
                            -
                            <Input
                                id="max-age"
                                placeholder="max"
                                className="h-8 flex-1"
                                type="number"
                                min={MINIMUM_AGE}
                                value={maxAge}
                                onChange={(e) => setMaxAge(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="min-fame">Fame</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="min-fame"
                                placeholder="min"
                                className="h-8 flex-1"
                                type="number"
                                value={minFame}
                                onChange={(e) => setMinFame(e.target.value)}
                            />
                            -
                            <Input
                                id="max-fame"
                                placeholder="max"
                                className="h-8 flex-1"
                                type="number"
                                value={maxFame}
                                onChange={(e) => setMaxFame(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="max-distance">Distance (km)</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="max-distance"
                                placeholder="max"
                                className="h-8 flex-1"
                                type="number"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="tags"
                                placeholder="tags separated by space"
                                className="h-8 flex-1"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="min-common-tags">Common tags</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="min-common-tags"
                                placeholder="min"
                                className="h-8 flex-1"
                                type="number"
                                value={minCommonTags}
                                onChange={(e) => setMinCommonTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="sort-criteria">Sort criteria</Label>
                        <div className="col-span-2 flex gap-1">
                            <div className="flex gap-2 w-full">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="flex-1 cursor-pointer">
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
                                    onClick={toggleSortOrder}
                                    disabled={!sortBy || sortBy === "no-sort"}
                                >
                                    {sortOrder === "asc" ? <ArrowDownNarrowWide /> : <ArrowUpNarrowWide />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Button onClick={handleSearchSubmit} className="flex-1">
                            Search
                        </Button>
                        <Button variant="secondary" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4">
                    {error}
                </div>
            )}

            <div className="text-sm text-muted-foreground">
                Found {total} results
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4 mt-4">
                {results.map((item) => (
                    <NavLink to={`/user/${item.id}`}>
                        <Card key={item.id} className="w-full rounded-md py-4 gap-3">
                            <CardContent className="px-4">
                                {getImageUrl(item) ? (
                                    <img
                                        className="rounded-lg w-full h-48 object-cover"
                                        src={getImageUrl(item)!}
                                        alt={`${item.name} ${item.lastname}`}
                                    />
                                ) : (
                                    <div className="rounded-lg w-full h-48 bg-muted flex items-center justify-center text-4xl font-semibold text-muted-foreground select-none">
                                        {item.name[0]}{item.lastname[0]}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col items-start px-4">
                                <div className="text-xl">
                                    <span className="font-bold">
                                        {item.name} {item.lastname}
                                    </span>
                                    <span>
                                        , {item.age}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Fame: {item.fameRating}
                                    {' • '}{item.distance ?? 0} km
                                    {item.commonTags.length > 0 && ` • ${item.commonTags.length} common tags`}
                                </div>
                                <div className="w-full mt-2 flex flex-wrap gap-1">
                                    {item.tags.map(tag => {
                                        const isCommon = item.commonTags.some(ct => ct.id === tag.id);
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

            {/* Infinite scroll trigger element */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                {hasMore && !loading && (
                    <span className="text-muted-foreground text-sm">Scroll for more...</span>
                )}
                {!hasMore && results.length > 0 && (
                    <span className="text-muted-foreground text-sm">No more results</span>
                )}
            </div>
        </div>
    );
}
