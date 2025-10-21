// Import the library
//import Datetime from 'react-datetime';
import { View } from 'react-native';



export default function WebMeetingTimePicker({selectDateTime}) {

        const renderDay = (props, currentDate, selectedDate) => {
            // Adds 0 to the days in the days view
            return <td>h{currentDate.date()}</td>;
        }
        const renderMonth = (props, month, year, selectedDate) => {
            // Display the month index in the months view
            return <td style={{backgroundColor: 'green'}}>r{month}</td>;
        }
        const renderYear = (props, year, selectedDate) => {
            // Just display the last 2 digits of the year in the years view
            return <td >{year % 100}</td>;
        }

    return (
        <View>
            {/* <Datetime
                timeFormat={true}
                onChange={selectDateTime}
                input={false}
                // renderDay={renderDay}
                renderMonth={renderMonth}
                // renderYear={renderYear}
            /> */}
        </View>
    );
}

