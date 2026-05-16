'use client';

// context/AuthContext.jsx
import { createContext, useContext } from 'react';

export const AuthContext = createContext();

// ✅ useAuth hook lives here
export const useAuth = () => useContext(AuthContext);
