import { ParseTimeToFirestore } from "./ParseTime";

//Function will be used to check if trip is considered Peak period, used during Create and Update of trips
export function checkPeak(tripDateAndTime) {
  return false;
}

//Used to create default form to be sent in FB
export function createDefaultTripTemplate(
  values,
  tripDescription,
  tripType,
  startTime,
  endTime
) {
  const tripStartTime = ParseTimeToFirestore(startTime, values.date);
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
    startTime: tripStartTime,
    endTime: ParseTimeToFirestore(endTime, values.date),
    isPeak: checkPeak(tripStartTime),
    price: 0,
    gst: 0,
    subConPayment: 0,
  };
}
