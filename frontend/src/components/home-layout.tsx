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
    const navigate = useNavigate();
    const { deleteUser } = useContext(AuthContext);
    const userSocket = useContext(SocketContext);

    async function handleLogoutClick() : Promise<void> {
        userSocket.disconnect();
        deleteUser();
        navigate('/login');
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-svh">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <div className="w-full flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
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
                <main className="flex-1 min-h-0 overflow-y-auto p-4 pt-0 pb-24 md:pb-4 max-w-[1200px] mx-auto w-full">
                    <Outlet />
                </main>
                <footer className="shrink-0 text-center text-muted-foreground text-sm py-6 border-t">
                    © {new Date().getFullYear()} matcha
                </footer>
                <MobileNavigation />
            </SidebarInset>
        </SidebarProvider>
    )
}
