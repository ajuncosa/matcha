import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { useRouteError, isRouteErrorResponse, Outlet } from 'react-router';
import './index.css';

import Register from '@/views/Register';
import Login from '@/views/Login';
import Home from '@/views/Home';
import { AuthGuard, NoAuthGuard } from './components/auth-guard';


function Index() {
    return <>
        
    </>;
}



function RootLayout() {
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
            { path: 'login', middleware: [NoAuthGuard], element: <Login /> },
            { path: 'register', middleware: [NoAuthGuard], element: <Register /> },
            { path: 'home', middleware: [AuthGuard], element: <Home /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);