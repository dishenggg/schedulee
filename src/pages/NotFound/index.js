import React from "react";
import {Title} from "../../components/Typography/Title"
import { useNavigate } from 'react-router-dom';
import {Button, Result} from 'antd'


const NotFound = () => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    try {
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button type="primary" onClick={handleClick}>Back Home</Button>}
  />
  );
};

export default NotFound;