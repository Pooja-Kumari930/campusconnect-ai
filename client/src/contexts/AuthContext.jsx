import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService.js";
import { setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to silently refresh using the httpOnly cookie.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authService.me().catch(async () => {
          // /auth/me needs a bearer token; if we don't have one yet, the api
          // interceptor will attempt a refresh automatically on the 401 and retry.
          throw new Error("no session");
        });
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
