import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const PrivateRoutes = () => {
  let user = useAuth();
  return typeof user === "undefined" ? (
    <></>
  ) : user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoutes;
