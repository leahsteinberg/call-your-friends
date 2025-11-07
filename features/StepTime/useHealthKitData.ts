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
  const mostPastTime = data[data.length - 1 ].startDate;

  console.log("most past time -- ",dateObjToMinutesString(data[data.length-1].startDate));


  const mostPastHour = getStartOfHour(mostPastTime);
  console.log("most past hour", dateObjToMinutesString(mostPastHour));

  const mostRecentHour = getStartOfHour(mostRecentTime);
  console.log("latest hour -", dateObjToMinutesString(mostRecentHour));
  const hoursDuration = hoursBetween(mostPastHour, mostRecentHour);
  const hoursObj = new Object();
  
  const mostPastHourString = dateObjToMinutesString(mostPastHour);
  console.log("mostPastHourString", mostPastHourString, "should be - ", dateObjToMinutesString(data[data.length-1].startDate))


    for (let i = 0; i < hoursDuration + 1; i++) {

      const newDate= new Date(mostPastHour);
      //const newDate = new Date(mostPastHourString); 
      if (i === 0 ) {console.log("previous new date=====", dateObjToMinutesString(newDate));  }
      newDate.setHours(newDate.getHours() + i);
      const newDateString = dateObjToMinutesString(newDate);
      //console.log("new Date string", newDateString);

      hoursObj[newDateString] = 0;

    }
    //console.log(hoursObj);


  for (let stepCount of data) {
    //console.log(dateObjToMinutesString(getStartOfHour(stepCount.startDate)));
    const startHourString = dateObjToMinutesString(getStartOfHour(stepCount.startDate));
    //console.log(dateObjToMinutesString(stepCount.startDate),"----", startHourString)
    //console.log(stepCount.quantity)
   console.log("lookup", hoursObj[startHourString]);
    hoursObj[startHourString] = hoursObj[startHourString] + stepCount.quantity
    // 

  }
  console.log(hoursObj)

  



  return data;
}


