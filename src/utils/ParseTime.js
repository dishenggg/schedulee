import dayjs from "dayjs";

export function ParseDateToFirestore(datetime) {
  const formattedDate = dayjs(datetime).format("DD/MM/YYYY");
  const result = formattedDate.replace(/\//g, "");
  return result;
}

export function ParseDateFromFirestore(formattedString) {
  const day = formattedString.substr(0, 2);
  const month = formattedString.substr(2, 3);
  const year = formattedString.substr(4, 8);
  return new Date(`${month}/${day}/${year}`);
}

export function ParseTimeToFirestore(time, date) {
  const formattedDate = dayjs(date)
    .hour(dayjs(time).get("hour"))
    .minute(dayjs(time).get("minute"))
    .second(0);
  return formattedDate.toDate();
}

export function ParseTimeFromFirestoreToString(datetime) {
  const dateTime = dayjs.unix(datetime.seconds);
  const timeString = dateTime.format("HH:mm");
  return timeString;
}
