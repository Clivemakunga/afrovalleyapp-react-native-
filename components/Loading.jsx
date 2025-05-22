import { View, Image } from "react-native";
import React from "react";
import LottieView from 'lottie-react-native';

const Loading =({size})=>{
    return(
        <View style={{}}>
            <Image style={{flex: 1, height: size, aspectRatio: 1}} source={require('../../assets/loading.gif')} />
        </View>
    )
}

export default Loading