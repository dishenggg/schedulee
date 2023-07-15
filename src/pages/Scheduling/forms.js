import OneWayForm from "./Forms/oneWay.js";
import TwoWayForm from "./Forms/twoWay.js";
import Disposal from "./Forms/disposal.js";

export function TripForm({
  value = "1",
  setOpenModal,
  updateListOfTripsByDriver,
}) {
  if (value === "1") {
    return (
      <OneWayForm
        setOpenModal={setOpenModal}
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    );
  } else if (value === "2") {
    return (
      <TwoWayForm
        setOpenModal={setOpenModal}
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    );
  } else if (value === "3") {
    return (
      <Disposal
        setOpenModal={setOpenModal}
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    );
  }
}
