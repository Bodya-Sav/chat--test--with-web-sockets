import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { Api } from "../../service/api";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = Api.getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}