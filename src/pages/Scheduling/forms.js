import OneWayForm from "./Forms/oneWay.js";
import TwoWayForm from "./Forms/twoWay.js";
import Disposal from "./Forms/disposal.js";

export function TripForm({ value = "1", setOpenModal }) {
  if (value === "1") {
    return <OneWayForm setOpenModal={setOpenModal} />;
  } else if (value === "2") {
    return <TwoWayForm setOpenModal={setOpenModal} />;
  } else if (value === "3") {
    return <Disposal setOpenModal={setOpenModal} />;
  }
}
