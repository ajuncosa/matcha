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
import { Button } from "./ui/button"
import { LogOutIcon } from "lucide-react"
import MobileNavigation from "./movile-navigation"
import { useContext } from "react"
import AuthContext from "@/contexts/AuthContextProvider"
import SocketContext from "@/contexts/SocketContextProvider"
import { NotificationsPanel } from "./notifications-panel"

export default function HomeLayout() {
    let navigate = useNavigate();
    let { deleteUser } = useContext(AuthContext);
    let userSocket = useContext(SocketContext);

    async function handleLogoutClick() : Promise<void> {
        userSocket.disconnect();
        deleteUser();
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
                            <NotificationsPanel/>
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
