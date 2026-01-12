import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, useNavigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { useRouteError, isRouteErrorResponse, Outlet } from 'react-router';
import './index.css';

import Register from '@/pages/Register';
import Login from '@/pages/Login';
import { authGuard, noAuthGuard } from '@/components/auth-guard';
import HomeLayout from '@/components/home-layout';
import SearchPage from './pages/Search';
import BrowsePage from './pages/Browse';
import ProfilePage from './pages/Profile';
import ChatPage from './pages/Chat';
import Welcome from './pages/Welcome';


function Index() {
    return <>
        Sup dude
    </>;
}

function RootLayout() {
    let navigate = useNavigate();

    async function checkSession() {
        const sessionCheck = await fetch('http://localhost/api/auth/check-session');

        if (sessionCheck.status != 200) {
            localStorage.setItem("loggedIn", "false");
        } else {
            const response = await sessionCheck.json();
            if (response["profileCompleted"] == false) {
                navigate('/welcome');
            }

            localStorage.setItem("loggedIn", "true");
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    return (
        <Outlet />
    );
}

function NotFoundPage() {
    return (
        <div>
            404 | Not Found
        </div>
    )
}

function RootErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <>
            <h1>
                {error.status} {error.statusText}
            </h1>
            <p>{error.data}</p>
            </>
        );
    } else if (error instanceof Error) {
        return (
            <div>
            <h1>Error</h1>
            <p>{error.message}</p>
            <p>The stack trace is:</p>
            <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <RootErrorBoundary />,
        children: [
            { index: true, element: <Index /> },
            { path: 'login', middleware: [noAuthGuard], element: <Login /> },
            { path: 'register', middleware: [noAuthGuard], element: <Register /> },
            { path: 'welcome', middleware: [authGuard], element: <Welcome /> },
            {
                element: <HomeLayout/>,
                middleware: [authGuard],
                children: [
                    {
                        path: "/search",
                        element: <SearchPage/>
                    },
                    {
                        path: "/browser",
                        element: <BrowsePage/>
                    },
                    {
                        path: "/profile",
                        element: <ProfilePage/>
                    },
                    {
                        path: "/chat",
                        element: <ChatPage/>
                    }
                ]
            },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);