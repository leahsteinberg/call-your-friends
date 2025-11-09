import { dateObjToMinutesString } from "../Meetings/meetingsUtils";

const dayNumberToDayName = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};



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
  for (let i = 0; i < 36; i++) {
    const newDate = new Date(mostPastHour);
    console.log(mostPastHour.getHours(), "newDate.getHours()", newDate.getHours(), i)
    
    newDate.setHours(newDate.getHours() + i);
    console.log("new datttt", newDate.getHours())
    const newDateString = dateObjToMinutesString(newDate);
    //console.log("new date string", newDateString)
    hoursObj[newDateString] = 0;
  }
  return hoursObj;

}


export const processStepsData = (data) => {  
  const mostRecentTime = data[0].endDate;
  const mostPastTime = data[data.length - 1].startDate;
  const mostPastHour = getStartOfHour(mostPastTime);
  const mostRecentHour = getStartOfHour(mostRecentTime);
  const hoursDuration = hoursBetween(mostPastHour, mostRecentHour);
  const hoursObj = new Object();
  
  for (let stepCount of data) {
    const dayOfWeek: number = stepCount.startDate.getDay();
    const utcHours: number = stepCount.startDate.getUTCHours()
    const weekdayHour: string = [dayOfWeek, utcHours].toString();

    if (hoursObj[weekdayHour] === undefined) {
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
  
    const dayHour = maxDayHour[0]
    const [dayNumber, hour] = dayHour.split(',')

  const upcomingWalkTime = upcomingDateHourWalk({dayNumber, hour})
  console.log("Upcoming- ", dateObjToMinutesString(upcomingWalkTime))
  return upcomingWalkTime;
}

const upcomingDateHourWalk = ({dayNumber, hour}) => {
  const aimDay = dayNumberToDayName[dayNumber]
  const today = new Date()
  const currentDay = today.getDay();
  const additionalDays = ((7 + dayNumber - currentDay) % 7) || 7;
  const futureDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + additionalDays);
  futureDay.setUTCHours(23);
  return futureDay
}
