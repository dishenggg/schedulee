import dayjs from "dayjs";

//Takes in a dayjs and returns a JS datetime object
export function ParseDateToFirestore(datetime) {
  const result = dayjs(datetime);
  return result.toDate();
}

export function ParseDateFromFirestore(formattedString) {
  const dateTime = dayjs.unix(formattedString);
  return dateTime;
}

export function ParseTimeToFirestore(time, date) {
  const formattedDate = dayjs(date)
    .hour(dayjs(time).get("hour"))
    .minute(dayjs(time).get("minute"))
    .second(0);
  return formattedDate.toDate();
}

export function ParseTimeFromFirestore(datetime) {
  const dateTime = dayjs.unix(datetime.seconds);
  return dateTime;
}

export function ParseTimeFromFirestoreToString(datetime) {
  const dateTime = dayjs.unix(datetime.seconds);
  const timeString = dateTime.format("HH:mm");
  return timeString;
}

export function parseDateTimeStringToDatetime(timeString, dateString) {
  const [d, m, y] = dateString.split("/");
  const date = dayjs(new Date(y, m - 1, d))
    .hour(parseInt(timeString.substring(0, 2)))
    .minute(parseInt(timeString.substring(3, 5)));
  return date;
}

export function getDatesByDay(startDate, endDate, dayOfWeek) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Find the next occurrence of the specified day of the week after the start date
  let firstMatchingDate = start.day(dayOfWeek);
  if (firstMatchingDate.isBefore(start, "day")) {
    firstMatchingDate = firstMatchingDate.add(7, "day");
  }

  // Create an array to store the matching dates
  const matchingDates = [];

  // Loop through each date starting from the first matching date until the end date
  while (firstMatchingDate.isSameOrBefore(end, "day")) {
    matchingDates.push(firstMatchingDate.format("DD/MM/YYYY"));

    // Move to the next occurrence of the specified day of the week
    firstMatchingDate = firstMatchingDate.add(7, "day");
  }

  return matchingDates;
}
