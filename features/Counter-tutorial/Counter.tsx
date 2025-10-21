import { usePostSignupMutation } from '@/services/authApi';
import { Button, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { decrement, increment } from './counterSlice';

export function Counter()  {
    const count = useSelector((state: RootState)=> state.counter.value);

    const dispatch = useDispatch()
    const [signupUser, {isLoading, isSuccess, isError, error}] = usePostSignupMutation();


    if (isLoading) return <View>Is Loading</View>;
    if (error) return <View>Error found</View>

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