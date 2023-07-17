import React, { useState, useEffect } from 'react';
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

    const handleDateChange = (date, dateString) => {
        setSelectedDate(date.toDate());

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate.setHours(0, 0, 0, 0) < currentDate) {
            setEditable(false);
        } else {
            setEditable(true);
        }
    };

    const formattedDate = selectedDate.toLocaleDateString('en-GB');
    const dateWithoutDashes = formattedDate.replace(/\//g, '');

    const populateListOfTripsByDriver = async () => {
        const res = {};
        res['Unscheduled Trips'] = listOfTrips.filter(
            (trip) => trip.numAssigned < trip.numberBus
        );
        listOfDrivers.forEach((driver) => {
            res[driver.id] = listOfTrips.filter((trip) =>
                trip.bus.includes(driver.id)
            );
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
        populateListOfDrivers();
    };

    useEffect(() => {
        populateListOfDrivers();
        populateListOfTrips();
    }, [selectedDate]);

    useEffect(() => {
        populateListOfTripsByDriver();
    }, [selectedDate, listOfDrivers, listOfTrips]);

    return (
        <>
            <Title>Scheduling Page</Title>
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
                    updateListOfTripsByDriver={updateListOfTripsByDriver}
                />
                <AddContract
                    updateListOfTripsByDriver={updateListOfTripsByDriver}
                />
            </Space>
            <Tabs
                type="card"
                items={[
                    {
                        label: 'Scheduler',
                        key: 0,
                        children: (
                            <SchedulingApp
                                selectedDate={dateWithoutDashes}
                                editable={editable}
                                listOfTripsByDriver={listOfTripsByDriver}
                                drivers={listOfDrivers}
                                updateListOfTripsByDriver={
                                    updateListOfTripsByDriver
                                }
                            />
                        ),
                    },
                    {
                        label: 'All Trips',
                        key: 1,
                        children: (
                            <AllTrips
                                trips={listOfTrips}
                                selectedDate={formattedDate}
                            />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default Scheduling;
