import { createContext, useContext, useMemo, useState } from "react";

const TOKEN_STORAGE_KEY = "forms_auth_token";
const USER_STORAGE_KEY = "forms_auth_user";

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => readStoredUser());

  function persistSession(nextToken, nextUser) {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function login(nextToken, nextUser) {
    persistSession(nextToken, nextUser);
  }

  function updateSession(nextToken, nextUser) {
    persistSession(nextToken, nextUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const contextValue = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      updateSession,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export const authStorageKeys = {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
};
