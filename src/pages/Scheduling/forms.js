import OneWayForm from "./Forms/oneWay.js";
import TwoWayForm from "./Forms/twoWay.js";

export function Form({ value = 1 }) {
  if (value === 1) {
    return (
      <>
        <OneWayForm />
      </>
    );
  } else if (value === 2) {
    return (
      <>
        <TwoWayForm />
      </>
    );
  } else if (value === 3) {
    return <>some crap some crap some crap</>;
  } else if (value === 4) {
    return <>some crap some crap some crap some crap </>;
  }
}