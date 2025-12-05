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
import { Outlet } from "react-router"

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
import { Bell, ThumbsUp } from "lucide-react"
import { Badge } from "./ui/badge"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import MobileNavigation from "./movile-navigation"

export default function HomeLayout() {
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
                    <div className="px-4">
                        <Sheet>
                            <SheetTrigger className="cursor-pointer relative flex gap-1">
                                <Bell />
                                <Badge variant="outline">99</Badge>
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
                </header>
                <main className="p-4 pt-0">
                    <Outlet />
                </main>
                <MobileNavigation/>
            </SidebarInset>
        </SidebarProvider>
    )
}
