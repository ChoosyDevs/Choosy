import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import config from 'config/BasicConfig.json';
import choosyLogo from 'assets/ChoosyLogo.png';
import plus from 'assets/plus.png';
import HomeHeaderButton from './HomeHeaderButton.js';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {setSuccessVisible} from 'actions/homeActions.js';
import {setUploadBarOpen} from 'actions/generalActions.js';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const HomeHeader = React.memo((props) => {
  const dispatch = useDispatch();
  const uploadLoading = useSelector((state) => state.general.uploadLoading);
  const uploadSuccesful = useSelector((state) => state.general.uploadSuccesful);
  const thumbnail = useSelector((state) => state.user.thumbnail);

  var progressBar = useRef(new Animated.Value(0)).current;

  let didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      uploadLoadingAnimation(uploadLoading);
    } else {
      didMountRef.current = true;
    }
  }, [uploadLoading]);

  // Progress bar animation, indicating poll uploading progress
  const uploadLoadingAnimation = (loading) => {
    Animated.timing(progressBar, {
      toValue: loading ? 70 : 100,
      useNativeDriver: false,
      duration: loading ? 3000 : 800,
    }).start(() => {
      if (!loading) {
        progressBar.setValue(0);
        if (uploadSuccesful) {
          dispatch(setUploadBarOpen(false));
          dispatch(setSuccessVisible(true));
        }
      }
    });
  };

  const progressBarInterpolator = progressBar.interpolate({
    inputRange: [0, 100],
    outputRange: [-wp(100), 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <FastImage
          source={choosyLogo}
          style={styles.choosyLogo}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <HomeHeaderButton image={plus} imageRadius={0} style={styles.plusImage} />
      <HomeHeaderButton
        image={thumbnail}
        imageRadius={100}
        style={styles.profileImage}
      />
      <AnimatedLinearGradient
        useAngle={true}
        colors={[config.PRIMARY_COLOUR, config.PRIMARY_GRADIENT_COLOUR]}
        style={[
          styles.uploadBar,
          {transform: [{translateX: progressBarInterpolator}]},
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    marginHorizontal: wp(6),
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    bottom: '10%',
    height: '47%',
  },
  choosyLogo: {
    height: '100%',
    width: '100%',
    aspectRatio: 115 / 32,
    resizeMode: 'contain',
    //aspect ratio set for particular ChoosyLogo.png
  },
  plusImage: {
    position: 'absolute',
    right: wp(9.2),
    bottom: -wp(1),
    height: wp(12),
    width: wp(12),
    padding: wp(2.8),
  },
  profileImage: {
    position: 'absolute',
    right: -wp(2.5),
    bottom: -wp(1),
    height: wp(12),
    width: wp(12),
    padding: wp(2.5),
    borderRadius: 100,
    // backgroundColor:'red'
  },
  uploadBar: {
    width: wp(100),
    height: wp(1),
    position: 'absolute',
    left: -wp(6),
    bottom: -wp(1),
    borderRadius: 10,
    backgroundColor: config.PRIMARY_COLOUR,
  },
});

export default HomeHeader;
