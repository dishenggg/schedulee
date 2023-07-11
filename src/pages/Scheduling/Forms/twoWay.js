import { Formik, Form, Field, ErrorMessage } from "formik";

function TwoWayForm() {
  const initialValues = {
    customerName: "",
    description: "",
    contactPersonName: "",
    contactPersonPhoneNumber: "",
    date: "",
    pickupPoint: "",
    dropOffPoint: "",
  };

  const handleSubmit = (values) => {
    // Perform validation and submit the form data
    if (
      values.customerName &&
      values.description &&
      values.contactPersonName &&
      values.contactPersonPhoneNumber &&
      values.date &&
      values.pickupPoint &&
      values.dropOffPoint
    ) {
      const formData = {
        customerName: values.customerName,
        description: values.description,
        contactPersonName: values.contactPersonName,
        contactPersonPhoneNumber: values.contactPersonPhoneNumber,
        date: values.date,
        pickupPoint: values.pickupPoint,
        dropOffPoint: values.dropOffPoint,
      };
      console.log("Form data:", formData);
      // Add your logic here to submit the form data to the backend or perform further actions
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <div>
      <h2>Form</h2>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form>
          <div>
            <label htmlFor="customerName">Customer Name:</label>
            <Field type="text" id="customerName" name="customerName" required />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <Field type="text" id="description" name="description" required />
          </div>
          <div>
            <label htmlFor="contactPersonName">Contact Person Name:</label>
            <Field
              type="text"
              id="contactPersonName"
              name="contactPersonName"
              required
            />
          </div>
          <div>
            <label htmlFor="contactPersonPhoneNumber">
              Contact Person Phone Number:
            </label>
            <Field
              type="text"
              id="contactPersonPhoneNumber"
              name="contactPersonPhoneNumber"
              required
            />
          </div>
          <div>
            <label htmlFor="date">Date:</label>
            <Field type="text" id="date" name="date" required />
          </div>
          <div>
            <label htmlFor="pickupPoint">Pick Up Point:</label>
            <Field type="text" id="pickupPoint" name="pickupPoint" required />
          </div>
          <div>
            <label htmlFor="dropOffPoint">Drop Off Point:</label>
            <Field type="text" id="dropOffPoint" name="dropOffPoint" required />
          </div>
          <div>
            <label htmlFor="date">Return Date:</label>
            <Field type="text" id="date" name="date" required />
          </div>
          <div>
            <label htmlFor="pickupPoint">Return Pick Up Point:</label>
            <Field type="text" id="pickupPoint" name="pickupPoint" required />
          </div>
          <div>
            <label htmlFor="dropOffPoint">Return Drop Off Point:</label>
            <Field type="text" id="dropOffPoint" name="dropOffPoint" required />
          </div>
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
}
export default TwoWayForm;
