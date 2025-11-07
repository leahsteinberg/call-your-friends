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

export const processStepsData = async (data) => {

  // want an object of hours over the x days
  // for each step unit, 
      // based on its start time, we add it to the bucket.  

  const mostRecentTime = data[0].endDate;
  const oldestTime = data[data.length - 1].startDate;
  const oldestHour = getStartOfHour(oldestTime);
  const latestHour = getStartOfHour(mostRecentTime);
  const hoursDuration = hoursBetween(oldestHour, latestHour)
  const hoursObj = new Object();
  

  const oldestHourString = dateObjToMinutesString(oldestHour);

    for (let i = 0; i < hoursDuration; i++) {
      // take the oldest hour string and turn it into a NEW "Date Object"
      const newDate = new Date(oldestHourString);
      if (i < 3){ console.log("New date -- not yet changed", dateObjToMinutesString(newDate)); }
      
      // add i (number of hours) to that new date object
      newDate.setHours(newDate.getHours() + i);
      
      // turn that new Date object into a string
      const newDateString = dateObjToMinutesString(newDate);

      if (i < 3){ console.log("new date, has been changed i is:", i, " ---", newDateString); }

      // add a new entry into the big object we are building up, with 0 steps.
      hoursObj[newDateString] = 0;

    }
    console.log(hoursObj);


  // for (let stepCount of data) {
  //   console.log(dateObjToMinutesString(stepCount.startDate));
  //   console.log(stepCount.quantity)
  //   // 

  //}

  



  return data;
}


