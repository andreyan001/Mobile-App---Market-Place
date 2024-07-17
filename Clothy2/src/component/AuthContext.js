import React, { createContext, useState, useEffect } from 'react';
import { ref, get, getDatabase } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const database = getDatabase();
        const dbRef = ref(database, `users/${user.uid}/role`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          setRole(snapshot.val());
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
