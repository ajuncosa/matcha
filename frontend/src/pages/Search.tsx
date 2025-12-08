import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowDownNarrowWide, Funnel, SearchIcon } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"

const people = [
    {
        name: "Santa",
        lastname: "Claus",
        age: "192",
        tags: ["café", "navidad"]
    },
    {
        name: "Adrian",
        lastname: "Pavel",
        age: "26",
        tags: ["follar", "gatos", "leer"]
    },
    {
        name: "Michel",
        lastname: "In",
        age: "45",
        tags: ["neumáticos", "coches", "paraguas", "navidad", "jerseys_navideños_con_lucecitas"]
    },
]

export default function SearchPage() {
    return (
        <div className="flex flex-col gap-4">
            <InputGroup>
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                    <SearchIcon />
                </InputGroupAddon>
            </InputGroup>
            <div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="age">Age</Label>
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
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="fame-rating">Fame</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="min-fame"
                                placeholder="min"
                                className="h-8 flex-1"
                            />
                            -
                            <Input
                                id="max-fame"
                                placeholder="max"
                                className="h-8 flex-1"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="distance">Location</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="location"
                                placeholder="TODO (map? country?)"
                                className="h-8 flex-1"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="distance">Radius (km)</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="max-distance"
                                placeholder="max"
                                className="h-8 flex-1"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="common-tags">Tags</Label>
                        <div className="col-span-2 flex gap-1">
                            <Input
                                id="tags"
                                placeholder="tags separated by space"
                                className="h-8 flex-1"
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
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="common-tags">Sort criteria</Label>
                        <div className="col-span-2 flex gap-1">
                            <div className="flex gap-2 w-full">
                                <Select>
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
                                <Button className="cursor-pointer">
                                    <ArrowDownNarrowWide /> { /* ascending. Descending=arrow-up-narrow-wide*/}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 mt-4">
                {
                    people.map((item, idx) =>
                        <Card className="w-full rounded-md py-4 gap-3">
                            <CardContent className="px-4">
                                <div className="object-cover w-full">
                                    <img className="rounded-lg" src={`https://lipsum.app/random/680x420?seed=${idx}`} alt="#" />
                                </div>
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
                                <div className="w-full mt-2 flex flex-wrap gap-1">
                                    {item.tags.map(tag => <Badge variant="outline" className="text-md">{tag}</Badge>)}
                                </div>
                            </CardFooter>
                        </Card>
                    )
                }
            </div>
        </div>
    )
}