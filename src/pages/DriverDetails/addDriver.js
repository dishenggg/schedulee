import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

function AddDriver(props) {
  const initialValues = {
    busNumber: "",
    contactNumber: "",
    icNumber: "",
    local: "",
    minSalary: "",
    name: "",
    normalSalary: "",
    peakHourSalary: "",
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const busNumber = values.busNumber.toUpperCase();
      const driverRef = doc(db, "Bus Drivers", busNumber);
      const driverSnapshot = await getDoc(driverRef);

      if (driverSnapshot.exists()) {
        alert(
          "Bus Number already exists. Please choose a different Bus Number."
        );
      } else {
        const updatedValues = {
          ...values,
          busNumber, // Update the busNumber value to the capitalized version
          local: values.local === "1",
        };

        await setDoc(driverRef, updatedValues);
        alert("Driver added successfully!");

        resetForm(); // Reset the form fields
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  const validateForm = (values) => {
    const errors = {};

    if (!values.busNumber) {
      errors.busNumber = "Bus Number is required";
    }

    if (!values.contactNumber) {
      errors.contactNumber = "Contact Number is required";
    } else if (!/^\d{8}$/.test(values.contactNumber)) {
      errors.contactNumber = "Contact Number must be 8 digits";
    }

    if (!values.icNumber) {
      errors.icNumber = "IC Number is required";
    }

    if (!values.local) {
      errors.local = "Local is required";
    }

    if (!values.minSalary) {
      errors.minSalary = "Minimum Salary is required";
    } else if (isNaN(parseFloat(values.minSalary))) {
      errors.minSalary = "Minimum Salary must be a valid number";
    }

    if (!values.normalSalary) {
      errors.normalSalary = "Normal Salary is required";
    } else if (isNaN(parseFloat(values.normalSalary))) {
      errors.normalSalary = "Normal Salary must be a valid number";
    }

    if (!values.peakHourSalary) {
      errors.peakHourSalary = "Peak Hour Salary is required";
    } else if (isNaN(parseFloat(values.peakHourSalary))) {
      errors.peakHourSalary = "Peak Hour Salary must be a valid number";
    }

    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validateForm}
    >
      <Form>
        <div className="input-container">
          <div className="form-control">
            <label htmlFor="busNumber">Bus Number</label>
            <Field type="text" id="busNumber" name="busNumber" />
            <ErrorMessage
              name="busNumber"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="contactNumber">Contact Number</label>
            <Field type="tel" id="contactNumber" name="contactNumber" />
            <ErrorMessage
              name="contactNumber"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="icNumber">IC Number</label>
            <Field type="text" id="icNumber" name="icNumber" />
            <ErrorMessage
              name="icNumber"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="local">Local</label>
            <Field component="select" id="local" name="local">
              <option value="">Select</option>
              <option value="1">True</option>
              <option value="0">False</option>
            </Field>
            <ErrorMessage
              name="local"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="minSalary">Minimum Salary</label>
            <Field type="number" id="minSalary" name="minSalary" />
            <ErrorMessage
              name="minSalary"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="name">Name</label>
            <Field type="text" id="name" name="name" />
            <ErrorMessage
              name="name"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="normalSalary">Normal Salary</label>
            <Field
              type="number"
              id="normalSalary"
              name="normalSalary"
              step="0.01"
            />
            <ErrorMessage
              name="normalSalary"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-control">
            <label htmlFor="peakHourSalary">Peak Hour Salary</label>
            <Field
              type="number"
              id="peakHourSalary"
              name="peakHourSalary"
              step="0.01"
            />
            <ErrorMessage
              name="peakHourSalary"
              component="div"
              className="error-message"
            />
          </div>
        </div>

        <div className="btn-container">
          <button type="submit">Add Driver</button>
        </div>
      </Form>
    </Formik>
  );
}

export default AddDriver;
