// src/components/ProtectedRoute.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Do nothing while loading
        if (!session) router.push('/Login'); // Redirect if not authenticated
    }, [session, status, router]);

    if (status === 'loading' || !session) {
        return <div>Loading...</div>; // Add a loading spinner or message
    }

    return children;
};

export default ProtectedRoute;
