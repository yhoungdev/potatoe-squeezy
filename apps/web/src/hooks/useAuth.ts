import { useState, useEffect } from 'react';
import { webSupabase } from "../../libs/supabase";

const useAuth = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ user , setUser ] = useState<Record<string, string>>({});

    const checkIfIsAuthenticated = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await webSupabase.auth.getSession();

            if (session) {
                setSession(session);
                setUser(session?.user)
            }
        } catch (err) {
            console.error("Error checking authentication:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkIfIsAuthenticated();
    }, []);

    return { session, loading, error , user };
};

export default useAuth;
