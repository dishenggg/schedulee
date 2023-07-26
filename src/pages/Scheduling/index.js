import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { Space, DatePicker, Tabs } from "antd";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";
import AddContract from "./addContract";
import { db } from "../../firebase";
import { collection, getDocs, where, query, orderBy } from "firebase/firestore";
// import { ParseDateToFirestore } from '../../utils/ParseTime';
import dayjs from "dayjs";

const SchedulingApp = lazy(() => import("./SchedulingApp"));
const AllTrips = lazy(() => import("./AllTrips"));

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editable, setEditable] = useState(true);
  const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});
  const [listOfTripsBySubCon, setListOfTripsBySubCon] = useState({});
  const [listofUnscheduledTrips, setListOfUnscheduledTrips] = useState([]);
  const [listOfDrivers, setListOfDrivers] = useState([]);
  const [listOfTrips, setListOfTrips] = useState([]);
  const [listOfSubCons, setListOfSubCons] = useState([]);
  const [driverDetails, setDriverDetails] = useState({});

  const handleDateChange = useCallback((date, dateString) => {
    setSelectedDate(date.toDate());

    const currentDate = new Date();

    if (date.toDate().setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  }, []);

  const formattedDate = useMemo(
    () => selectedDate.toLocaleDateString("en-GB"),
    [selectedDate]
  );

  const datePickerDefault = useMemo(() => dayjs(), []);

  const populateListOfTripsByDriverOrSubCon = (trips) => {
    const subConSet = new Set(listOfSubCons.map((subCon) => subCon.id));
    const drivers = {};
    const unscheduledTrips = [];

    const subCons = {};

    trips.forEach((trip) => {
      if (trip.numBusAssigned < trip.numBus) {
        unscheduledTrips.push(trip);
      }

      trip.bus.forEach((driverOrSubConId) => {
        if (subConSet.has(driverOrSubConId)) {
          if (!subCons[driverOrSubConId]) {
            subCons[driverOrSubConId] = [];
          }
          subCons[driverOrSubConId].push(trip);
        } else {
          if (!drivers[driverOrSubConId]) {
            drivers[driverOrSubConId] = [];
          }
          drivers[driverOrSubConId].push(trip);
        }
      });
    });
    setListOfTripsByDriver(drivers);
    setListOfTripsBySubCon(subCons);
    setListOfUnscheduledTrips(unscheduledTrips);
  };

  const populateListOfDrivers = async () => {
    const driverQuery = await getDocs(collection(db, "Bus Drivers"));

    const drivers = driverQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setListOfDrivers(drivers);
  };

  const populateListOfSubCons = async () => {
    const subconQuery = await getDocs(collection(db, "Sub Cons"));

    const subCons = subconQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setListOfSubCons(subCons);
  };

  const populateListOfTrips = async (date) => {
    let currentDay = new Date(date);
    currentDay = new Date(currentDay.setHours(0, 0, 0, 0));
    let nextDay = currentDay.getTime() + 60 * 60 * 24 * 1000;
    nextDay = new Date(nextDay);

    const tripsQuery = await getDocs(
      query(
        collection(db, "Trips"),
        where("startTime", ">=", currentDay),
        where("startTime", "<", nextDay),
        orderBy("startTime")
      )
    );
    const trips = tripsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setListOfTrips(trips);
  };

  const populateDriverDetails = (drivers, subCons) => {
    const res = {};
    drivers.forEach((row) => {
      res[row.busNumber] = { ...row };
    });
    subCons.forEach((row) => {
      res[row.id] = { ...row };
    });
    setDriverDetails(res);
  };

  const updateListOfTripsByDriver = useCallback(() => {
    populateListOfTrips(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    populateListOfTrips(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    populateListOfTripsByDriverOrSubCon(listOfTrips);
  }, [listOfTrips]);

  useEffect(() => {
    populateDriverDetails(listOfDrivers, listOfSubCons);
  }, [listOfDrivers, listOfSubCons]);

  useEffect(() => {
    populateListOfDrivers();
    populateListOfSubCons();
  }, []);

  return (
    <>
      <Title level={2}>Scheduling Page</Title>
      <div>
        <Space align="center">
          <Title level={3} style={{ marginTop: "12px" }}>
            Date selected:
          </Title>
          <DatePicker
            allowClear={false}
            id="date-input"
            format="DD-MM-YYYY"
            defaultValue={datePickerDefault}
            onChange={handleDateChange}
          />
        </Space>
      </div>
      <Space style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        <AddTrip updateListOfTripsByDriver={updateListOfTripsByDriver} />
        <AddMultipleTrips
          drivers={listOfDrivers}
          subCons={listOfSubCons}
          updateListOfTripsByDriver={updateListOfTripsByDriver}
        />
        <AddContract updateListOfTripsByDriver={updateListOfTripsByDriver} />
      </Space>
      <Tabs
        type="card"
        destroyInactiveTabPane={true}
        items={[
          {
            label: "All Trips",
            key: 0,
            children: (
              <Suspense>
                <AllTrips
                  drivers={listOfDrivers}
                  subCons={listOfSubCons}
                  trips={listOfTrips}
                  selectedDate={formattedDate}
                  listOfTripsByDriver={listOfTripsByDriver}
                  updateListOfTripsByDriver={updateListOfTripsByDriver}
                  driverDetails={driverDetails}
                />
              </Suspense>
            ),
          },
          {
            label: "Scheduler",
            key: 1,
            children: (
              <Suspense>
                <SchedulingApp
                  selectedDate={formattedDate}
                  editable={editable}
                  listOfTripsByDriver={listOfTripsByDriver}
                  listOfTripsBySubCon={listOfTripsBySubCon}
                  listofUnscheduledTrips={listofUnscheduledTrips}
                  drivers={listOfDrivers}
                  subCons={listOfSubCons}
                  updateListOfTripsByDriver={updateListOfTripsByDriver}
                  driverDetails={driverDetails}
                />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
};

export default Scheduling;
