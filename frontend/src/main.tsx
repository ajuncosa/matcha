import {StrictMode, useEffect, useState } from 'react';
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

import { User } from './entities/User';
import { AuthContext } from './entities/AuthContext';
import { SocketContext } from './entities/Socket';

function Index() {
    return <>
        Sup dude
    </>;
}

function RootLayout() {
    let navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);

    async function initApp() {
        const user: User | null = await User.checkSession();

        if (!user) {
            navigate('/login');
            return;
        }

        setUser(user);

        if (user.hasProfileCompleted()) {
            navigate("/browser");
            return;
        }
        else {
            navigate("/welcome");
        }
    }

    useEffect(() => {
        initApp();
    }, []);

    return (
        <AuthContext value={{user, setUser}}>
            <SocketContext value={{socket: null}}>
                <Outlet />
            </SocketContext>
        </AuthContext>
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