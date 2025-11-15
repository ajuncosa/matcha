import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import './index.css'

import Register from '@/views/Register';
import Login from "@/views/Login";

function Index() {
    return <>matcha</>
}

const router = createBrowserRouter([
    { path: "/", Component: Index },
    { path: "login", Component: Login },
    { path: "register", Component: Register }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)
