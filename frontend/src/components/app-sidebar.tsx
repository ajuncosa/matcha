"use client"

import * as React from "react"
import {
	Heart,
	Compass,
	Search,
	MessageCircle
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import { useContext, useMemo } from "react"
import AuthContext from "@/contexts/AuthContextProvider"
import ChatContext from "@/contexts/ChatContextProvider"
import { API_URL } from "@/lib/config"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useContext(AuthContext);
    const { chats } = useContext(ChatContext);
    const { setOpenMobile, isMobile } = useSidebar();
    const totalUnread = useMemo(() => chats.reduce((acc, c) => acc + c.unreadMessages, 0), [chats]);
    const navMain = [
        { title: "Browser", url: "/browser", icon: Compass },
        { title: "Search", url: "/search", icon: Search },
        { title: "Chat", url: "/chat", icon: MessageCircle, badge: totalUnread || undefined },
    ];
	const navUser = {
		name: `${user.name} ${user.lastname}`.trim(),
		email: user.email,
		avatar: user.profilePhotoPath ? `${API_URL}/images/${user.profilePhotoPath}` : ""
	};
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="/browser" onClick={() => { if (isMobile) setOpenMobile(false); }}>
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Heart className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">Matcha</span>
									<span className="truncate text-xs">Find your love</span>
								</div>
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={navUser} />
			</SidebarFooter>
		</Sidebar>
	)
}
