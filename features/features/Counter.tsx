import { usePostSignupMutation } from '@/services/authApi';
import { Button, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { decrement, increment } from './counterSlice';

export function Counter()  {
    const count = useSelector((state: RootState)=> state.counter.value);

    const dispatch = useDispatch()
    const [signupUser, {isLoading, isSuccess, isError, error}] = usePostSignupMutation();
    //const response = signIn();
    console.log("in counterr ---", signupUser);
        //console.log("in counter ---", {data, error, isLoading});

    if (isLoading) return <View>Is Loading</View>;
    if (error) return <View>Error found</View>

   // console.log(data);
    return (
        <View>
         <View/>
            <Text>
                {count}
            </Text>
            <Button
                title="increment"
                onPress={() => dispatch(increment())}
            />
            <Button
                title="decrement"
                onPress={() => dispatch(decrement())}
            />
            <Button
                title="get number from API"
                onPress={()=> {signupUser(0)}}
            />
        </View>);

}