import { Select, message } from "antd";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import {
  ParseDateToFirestore,
  ParseTimeFromFirestoreToString,
} from "../../utils/ParseTime";
import {
  doc,
  updateDoc,
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  parseDateTimeFromStringToFireStore,
  ParseTimeFromFirestore,
} from "../../utils/ParseTime";
const BusCellRenderer = ({
  params,
  listOfDriverIds,
  listOfTripsByDriver,
  dateWithoutDashes,
  updateListOfTripsByDriver,
  driverDetails,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const unscheduledTrips = useMemo(() => "Unscheduled Trips", []);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [changed, setChanged] = useState(false);
  const status = useMemo(
    () => (params.data.bus.length > params.data.numBus ? "warning" : ""),
    [params]
  );

  const checkTimeClash = useCallback(
    (data, driverId) => {
      if (driverId === unscheduledTrips) return false;
      // Check for timing clashes with existing trips
      const newTripStartTime = parseDateTimeFromStringToFireStore(
        ParseTimeFromFirestoreToString(data.startTime),
        dateWithoutDashes
      );
      const newTripEndTime = parseDateTimeFromStringToFireStore(
        ParseTimeFromFirestoreToString(data.endTime),
        dateWithoutDashes
      );
      for (const trip of listOfTripsByDriver[driverId] || []) {
        const tripStartTime = ParseTimeFromFirestore(trip.startTime).add(
          -15,
          "minute"
        );
        const tripEndTime = ParseTimeFromFirestore(trip.endTime).add(
          15,
          "minute"
        );
        const diffNewStartOldEnd = newTripStartTime.diff(tripEndTime, "minute");
        const diffNewEndOldStart = newTripEndTime.diff(tripStartTime, "minute");
        if (diffNewEndOldStart >= 0 && diffNewStartOldEnd <= 0) {
          return true;
        }
      }
      return false;
    },
    [dateWithoutDashes, listOfTripsByDriver, unscheduledTrips]
  );

  const getOptions = useCallback(
    (params, listOfDriverIds, driverDetails) => {
      const res = Object.values(listOfDriverIds).filter((driver) => {
        const driverId = driver.value;
        if (driverId === unscheduledTrips) {
          return false;
        }

        const driverObj = driverDetails[driverId];
        const driverData = { ...driverObj };
        const busSize = driverData.busSize;
        const rowData = params.node.data;
        const paxSize = rowData.numPax;
        if (busSize < paxSize) {
          return false; // Hide grid if bus size is smaller than required
        }
        return !checkTimeClash(rowData, driverId); // Display grid if there are no clashes or bus size issues
      });
      if (JSON.stringify(res) !== JSON.stringify(options)) {
        setOptions(res);
      }
    },
    [checkTimeClash, unscheduledTrips]
  );

  useEffect(() => {
    getOptions(params, listOfDriverIds, driverDetails);
  }, [listOfDriverIds, driverDetails, getOptions]);

  // const handleChange = (value) => {
  //     setChanged(true);
  //     setSelected(value);
  // };
  const handleChange = (value) => {
    const data = params.node.data;
    const requiredBuses = data.numBus; // Number of buses required for this trip
    const numBusesAssigned = value.length; // Number of buses currently assigned

    if (numBusesAssigned > requiredBuses) {
      message.error("You cannot assign more buses than required");
    } else {
      setChanged(true);
      setSelected(value);
    }
  };

  const onBlur = async (e) => {
    if (!changed) return;

    try {
      const data = params.node.data;
      if (selected.length > data.numBus)
        throw new Error("You cannot assign more buses than required");
      const id = data.id;
      // const tripRef = doc(db, "Dates", dateWithoutDashes, "trips", id);
      const tripRef = doc(db, "Trips", id);
      await updateDoc(tripRef, {
        bus: selected,
        numBusAssigned: selected.length,
      });
      message.success("Successfully Updated Buses");
      updateListOfTripsByDriver();
    } catch (error) {
      message.error(error.toString());
    } finally {
      setSelected([]);
      setChanged(false);
    }
  };

  const onDeselect = async (value) => {
    if (dropDownOpen) return;

    try {
      const data = params.node.data;
      const id = data.id;
      const tripRef = doc(db, "Dates", dateWithoutDashes, "trips", id);
      await runTransaction(db, async (transaction) => {
        const docSnapshot = await transaction.get(tripRef);
        transaction.update(docSnapshot.ref, {
          bus: arrayRemove(value),
          numBusAssigned: docSnapshot.data().numBusAssigned - 1,
        });
      });
      message.success("Successfully Updated Buses");
      updateListOfTripsByDriver();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const onDropdownVisibleChange = useCallback((open) => {
    setDropDownOpen(open);
  }, []);

  return (
    <Select
      mode="multiple"
      style={{ width: "100%", height: "100%" }}
      placeholder="No Bus Assigned"
      defaultValue={params.data.bus}
      onChange={handleChange}
      onBlur={onBlur}
      onDeselect={onDeselect}
      options={options}
      status={status}
      onDropdownVisibleChange={onDropdownVisibleChange}
    ></Select>
  );
};

export default memo(BusCellRenderer);
