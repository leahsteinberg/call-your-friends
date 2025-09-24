import { useGetSimplePostsQuery } from '@/services/simpleApi';
import { Button, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { decrement, increment } from './counterSlice';

export function Counter()  {
    const count = useSelector((state: RootState)=> state.counter.value);

    const dispatch = useDispatch()
    const {data, error, isLoading} = useGetSimplePostsQuery(1);
    
    console.log({data, error, isLoading});


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
                onPress={()=> {}}
            />
        </View>);

}