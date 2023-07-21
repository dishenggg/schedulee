import { Select, message } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import {
    ParseDateToFirestore,
    ParseTimeFromFirestoreToString,
} from '../../utils/ParseTime';
import {
    doc,
    updateDoc,
    runTransaction,
    arrayRemove,
} from 'firebase/firestore';
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
    updateListOfTripsByDriver,
}) => {
    const [driverDetails, setDriverDetails] = useState({});
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const unscheduledTrips = 'Unscheduled Trips';
    const [status, setStatus] = useState(
        params.data.bus.length > params.data.numBus ? 'warning' : ''
    );
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        getOptions(params);
    }, [listOfTripsByDriver, driverDetails]);

    useEffect(() => {
        populateDriverDetails();
    }, [drivers, subCons]);

    const populateDriverDetails = () => {
        const res = {};
        drivers.forEach((row) => {
            res[row.busNumber] = { ...row };
        });
        subCons.forEach((row) => {
            res[row.busNumber] = { ...row };
        });
        setDriverDetails(res);
    };

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
                const tripStartTime = ParseTimeFromFirestore(
                    trip.startTime
                ).add(-15, 'minute');
                const tripEndTime = ParseTimeFromFirestore(trip.endTime).add(
                    15,
                    'minute'
                );
                const diffNewStartOldEnd = newTripStartTime.diff(
                    tripEndTime,
                    'minute'
                );
                const diffNewEndOldStart = newTripEndTime.diff(
                    tripStartTime,
                    'minute'
                );
                if (diffNewEndOldStart >= 0 && diffNewStartOldEnd <= 0) {
                    return true;
                }
            }
            return false;
        },
        [dateWithoutDashes, listOfTripsByDriver]
    );

    const getOptions = useCallback(
        (params) => {
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
            setOptions(res);
            // setOptions(
            //     options.map((driverId) => ({
            //         label: driverId,
            //         value: driverId,
            //     }))
            // );
        },
        [listOfDriverIds, driverDetails, checkTimeClash]
    );

    const handleChange = async (value) => {
        setChanged(true);
        setSelected(value);
    };

    const onBlur = async (params, e) => {
        if (!changed) return;
        const data = params.node.data;
        try {
            const id = data.id;
            const tripRef = doc(db, 'Dates', dateWithoutDashes, 'trips', id);
            await updateDoc(tripRef, {
                bus: selected,
                numBusAssigned: selected.length,
            });
            message.success('Successfully Updated Buses');
        } catch (error) {
            message.error(error.toString());
        } finally {
            setSelected([]);
            setChanged(false);
            updateListOfTripsByDriver();
        }
    };

    const onDeselect = async (params, value) => {
        if (dropDownOpen) return;
        const data = params.node.data;
        try {
            const id = data.id;
            const tripRef = doc(db, 'Dates', dateWithoutDashes, 'trips', id);
            await runTransaction(db, async (transaction) => {
                const docSnapshot = await transaction.get(tripRef);
                transaction.update(docSnapshot.ref, {
                    bus: arrayRemove(value),
                    numBusAssigned: docSnapshot.data().numBusAssigned - 1,
                });
            });
            message.success('Successfully Updated Buses');
        } catch (error) {
            message.error(error.toString());
        } finally {
            updateListOfTripsByDriver();
        }
    };

    const onDropdownVisibleChange = useCallback((open) => {
        setDropDownOpen(open);
    }, []);

    return (
        <Select
            mode="multiple"
            style={{ width: '100%', height: '100%' }}
            placeholder="No Bus Assigned"
            defaultValue={params.data.bus}
            onChange={(value) => handleChange(value)}
            onBlur={(e) => onBlur(params, e)}
            onDeselect={(value) => onDeselect(params, value)}
            options={options}
            status={status}
            onDropdownVisibleChange={onDropdownVisibleChange}
        ></Select>
    );
};

export default BusCellRenderer;
