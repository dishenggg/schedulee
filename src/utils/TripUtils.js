import { ParseTimeToFirestore } from "./ParseTime";

//Used to create default form to be sent in FB
export function createDefaultTripTemplate(
  values,
  tripDescription,
  tripType,
  startTime,
  endTime
) {
  return {
    bus: [],
    customerName: values.customerName,
    description: values.description,
    contactName: values.contactPersonName,
    contactNumber: values.contactPersonPhoneNumber,
    pickUpPoint: values.pickUpPoint,
    dropOffPoint: values.dropOffPoint,
    type: tripType,
    numPax: values.numPax,
    numBus: values.numBus,
    numBusAssigned: 0,
    tripDescription: tripDescription,
    startTime: ParseTimeToFirestore(startTime, values.date),
    endTime: ParseTimeToFirestore(endTime, values.date),
    price: 0,
    gst: 0,
    subConPayment: 0,
  };
}
