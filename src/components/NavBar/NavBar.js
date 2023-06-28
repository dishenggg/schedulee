import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
      </ul>
    </nav>
  );
};

export default Navbar;