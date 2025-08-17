import { createContext } from "react";
import { type User } from "../../service/api";

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
