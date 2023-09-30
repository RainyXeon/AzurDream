function convertTime(numberSecondValue: number): string {
  // Convert the number of seconds to hours, minutes, and seconds.
  const hours = Math.floor(numberSecondValue / 3600);
  const minutes = Math.floor((numberSecondValue % 3600) / 60);
  const seconds = numberSecondValue % 60;

  // Pad the hours, minutes, and seconds with zeros so that they are all two digits long.
  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toString().padStart(2, "0");

  // Return the string timestamp in the format `0:35`.
  return `${hoursString}:${minutesString}:${secondsString}`;
}

function convertNumber(number: number, decPlaces: number) {
  decPlaces = Math.pow(10, decPlaces);

  var abbrev = ["K", "M", "B", "T"];

  for (var i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      let res = String(number);

      res += abbrev[i];

      break;
    }
  }

  return number;
}

function chunk(arr: Array<any>, size: number) {
  const temp = [];
  for (let i = 0; i < arr.length; i += size) {
    temp.push(arr.slice(i, i + size));
  }
  return temp;
}

function convertHmsToMs(hms: string) {
  if (hms.length < 3) {
    const a = hms.split(":");
    return (hms = String(+a[0] * 1000));
  } else if (hms.length < 6) {
    const a = hms.split(":");
    return (hms = String((+a[0] * 60 + +a[1]) * 1000));
  } else {
    const a = hms.split(":");
    return (hms = String((+a[0] * 60 * 60 + +a[1] * 60 + +a[2]) * 1000));
  }
}

export { convertTime, convertNumber, convertHmsToMs, chunk };
