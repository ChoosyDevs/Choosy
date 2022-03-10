import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Platform, PanResponder} from 'react-native';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {BlurView} from '@react-native-community/blur';
import PercentagePhoto from './PercentagePhoto.js';
import LinearGradient from 'react-native-linear-gradient';
import tick from 'assets/tick.png';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {setVoting} from 'actions/homeActions.js';
import FakeHomeBody from './FakeHomeBody.js';
import {setLoadingVisible} from 'actions/homeActions.js';
import LottieView from 'lottie-react-native';
import arrowDown from 'assets/arrowDown.json';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// setTimeout wrapper with pause and resume function
var Timer = (callback, delay) => {
  var timerId,
    start,
    remaining = delay;

  var pause = () => {
    window.clearTimeout(timerId);
    remaining -= remainProgress;
  };

  var resume = (rem) => {
    start = new Date();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, rem);
  };

  resume(remainProgress);
  return {pause: pause, resume: resume};
};

var voteTimer = {};
var remainProgress = 2000;

const LoadingNext = React.memo(
  (props) => {
    const dispatch = useDispatch();
    const popoverVisible = useSelector((state) => state.home.popoverVisible);
    const upload = props.upload;
    const photos = props.upload.photos;
    const photosCount = photos.length;
    var animHeight = useRef(new Animated.Value(0));
    var progressBar = useRef(new Animated.Value(0)).current;

    // Mounting Animation
    useEffect(() => {
      Animated.timing(animHeight.current, {
        toValue: 1,
        useNativeDriver: true,
        duration: 150,
      }).start(onVote);
    }, []);

    // Closing Animation
    const closeAnimation = () => {
      Animated.timing(
        animHeight.current,
        {toValue: 0, useNativeDriver: true, duration: 200}, // Configuration
      ).start(() => {
        remainProgress = 2000;
        dispatch(setLoadingVisible(false));
        dispatch(setVoting(false));
      });
    };

    //Close immediatelly when popover wants to open
    useEffect(() => {
      if (popoverVisible) {
        pauseProgressBar();
        voteTimer.pause();
        closeAnimation();
      }
    }, [popoverVisible]);

    let progressInterpolate = progressBar.interpolate({
      inputRange: [0, 1],
      outputRange: [-wp(100), 0],
    });

    const startProgressBar = () => {
      Animated.timing(progressBar, {
        toValue: 1,
        duration: remainProgress,
        useNativeDriver: false,
      }).start(() => (remainProgress = 2000));
    };

    const pauseProgressBar = () => {
      progressBar.stopAnimation((value) => {
        remainProgress = 2000 * (1 - value) < 600 ? 1000 : 2000 * (1 - value);
      });
    };

    const onVote = () => {
      startProgressBar();
      let delay = 2000;
      voteTimer = Timer(() => {
        closeAnimation();
      }, delay);
    };

    const fakeHomeScreenInterpolate = animHeight.current.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0, 0, 1],
    });

    const panResponder = React.useRef(
      PanResponder.create({
        // Ask to be the responder:
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => {
          pauseProgressBar();
          voteTimer.pause();
          // The gesture has started. Show visual feedback so the user knows
          // what is happening!
          // gestureState.d{x,y} will be set to zero now
        },
        onPanResponderTerminationRequest: (evt, gestureState) => true,
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dy > 100) {
            closeAnimation();
          } else {
            swipeDownAnim.setValue(0);
            startProgressBar();
            voteTimer.resume(remainProgress);
          }
          // The user has released all touches while this view is the
          // responder. This typically means a gesture has succeeded
        },
        onPanResponderMove: (evt, gestureState) => {
          swipeDownAnim.setValue(gestureState.dy / hp(100));
          // The user has released all touches while this view is the
          // responder. This typically means a gesture has succeeded
        },
        onShouldBlockNativeResponder: (evt, gestureState) => {
          // Returns whether this component should block native components from becoming the JS
          // responder. Returns true by default. Is currently only supported on android.
          return true;
        },
      }),
    ).current;

    var swipeDownAnim = useRef(new Animated.Value(0)).current;

    let swipeDownAnimInterpolate = swipeDownAnim.interpolate({
      inputRange: [0, 0.48, 1],
      outputRange: [0, 0.9, 0.9],
    });

    return (
      <View style={[StyleSheet.absoluteFill, styles.fill]}>
        <Animated.View
          style={[styles.container, {opacity: fakeHomeScreenInterpolate}]}>
          <FakeHomeBody upload={upload} photoIndex={props.photoIndex} />
        </Animated.View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: animHeight.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [hp(92), 0],
                  }),
                },
              ],
            },
          ]}>
          <BlurView style={styles.absolute} blurType="dark" blurAmount={32} />
          <View style={styles.arrowDownContainer}>
            <LottieView
              source={arrowDown}
              progress={swipeDownAnimInterpolate}
            />
          </View>

          <AnimatedLinearGradient
            useAngle={true}
            colors={[config.PRIMARY_COLOUR, config.PRIMARY_GRADIENT_COLOUR]}
            style={[
              styles.progressBar,
              {
                transform: [
                  {
                    translateX: progressInterpolate,
                  },
                ],
              },
            ]}
          />
          <View
            style={[
              styles.photosContainer,
              {
                flexDirection: photosCount < 4 ? 'column' : 'row',
                flexWrap: 'wrap',
              },
            ]}>
            {photos.map((photo, index) => {
              return (
                <View key={index}>
                  {index === props.photoIndex ? (
                    <View>
                      <PercentagePhoto
                        uploadPercentagesIndex={props.uploadPercentages[index]}
                        width={
                          photosCount * wp(41) + 2 * photosCount * wp(2) >
                          hp(92)
                            ? wp(31)
                            : wp(41)
                        }
                        height={
                          photosCount * wp(41) + 2 * photosCount * wp(2) >
                          hp(92)
                            ? wp(31)
                            : wp(41)
                        }
                        photo={photo}
                        style={{alignSelf: 'center'}}
                      />
                      <View style={styles.viewTick}>
                        <FastImage
                          source={tick}
                          style={styles.imageTick}
                          resizeMode={'contain'}
                        />
                      </View>
                    </View>
                  ) : (
                    <PercentagePhoto
                      uploadPercentagesIndex={props.uploadPercentages[index]}
                      width={
                        photosCount * wp(41) + 2 * photosCount * wp(2) > hp(92)
                          ? wp(31)
                          : wp(41)
                      }
                      height={
                        photosCount * wp(41) + 2 * photosCount * wp(2) > hp(92)
                          ? wp(31)
                          : wp(41)
                      }
                      photo={photo}
                      style={{alignSelf: 'center'}}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>
      </View>
    );
  },
  () => true,
);

const styles = StyleSheet.create({
  fill: {
    elevation: 5,
    top: '0%',
  },
  container: {
    width: wp(100),
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
  },
  absolute: {
    flex: 1,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(140,140,140,0.7)' : 'rgba(140,140,140,0.3)',
  },
  photosContainer: {
    justifyContent: 'center',
    position: 'absolute',
    alignSelf: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 5,
    width: wp(100),
    borderRadius: 10,
  },
  viewTick: {
    width: wp(4.1),
    height: wp(4.1),
    position: 'absolute',
    right: wp(4.1),
    top: wp(4.1),
    backgroundColor: config.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: config.PRIMARY_COLOUR,
  },
  imageTick: {
    width: wp(2.3),
    height: 8,
    zIndex: 1,
  },
  arrowDownContainer: {
    zIndex: 1,
    position: 'absolute',
    top: wp(3),
    backgroundColor: 'transparent',
    width: wp(15),
    height: wp(15),
    alignSelf: 'center',
  },
  arrowDown: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default LoadingNext;
