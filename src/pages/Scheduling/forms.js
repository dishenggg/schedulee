import OneWayForm from "./Forms/oneWay.js";
import TwoWayForm from "./Forms/twoWay.js";
import Disposal from "./Forms/disposal.js";
import Tour from "./Forms/tour.js";

export function TripForm({ value = "1", setOpenModal }) {
  if (value === "1") {
    return (
      <>
        <OneWayForm setOpenModal={setOpenModal} />
      </>
    );
  } else if (value === "2") {
    return (
      <>
        <TwoWayForm />
      </>
    );
  } else if (value === "3") {
    return <>some crap some crap some crap</>;
  } else if (value === "4") {
    return <>some crap some crap some crap some crap </>;
  }
}
