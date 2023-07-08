import { Outlet, Navigate } from "react-router-dom";
import { auth } from "../firebase";

const PrivateRoutes = () => {
  let user = auth.currentUser;
  console.log(user);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
