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
  const mostPastTime = data[data.length - 1 ].startDate;

  const mostPastHour = getStartOfHour(mostPastTime);
  const mostRecentHour = getStartOfHour(mostRecentTime);

  const hoursDuration = hoursBetween(mostPastHour, mostRecentHour);
  const hoursObj = makeEmptyHoursBucket({hoursDuration, mostPastHour});
  
  for (let stepCount of data) {
    const startHourString = dateObjToMinutesString(getStartOfHour(stepCount.startDate));
    hoursObj[startHourString] = hoursObj[startHourString] + stepCount.quantity
  }
  console.log("hours bucket object", hoursObj)


  return hoursObj;
}


