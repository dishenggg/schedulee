import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

const AddSubCon = ({ updateSubConsList }) => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const onCreate = async (values) => {
    try {
      const subConRef = doc(db, "Sub Cons", values.companyName);
      const subConsSnapshot = await getDoc(subConRef);

      if (subConsSnapshot.exists()) {
        message.error("Sub Con already exists.");
      } else {
        setConfirmLoading(true);
        await setDoc(subConRef, values);
        updateSubConsList();
        message.success("Sub Con added successfully!");
        setOpenModal(false);
        setConfirmLoading(false);
      }
    } catch (error) {
      message.error(error.toString());
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Sub Con
      </Button>
      <Modal
        open={openModal}
        title="Add Sub Con"
        okText="Submit"
        cancelText="Cancel"
        onCancel={() => {
          setOpenModal(false);
        }}
        confirmLoading={confirmLoading}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              onCreate(values);
            })
            .catch((info) => {
              console.log("Validation Error:", info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="driver form"
          initialValues={{
            local: "1",
          }}
        >
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[
              {
                required: true,
                message: "'${label}' Required",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tag"
            label="Tag"
            rules={[
              {
                required: true,
                message: "'${label}' Required",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            label="Contact No."
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[689]\d{7}$/,
                message: "Check '${label}' Format",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddSubCon;
