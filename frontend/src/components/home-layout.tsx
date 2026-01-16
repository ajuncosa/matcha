import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet, useNavigate } from "react-router"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { Bell, LogOutIcon, ThumbsUp } from "lucide-react"
import { Badge } from "./ui/badge"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import MobileNavigation from "./movile-navigation"
import { useContext } from "react"
import { AuthContext } from "@/entities/AuthContext"

export default function HomeLayout() {
    const { user, setUser } = useContext(AuthContext);
    let navigate = useNavigate();

    async function handleLogoutClick() : Promise<void> {

        if (user && setUser) {
            await user.logout();
            setUser(null);
        }

        navigate('/login');
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <div className="w-full flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4 hidden md:inline-flex"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Building Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4 px-4">
                        <div>
                            <Sheet>
                                <SheetTrigger className="cursor-pointer relative flex gap-1">
                                    <Bell />
                                    <Badge variant="destructive">4</Badge>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Notifications</SheetTitle>
                                    </SheetHeader>

                                    <div className="px-4">
                                        <div className="flex w-full max-w-lg flex-col gap-6">
                                            <Item variant="outline">
                                                <ItemMedia variant="icon">
                                                    <ThumbsUp />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>Maria liked you</ItemTitle>
                                                </ItemContent>
                                                <ItemActions>
                                                    <Button size="sm" variant="outline">
                                                        Review
                                                    </Button>
                                                </ItemActions>
                                            </Item>
                                        </div>
                                    </div>

                                    <SheetFooter>
                                        <SheetClose asChild>
                                            <Button variant="outline" className="cursor-pointer">Clear all</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div>
                            <Button variant="default" size="icon" className="cursor-pointer" onClick={async () => await handleLogoutClick()}>
                                <LogOutIcon />
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="p-4 pt-0 mb-24 max-w-[1200px] mx-auto w-full">
                    <Outlet />
                </main>
                <MobileNavigation />
            </SidebarInset>
        </SidebarProvider>
    )
}
