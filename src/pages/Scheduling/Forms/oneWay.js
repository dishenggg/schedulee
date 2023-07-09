import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
  useField,
} from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function OneWayForm() {
  const initialValues = {
    customerName: "",
    description: "",
    contactPersonName: "",
    contactPersonPhoneNumber: "",
    dates: [],
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
      values.dates.length > 0 &&
      values.pickupPoint &&
      values.dropOffPoint
    ) {
      const formData = {
        customerName: values.customerName,
        description: values.description,
        contactPersonName: values.contactPersonName,
        contactPersonPhoneNumber: values.contactPersonPhoneNumber,
        dates: values.dates,
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
        {({ values, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="customerName">Customer Name:</label>
              <Field
                type="text"
                id="customerName"
                name="customerName"
                required
              />
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
              <label htmlFor="dates">Dates:</label>
              <FieldArray name="dates">
                {(arrayHelpers) => (
                  <div>
                    {values.dates.map((date, index) => (
                      <div key={index}>
                        <DatePicker
                          selected={date}
                          onChange={(value) =>
                            arrayHelpers.replace(index, value)
                          }
                          dateFormat="dd/MM/yy hh:mm a"
                          minDate={new Date()}
                          showTimeInput
                          required
                        />
                        <button
                          type="button"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          Remove Date
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => arrayHelpers.push(null)}
                    >
                      Add Date
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>
            <div>
              <label htmlFor="pickupPoint">Pick Up Point:</label>
              <Field type="text" id="pickupPoint" name="pickupPoint" required />
            </div>
            <div>
              <label htmlFor="dropOffPoint">Drop Off Point:</label>
              <Field
                type="text"
                id="dropOffPoint"
                name="dropOffPoint"
                required
              />
            </div>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default OneWayForm;
