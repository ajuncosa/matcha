import {StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { useRouteError, isRouteErrorResponse, Outlet } from 'react-router';
import './index.css';

import Register from '@/pages/Register';
import Login from '@/pages/Login';
import { ProtectedRoute } from '@/guards/ProtectedRoute';
import HomeLayout from '@/components/home-layout';
import SearchPage from '@/pages/Search';
import BrowsePage from '@/pages/Browse';
import ProfilePage from '@/pages/Profile';
import ChatPage from '@/pages/Chat';
import Welcome from '@/pages/Welcome';
import { AuthContextProvider } from './contexts/AuthContextProvider';
import { SocketContextProvider } from './contexts/SocketContextProvider';
import { NotificationsContextProvider } from './contexts/NotificationsContextProvider';
import { Toaster } from 'sonner';
import { ChatContextProvider } from './contexts/ChatContextProvider';

function Index() {
    return <>
        <div>Sup dude</div>
        <div><a className='text-blue-500' href="/register">register</a></div>
        <div><a className='text-blue-500' href="/login">login</a></div>
    </>;
}

function RootLayout() {
    return (
        <AuthContextProvider>
            <SocketContextProvider>
                <NotificationsContextProvider>
                    <ChatContextProvider>
                        <>
                            <Outlet />
                            <Toaster mobileOffset={{ bottom: '56px' }}/>
                        </>
                    </ChatContextProvider>
                </NotificationsContextProvider>
            </SocketContextProvider>
        </AuthContextProvider>
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
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            {
                element: <ProtectedRoute/>,
                path: "",
                children: [
                    {
                        element: <HomeLayout/>,
                        path: "",
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
                    {
                        path: "/welcome",
                        element: <Welcome/>
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