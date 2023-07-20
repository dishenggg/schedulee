import { Select, message } from 'antd';
import { useEffect, useState } from 'react';
import {
    ParseDateToFirestore,
    ParseTimeFromFirestoreToString,
} from '../../utils/ParseTime';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    parseDateTimeFromStringToFireStore,
    ParseTimeFromFirestore,
} from '../../utils/ParseTime';
const BusCellRenderer = ({
    params,
    listOfDriverIds,
    drivers,
    subCons,
    listOfTripsByDriver,
    dateWithoutDashes,
}) => {
    const [driverDetails, setDriverDetails] = useState({});
    const unscheduledTrips = 'Unscheduled Trips';
    const [status, setStatus] = useState(
        params.data.bus.length > params.data.numBus ? 'warning' : ''
    );
    const [options, setOptions] = useState([]);

    useEffect(() => {
        setOptions(getOptions(params));
    }, [listOfTripsByDriver]);

    useEffect(() => {
        populateDriverDetails();
    }, [drivers, subCons]);

    const populateDriverDetails = async () => {
        const res = {};
        drivers.forEach((row) => {
            res[row.busNumber] = { ...row };
        });
        subCons.forEach((row) => {
            res[row.busNumber] = { ...row };
        });
        setDriverDetails(res);
    };

    const checkTimeClash = (data, driverId) => {
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
        console.log(listOfTripsByDriver[driverId]);
        for (const trip of listOfTripsByDriver[driverId] || []) {
            const tripStartTime = ParseTimeFromFirestore(trip.startTime);
            const tripEndTime = ParseTimeFromFirestore(trip.endTime);
            const diffNewStartOldEnd = newTripStartTime.diff(
                tripEndTime,
                'minute'
            );
            const diffNewEndOldStart = newTripEndTime.diff(
                tripStartTime,
                'minute'
            );
            if (
                (diffNewStartOldEnd >= -15 && diffNewStartOldEnd <= 15) ||
                (diffNewEndOldStart >= -15 && diffNewEndOldStart <= 15)
            ) {
                //console.log('CLASH', newTripStartTime, driverId);
                return true; // Hide grid if there is a timing clash
            }
            return false;
        }
    };

    const getOptions = (params) => {
        const options = Object.keys(listOfTripsByDriver).filter((driverId) => {
            if (driverId === unscheduledTrips) {
                return false;
            }

            const driverObj = driverDetails[driverId];
            const driverData = { ...driverObj };
            const busSize = driverData.busSize;
            const rowData = params.data;
            const paxSize = rowData.numPax;

            if (busSize < paxSize) {
                return false; // Hide grid if bus size is smaller than required
            }
            return !checkTimeClash(rowData, driverId); // Display grid if there are no clashes or bus size issues
        });
        console.log(options);
        return options.map((driverId) => ({
            label: driverId,
            value: driverId,
        }));
    };

    const handleChange = async (params, value, option, setStatus) => {
        console.log(value, option);
        try {
            const id = params.data.id;
            const date = ParseDateToFirestore(params.data.date);
            const tripRef = doc(db, 'Dates', date, 'trips', id);
            await updateDoc(tripRef, { bus: value });
            message.success('Successfully Updated Buses');
        } catch (error) {
            message.error(error.toString());
        } finally {
            getOptions(params);
            if (value.length > params.data.numBus) {
                setStatus('warning');
            } else {
                setStatus('');
            }
        }
    };
    return (
        <Select
            mode="multiple"
            style={{ width: '100%', height: '100%' }}
            placeholder="No Bus Assigned"
            defaultValue={params.data.bus}
            onChange={(value, option) =>
                handleChange(params, value, option, setStatus)
            }
            options={options}
            status={status}
            // dropdownStyle={} fix coloring?
        ></Select>
    );
};

export default BusCellRenderer;
