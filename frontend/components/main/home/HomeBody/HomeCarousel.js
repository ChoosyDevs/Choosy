import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import FastImage from 'react-native-fast-image';
import SocialMediaIcon from 'config/SocialMediaIcon.js';
import {setVoting, setSeenAll} from 'actions/homeActions.js';
import LottieView from 'lottie-react-native';
import arrowDown from 'assets/arrowDown.json';
import skeletonLoading from 'assets/skeletonLoading.json';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

// Custom Animated photo swiper
const HomeCarousel = React.memo((props) => {
  const uploadsArray = useSelector((state) => state.home.uploadsArray);
  const currentIndex = useSelector((state) => state.home.currentIndex);

  let lastTap = useRef(Date.now()).current;
  const dispatch = useDispatch();
  const seenAll = useSelector((state) => state.home.seenAll);

  let currentIndexFake = useRef(0);

  let scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  useEffect(() => {
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  }, [uploadsArray, currentIndex]);

  var offsets = [];
  let images = [];
  let offsetSum = 0;

  // Function that iterates the photos array passed by props and returns the exact sizes
  // of every photo to fit the screen. It also fills up the offsets array to be passed in the
  // snapToOffsets prop of scrollview
  uploadsArray[currentIndex].photos.forEach((photo, index) => {
    var ratio = photo.height / photo.width;
    photo.width = wp(87);
    photo.height = ratio * wp(87);

    images.push(photo);

    if (index !== 0) {
      offsetSum += (images[index - 1].width + photo.width) / 2 + wp(2);
      offsets.push(offsetSum);
    }
  });

  let position = Animated.divide(scrollX, offsets[0]);

  // Function that detects double taps and send votes if detected
  const handleDoubleTap = () => {
    let now = Date.now();
    let DOUBLE_PRESS_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      if (
        props.photoIndex.current ===
          uploadsArray[currentIndex].photos.length - 1 ||
        props.seenAllPhotos.current === true
      ) {
        dispatch(setVoting(true));
        props.onVote(true, currentIndex, props.photoIndex.current);
      } else {
        dispatch(setSeenAll(true));
      }
    } else {
      lastTap = now;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        {seenAll ? (
          <View pointerEvents="none" style={styles.viewLottie}>
            <LottieView
              source={arrowDown}
              autoPlay
              loop
              speed={2.3}
              resizeMode={'cover'}
            />
          </View>
        ) : null}

        <ScrollView
          alwaysBounceHorizontal={false}
          bounces={false}
          ref={scrollViewRef}
          horizontal
          decelerationRate={'fast'}
          snapToInterval={wp(89.1)}
          snapToAlignment="start"
          disableIntervalMomentum={true}
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {
              useNativeDriver: false,
              listener: (event) => {
                if (seenAll) dispatch(setSeenAll(false));
                currentIndexFake.current = currentIndex;
                props.firstTouch.current = true;
              },
            },
          )}
          onMomentumScrollEnd={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {
              useNativeDriver: false,
              listener: (event) => {
                if (currentIndexFake.current !== currentIndex) {
                  props.seenAllPhotos.current = false;
                  props.counterKap.current = 0;
                  currentIndexFake.current = currentIndex;
                }
              },
            },
          )}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {
              useNativeDriver: false,
              listener: (event) => {
                props.photoIndex.current = Math.round(
                  event.nativeEvent.contentOffset.x / offsets[0],
                );
                if (
                  Math.round(event.nativeEvent.contentOffset.x / offsets[0]) ===
                    uploadsArray[currentIndex].photos.length - 1 &&
                  props.counterKap.current === 0 &&
                  props.firstTouch.current === true
                ) {
                  props.firstTouch.current = false;
                  props.seenAllPhotos.current = true;
                  props.counterKap.current = 1;
                }
              },
            },
          )}
          scrollEventThrottle={16}
          style={styles.scrollview}>
          <View
            onStartShouldSetResponder={() => true}
            style={[styles.firstPadding, {width: wp(5.5)}]}
          />
          {images.map((photo, index) => {
            let scale = position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.96, 1, 0.96],
              extrapolate: 'clamp',
            });

            return (
              <TouchableWithoutFeedback onPress={handleDoubleTap} key={index}>
                <View style={styles.viewContainer}>
                  <View style={[styles.paddingHeight, {width: wp(1)}]} />
                  <AnimatedFastImage
                    key={photo.uri}
                    style={[
                      styles.fastImage,
                      {
                        height:
                          photo.width >= photo.height ? photo.height : '98%',
                        transform: [{scale}],
                      },
                    ]}
                    source={{
                      uri: photo.uri,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode="cover">
                    <LottieView
                      source={skeletonLoading}
                      autoPlay
                      loop
                      style={[StyleSheet.absoluteFill, {zIndex: -1}]}
                      resizeMode="cover"
                    />
                    <View style={styles.targetSocialMediaContainer}>
                      {uploadsArray[currentIndex].targetSocialMedia.map(
                        (media, index) => {
                          return (
                            <View key={index}>
                              {media === 'empty' ? null : (
                                <View
                                  style={[
                                    styles.targetSocialMedia,
                                    {marginBottom: index === 0 ? 0 : wp(2)},
                                  ]}>
                                  <SocialMediaIcon
                                    socialMedia={media}
                                    style={styles.socialMediaIcon}
                                  />
                                </View>
                              )}
                            </View>
                          );
                        },
                      )}
                    </View>
                  </AnimatedFastImage>

                  <View style={[styles.paddingHeight, {width: wp(1)}]} />
                </View>
              </TouchableWithoutFeedback>
            );
          })}
          <View style={[styles.firstPadding, {width: wp(5.5)}]} />
        </ScrollView>
      </View>
      <View style={styles.dotsContainer}>
        {images.map((photo, i) => {
          let opacity = position.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return <Animated.View key={i} style={[styles.dot, {opacity}]} />;
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 9.3,
    top: 5,
    alignItems: 'center',
  },
  carouselContainer: {
    height: '95%',
    width: wp(100),
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollview: {
    flex: 1,
  },
  paddingHeight: {
    height: '100%',
  },
  fastImage: {
    width: wp(87),
    height: '100%',
    alignSelf: 'center',
    backgroundColor: '#DCDCDC',
    borderRadius: wp(6.1),
  },
  dotsContainer: {
    width: wp(100),
    height: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: 100,
    backgroundColor: config.BLACK,
    marginHorizontal: 2,
  },
  targetSocialMediaContainer: {
    position: 'absolute',
    flexDirection: 'column-reverse',
    right: wp(6),
    bottom: wp(2),
  },
  targetSocialMedia: {
    width: wp(6.1),
    height: wp(6.1),
    backgroundColor: '#00000080',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialMediaIcon: {
    width: '50%',
    height: '50%',
  },
  viewContainer: {
    height: '100%',
    width: wp(89),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewLottie: {
    width: wp(8),
    height: wp(18),
    position: 'absolute',
    right: wp(12),
    zIndex: 1,
    transform: [{rotate: '90deg'}],
  },
});

export default HomeCarousel;
