import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <nav>
      <ul>
        <li>
          <Link to="/salary">Salary</Link>
        </li>
        <li>
          <Link to="/scheduling">Scheduling</Link>
        </li>
        <li>
          <Link to="/bus-details">Bus Details</Link>
        </li>
        <li>
          <Link to="/driver-details">Driver Details</Link>
        </li>
        <li>
          <Link onClick={handleLogout}>{auth?.currentUser?.email} Log Out</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
