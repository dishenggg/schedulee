import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

export function useAuth() {
    //
    const [currentUser, setCurrentUser] = useState();
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, (user) =>
            setCurrentUser(user)
        );
        return unSubscribe;
    }, []);
    return currentUser;
}
