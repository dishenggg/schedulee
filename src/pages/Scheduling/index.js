import React, { useState, useEffect, useMemo } from 'react';
import { Space, DatePicker, Tabs } from 'antd';
import SchedulingApp from './SchedulingApp';
import AddMultipleTrips from './Forms/addMultipleTrips';
import { Title } from '../../components/Typography/Title';
import AddTrip from './addTrip.js';
import AddContract from './addContract';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ParseDateToFirestore } from '../../utils/ParseTime';
import dayjs from 'dayjs';
import AllTrips from './AllTrips';

const Scheduling = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editable, setEditable] = useState(true);
    const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});
    const [listOfDrivers, setListOfDrivers] = useState([]);
    const [listOfTrips, setListOfTrips] = useState([]);
    const [listOfSubCons, setListOfSubCons] = useState([]);

    const handleDateChange = (date, dateString) => {
        setSelectedDate(date.toDate());

        const currentDate = new Date();

        if (
            date.toDate().setHours(0, 0, 0, 0) <
            currentDate.setHours(0, 0, 0, 0)
        ) {
            setEditable(false);
        } else {
            setEditable(true);
        }
    };

    const formattedDate = useMemo(
        () => selectedDate.toLocaleDateString('en-GB'),
        [selectedDate]
    );

    const dateWithoutDashes = useMemo(
        () => formattedDate.replace(/\//g, ''),
        [formattedDate]
    );

    const populateListOfTripsByDriver = async () => {
        const res = {
            'Unscheduled Trips': [],
        };

        listOfTrips.forEach((trip) => {
            if (trip.numBusAssigned < trip.numBus) {
                res['Unscheduled Trips'].push(trip);
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
        const driverQuery = await getDocs(collection(db, 'Bus Drivers'));

        const drivers = driverQuery.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setListOfDrivers(drivers);
    };

    const populateListOfSubCons = async () => {
        const subconQuery = await getDocs(collection(db, 'Sub Cons'));

        const subCons = subconQuery.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setListOfSubCons(subCons);
    };

    const populateListOfTrips = async () => {
        const tripsQuery = await getDocs(
            query(
                collection(
                    db,
                    'Dates',
                    ParseDateToFirestore(selectedDate),
                    'trips'
                ),
                orderBy('startTime')
            )
        );
        const trips = tripsQuery.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setListOfTrips(trips);
    };

    const updateListOfTripsByDriver = () => {
        populateListOfTrips();
        //populateListOfDrivers();
        //populateListOfSubCons();
    };

    useEffect(() => {
        populateListOfDrivers();
        populateListOfSubCons();
        populateListOfTrips();
    }, [selectedDate]);

    useEffect(() => {
        populateListOfTripsByDriver();
    }, [selectedDate, listOfTrips]);

    return (
        <>
            <Title level={2}>Scheduling Page</Title>
            <div>
                <Space align="center">
                    <Title level={3} style={{ marginTop: '12px' }}>
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
            <Space style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <AddTrip
                    updateListOfTripsByDriver={updateListOfTripsByDriver}
                />
                <AddMultipleTrips
                    drivers={listOfDrivers}
                    subCons={listOfSubCons}
                    updateListOfTripsByDriver={updateListOfTripsByDriver}
                />
                <AddContract
                    updateListOfTripsByDriver={updateListOfTripsByDriver}
                />
            </Space>
            <Tabs
                type="card"
                destroyInactiveTabPane={true}
                items={[
                    {
                        label: 'All Trips',
                        key: 0,
                        children: (
                            <AllTrips
                                drivers={listOfDrivers}
                                subCons={listOfSubCons}
                                trips={listOfTrips}
                                selectedDate={formattedDate}
                                dateWithoutDashes={dateWithoutDashes}
                                listOfTripsByDriver={listOfTripsByDriver}
                                updateListOfTripsByDriver={
                                    updateListOfTripsByDriver
                                }
                            />
                        ),
                    },
                    {
                        label: 'Scheduler',
                        key: 1,
                        children: (
                            <SchedulingApp
                                selectedDate={dateWithoutDashes}
                                editable={editable}
                                listOfTripsByDriver={listOfTripsByDriver}
                                drivers={listOfDrivers}
                                subCons={listOfSubCons}
                                updateListOfTripsByDriver={
                                    updateListOfTripsByDriver
                                }
                            />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default Scheduling;
