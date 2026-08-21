import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"

// "Ada Lovelace" -> "AL". Used when the user has no profile photo set.
function getInitials(name: string): string {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    return initials || "?"
}

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <NavLink to="/profile">
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            {user.avatar && (
                                <AvatarImage className="object-cover" src={user.avatar} alt={user.name} />
                            )}
                            <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="truncate text-xs">{user.email}</span>
                        </div>
                    </SidebarMenuButton>
                </NavLink>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
