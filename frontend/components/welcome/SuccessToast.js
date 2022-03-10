import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {BlurView} from '@react-native-community/blur';
import tick from 'assets/tick.png';
import FastImage from 'react-native-fast-image';
import {setSuccessToast} from 'actions/welcomeActions.js';
import {useDispatch} from 'react-redux';

function UploadCompletedToast(props) {
  const dispatch = useDispatch();

  var mountAnim = useRef(new Animated.Value(0)).current;

  // Mounting Animation
  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      useNativeDriver: true,
      duration: 130,
    }).start();
  }, []);

  // Unounting Animation
  const closeAnimation = () => {
    Animated.timing(mountAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 130,
    }).start(() => dispatch(setSuccessToast(false)));
  };

  let scaleInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  let opacityInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableWithoutFeedback onPress={() => closeAnimation()}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.rectangle,
            {
              transform: [
                {
                  scale: scaleInterpolate,
                },
              ],
              opacity: opacityInterpolate,
            },
          ]}>
          <BlurView
            style={[
              styles.absolute,
              {
                backgroundColor:
                  Platform.OS === 'ios'
                    ? 'rgba(140,140,140,0.7)'
                    : 'rgba(140,140,140,0.3)',
              },
            ]}
            blurType="dark"
            blurAmount={32}
          />
          <FastImage
            source={tick}
            style={styles.tickImage}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.text}>Password was changed successfully</Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // backgroundColor:'green',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rectangle: {
    width: wp(69),
    height: '21%',
    borderRadius: wp(4.6),
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(140,140,140,0.7)' : 'rgba(140,140,140,0.3)',
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickImage: {
    width: wp(8.4),
    height: wp(8.4),
    resizeMode: 'contain',
    // position:'absolute',
    // top:'23%'
  },
  text: {
    fontWeight: '400',
    fontSize: wp(4.1),
    color: config.WHITE,
    // position:'absolute',
    // bottom:'20%',
    textAlign: 'center',
    marginTop: '3%',
    marginHorizontal: wp(4),
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderRadius: wp(4.6),
  },
});

export default UploadCompletedToast;
