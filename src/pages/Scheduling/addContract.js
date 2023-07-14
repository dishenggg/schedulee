import React, { useState } from "react";
import { Button, Modal } from "antd";
import ContractForm from "./Forms/contractForm";

const AddContract = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Contract Job
      </Button>
      <Modal
        open={openModal}
        title="Add Contract Job"
        footer={null}
        onCancel={() => {
          setOpenModal(false);
        }}
        width={1000}
      >
        <div>
          <ContractForm />
        </div>
      </Modal>
    </div>
  );
};

export default AddContract;
