import { dateObjToMinutesString } from "../Meetings/meetingsUtils";



function getStartOfHour(date) {
  const newDate = new Date(date); // Create a copy to avoid modifying the original date
  newDate.setHours(newDate.getHours(), 0, 0, 0); // Set minutes, seconds, and milliseconds to 0
  return newDate;
}

function hoursBetween(date1, date2): number {
  const time1inMs = date1.getTime();
  const time2inMs = date2.getTime();
  const differenceinMs = time1inMs - time2inMs;
  const hours = differenceinMs/3600000;
  const absoluteHours = Math.abs(hours);
  return absoluteHours;
}


const makeEmptyHoursBucket = ({hoursDuration, mostPastHour}: {hoursDuration: number, mostPastHour: Date}): Object => {
  const hoursObj = new Object();
  for (let i = 0; i < hoursDuration + 1; i++) {
    const newDate= new Date(mostPastHour);
    newDate.setHours(newDate.getHours() + i);
    const newDateString = dateObjToMinutesString(newDate);
    hoursObj[newDateString] = 0;
  }
  return hoursObj;

}


export const processStepsData = (data) => {  

  const mostRecentTime = data[0].endDate;
  const mostPastTime = data[data.length - 1].startDate;
  console.log(dateObjToMinutesString(mostPastTime))


  const mostPastHour = getStartOfHour(mostPastTime);
  const mostRecentHour = getStartOfHour(mostRecentTime);

  const hoursDuration = hoursBetween(mostPastHour, mostRecentHour);
  const hoursObj = new Object();
  
  for (let stepCount of data) {
    const dayOfWeek: number = stepCount.startDate.getDay();
    const utcHours: number = stepCount.startDate.getUTCHours()
    const weekdayHour: string = [dayOfWeek, utcHours].toString();

    if (hoursObj[weekdayHour]=== undefined) {
      hoursObj[weekdayHour] = 0
    } else {
      hoursObj[weekdayHour] = hoursObj[weekdayHour] + stepCount.quantity
    }
  }

  const maxDayHour = Object.keys(hoursObj)
    .reduce((acc, key) => {
      if (hoursObj[key] > acc[1]) {
        return [key, hoursObj[key]]
      }
      return acc
    }, ['', 0]);
  
    console.log("max Day  Hour", maxDayHour);

  return maxDayHour;
}





