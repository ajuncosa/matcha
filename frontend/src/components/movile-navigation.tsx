import { Compass, MessageCircle, Search, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

const mobileMenuItems = [
    {
        url: "/browser",
        icon: Compass,
        active: true,
    },
    {
        url: "/search",
        icon: Search,
        active: false,
    },
    {
        url: "/chat",
        icon: MessageCircle,
        active: false,
    },
        {
        url: "/profile",
        icon: User,
        active: false,
    },
];

export default function MobileNavigation() {
    const [menuItems, setMenuItems] = useState(mobileMenuItems);

    function handleMenuItemClick(menuItemUrl: string) {
        const newMenuItems = [...menuItems];

        newMenuItems.forEach((item) => {
            item.active = false;
            if (item.url == menuItemUrl)
                item.active = true;
        })

        setMenuItems(newMenuItems);
    }

    return (
        <div className="fixed bottom-0 w-full flex justify-between p-2 md:hidden gap-2 bg-white">
            {menuItems.map((menuItem, index) => {
                return (
                    <NavLink 
                        key={index}
                        to={menuItem.url} 
                        className={`cursor-pointer w-full flex justify-center items-center py-2 rounded-md ${(menuItem.active) ? "bg-zinc-100" : null}`}
                        onClick={() => handleMenuItemClick(menuItem.url)}
                    >
                        <menuItem.icon/>
                    </NavLink>
                )
            })}
        </div>
    )
}