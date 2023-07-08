import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {Menu} from 'antd'
import {DollarOutlined, CalendarOutlined, CarOutlined, IdcardOutlined} from '@ant-design/icons'


const menuItems = [
  {
    label: (<Link to="/salary">Salary</Link>),
    key: 'salary',
    icon:<DollarOutlined />,
  },
  {
    label: (<Link to="/scheduling">Schedule</Link>),
    key: 'schedule',
    icon:<CalendarOutlined />,
  },
  {
    label: (<Link to="/bus-details">Bus Details</Link>),
    key: 'bus',
    icon:<CarOutlined />,
  },
  {
    label: (<Link to="/driver-details">Driver Details</Link>),
    key: 'Driver',
    icon:<IdcardOutlined />,
  },

]
const Navbar = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState('salary')
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const onClick = (e) => {
    setPage(e.key)
  };
  return (
    <Menu onClick={onClick} selectedKeys={[[page]]} mode='horizontal' items={menuItems}/>
  );
};

export default Navbar;
