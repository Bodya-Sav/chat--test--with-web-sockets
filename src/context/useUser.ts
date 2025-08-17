import { useContext } from "react";
import { UserContext, type UserContextType } from "./UserContext";

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUser должен использоваться внутри UserProvider");
  return ctx;
};
