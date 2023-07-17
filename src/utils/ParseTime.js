import dayjs from "dayjs";

export function ParseDateToFirestore(datetime) {
  const formattedDate = dayjs(datetime).format("DD/MM/YYYY");
  const result = formattedDate.replace(/\//g, "");
  return result;
}

export function ParseDateFromFirestore(formattedString) {
  const day = formattedString.substring(0, 2);
  const month = formattedString.substring(2, 4);
  const year = formattedString.substring(4, 8);
  return new Date(`${month}/${day}/${year}`);
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

export function parseDateTimeFromStringToFireStore(timeString, dateString) {
  const date = dayjs(ParseDateFromFirestore(dateString))
    .hour(parseInt(timeString.substring(0, 2)))
    .minute(parseInt(timeString.substring(3, 5)));
  return date;
}
