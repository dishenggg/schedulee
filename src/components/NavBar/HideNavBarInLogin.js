import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

const HideNavBarInLogin = ({ children }) => {
  const location = useLocation();

  const [showNavBar, setShowNavBar] = useState(false);
  let user = useAuth();

  useEffect(() => {
    if (location.pathname === "/login" || !user) {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [location, user]);

  return <div>{showNavBar && children}</div>;
};

export default HideNavBarInLogin;
