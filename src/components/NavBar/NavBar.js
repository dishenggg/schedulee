import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Menu, Button } from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  IdcardOutlined,
  LogoutOutlined,
  UserOutlined,
  CarOutlined,
} from "@ant-design/icons";

const Navbar = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState("salary");

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    {
      label: <Link to="/salary">Salary</Link>,
      key: "salary",
      icon: <DollarOutlined />,
    },
    {
      label: <Link to="/scheduling">Schedule</Link>,
      key: "schedule",
      icon: <CalendarOutlined />,
    },
    {
      label: <Link to="/customer-details">Customer Details</Link>,
      key: "customer",
      icon: <UserOutlined />,
    },
    {
      label: <Link to="/driver-details">Driver Details</Link>,
      key: "driver",
      icon: <IdcardOutlined />,
    },
    {
      label: <Link to="/subcon-details">Sub Con Details</Link>,
      key: "subcon",
      icon: <CarOutlined />,
    },
    {
      label: <>{auth?.currentUser?.email}</>,
      style: { marginLeft: "auto" },
      children: [
        {
          label: (
            <Button
              type="ghost"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          ),
          key: "logout",
        },
      ],
    },
  ];

  const onClick = (e) => {
    setPage(e.key);
  };
  return (
    <Menu
      onClick={onClick}
      selectedKeys={[[page]]}
      mode="horizontal"
      items={menuItems}
    />
  );
};

export default Navbar;
