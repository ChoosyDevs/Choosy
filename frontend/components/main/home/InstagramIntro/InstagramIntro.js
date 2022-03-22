import React, {useRef, useEffect, useState} from 'react';
import {View, StyleSheet, Animated, BackHandler} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import tipWhite from 'assets/tipWhite.png';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {setInstagramIntroSeen, setInstagramIntro} from 'actions/userActions.js';
import {useSelector, useDispatch} from 'react-redux';

function InstagramIntro(props) {
  const dispatch = useDispatch();
  const {instagramLogoPosition} = props;

  var mountAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        closeAnimation();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  // Mounting Animation
  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      useNativeDriver: true,
      duration: 200,
    }).start(() => dispatch(setInstagramIntro(true)));
  }, []);

  // Unounting Animation
  const closeAnimation = () => {
    Animated.timing(mountAnim, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
    }).start(() => {
      dispatch(setInstagramIntro(false));
      dispatch(setInstagramIntroSeen(true));
    });
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.container, {opacity: mountInterpolate}]}>
      <FastImage
        source={tipWhite}
        key={tipWhite}
        style={{
          width: wp(5),
          height: wp(5),
          position: 'absolute',
          top: -wp(3.5),
          left:
            -wp(2) +
            (instagramLogoPosition.x ? instagramLogoPosition.x : 0) +
            wp(3) / 2,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
      <Text style={styles.introText}>
        Tap here and visit this user's Instagram profile.
      </Text>
    </Animated.View>
  );
}

export default InstagramIntro;

const styles = StyleSheet.create({
  container: {
    width: wp(84),
    height: wp(15),
    position: 'absolute',
    bottom: -wp(17),
    left: wp(2),
    elevation: 6,
    borderRadius: wp(1.8),
    backgroundColor: '#29ccbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    color: config.WHITE,
    textAlign: 'center',
    fontSize: wp(3.8),
    paddingHorizontal: '3%',
  },
});
