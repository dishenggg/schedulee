import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  // lazy,
  // Suspense,
} from "react";
import { Space, DatePicker, Tabs } from "antd";
import SchedulingApp from "./SchedulingApp";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";
import AddContract from "./addContract";
import { db } from "../../firebase";
import { collection, getDocs, where, query, orderBy } from "firebase/firestore";
// import { ParseDateToFirestore } from '../../utils/ParseTime';
import dayjs from "dayjs";
import AllTrips from "./AllTrips";

//const SchedulingApp = lazy(() => import('./SchedulingApp'));

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editable, setEditable] = useState(true);
  const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});
  const [listOfDrivers, setListOfDrivers] = useState([]);
  const [listOfTrips, setListOfTrips] = useState([]);
  const [listOfSubCons, setListOfSubCons] = useState([]);
  const [driverDetails, setDriverDetails] = useState({});

  const handleDateChange = (date, dateString) => {
    setSelectedDate(date.toDate());

    const currentDate = new Date();

    if (date.toDate().setHours(0, 0, 0, 0) < currentDate.setHours(0, 0, 0, 0)) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  };

  const formattedDate = useMemo(
    () => selectedDate.toLocaleDateString("en-GB"),
    [selectedDate]
  );

  const populateListOfTripsByDriver = (trips) => {
    const res = {
      "Unscheduled Trips": [],
    };

    trips.forEach((trip) => {
      if (trip.numBusAssigned < trip.numBus) {
        res["Unscheduled Trips"].push(trip);
      }

      trip.bus.forEach((driverOrSubConId) => {
        if (!res[driverOrSubConId]) {
          res[driverOrSubConId] = [];
        }
        res[driverOrSubConId].push(trip);
      });
    });
    setListOfTripsByDriver(res);
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

    console.log("yeboi");
    console.log(currentDay);
    console.log(nextDay);
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
      res[row.busNumber] = { ...row };
    });
    setDriverDetails(res);
  };

  const updateListOfTripsByDriver = useCallback(() => {
    populateListOfTrips(selectedDate);
    //populateListOfDrivers();
    //populateListOfSubCons();
  }, [selectedDate]);

  useEffect(() => {
    //populateListOfDrivers();
    //populateListOfSubCons();
    populateListOfTrips(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    populateListOfTripsByDriver(listOfTrips);
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
            defaultValue={dayjs()}
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
              <AllTrips
                drivers={listOfDrivers}
                subCons={listOfSubCons}
                trips={listOfTrips}
                selectedDate={formattedDate}
                listOfTripsByDriver={listOfTripsByDriver}
                updateListOfTripsByDriver={updateListOfTripsByDriver}
                driverDetails={driverDetails}
              />
            ),
          },
          {
            label: "Scheduler",
            key: 1,
            children: (
              <SchedulingApp
                selectedDate={formattedDate}
                editable={editable}
                listOfTripsByDriver={listOfTripsByDriver}
                drivers={listOfDrivers}
                subCons={listOfSubCons}
                updateListOfTripsByDriver={updateListOfTripsByDriver}
                driverDetails={driverDetails}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export default Scheduling;
