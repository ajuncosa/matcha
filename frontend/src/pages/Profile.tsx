import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mars, ThumbsUpIcon } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-start gap-4">
                    {/* Avatar */}
                    <div>
                        <Avatar className="rounded-lg w-32 h-32">
                            <AvatarImage
                                src="https://github.com/evilrabbit.png"
                                alt="@evilrabbit"
                            />
                            <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                    </div>
                    {/* User info */}
                    <div className="flex flex-col justify-center">
                        <Badge className="bg-emerald-600">Online</Badge>
                        <div className="flex gap-2 mt-2">
                            <span className="text-4xl">Name</span>
                            <span className="text-4xl">Lastname</span>
                        </div>
                        <div className="mt-2">
                            <Mars width={32} height={32} />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-center flex-col">
                        <span className="text-xs text-muted-foreground uppercase">rating</span>
                        <div className="text-4xl font-bold">1.000</div>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <Button variant="outline" size="lg" className="cursor-pointer">
                    <ThumbsUpIcon /> Like User
                </Button>
            </div>

            {/* Body */}

            <div className="w-full mt-4">
                <h2 className="text-2xl">Interests</h2>
                <div className="w-full mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-md">#Cars</Badge>
                    <Badge variant="outline" className="text-md">#Keyboards</Badge>
                    <Badge variant="outline" className="text-md">#Planes</Badge>
                    <Badge variant="outline" className="text-md">#Trains</Badge>
                    <Badge variant="outline" className="text-md">#Takumi</Badge>
                    <Badge variant="outline" className="text-md">#Games</Badge>
                    <Badge variant="outline" className="text-md">#Computers</Badge>
                    <Badge variant="outline" className="text-md">#C++</Badge>
                </div>
            </div>
            
            <div className="w-full mt-4">
                <h2 className="text-2xl">Biography</h2>
                <p className="mt-2 text-justify">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                    dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>
            
             <div className="w-full mt-4">
                <h2 className="text-2xl">Photos</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="object-cover w-full">
                        <img className="rounded-lg" src="https://lipsum.app/random/680x420?seed=1" alt="#" />
                    </div>
                    <div className="object-cover w-full">
                        <img className="rounded-lg" src="https://lipsum.app/random/680x420?seed=2" alt="#" />
                    </div>
                </div>
            </div>

        </div>
    )
}