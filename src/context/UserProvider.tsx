import { useState, useEffect, type ReactNode } from "react";
import { Api, type User } from "../../service/api";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(Api.getUser());

  const fetchUser = async () => {
    try {
      const me = await Api.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!user && Api.getToken()) {
      fetchUser();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};