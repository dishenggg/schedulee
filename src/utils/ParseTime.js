import dayjs from 'dayjs';

export function ParseDateToFirestore(datetime){
    const formattedDate = dayjs(datetime).format('DD/MM/YYYY');
    const result = formattedDate.replace(/\//g, '');
  return result;
}

export function ParseTimeToFirestore(datetime){
  const formattedDate = dayjs(datetime).format('DD/MM/YYYY');
  const result = formattedDate.replace(/\//g, '');
return result;
}

export function ParseTimeFromFirestore(formattedString){
    const day = formattedString.substr(0, 2);
    const month = formattedString.substr(2, 2);
    const year = formattedString.substr(4, 4);
    return new Date(`${month}/${day}/${year}`);
}
