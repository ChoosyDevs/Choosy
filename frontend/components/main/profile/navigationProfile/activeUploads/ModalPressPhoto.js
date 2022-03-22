import React, {useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import closeInactive from 'assets/closeInactive.png';
import more from 'assets/more.png';
import TickLogo from 'assets/TickLogo.png';
import ModalPressPhotoMore from './ModalPressPhotoMore.js';
import ScrollViewInModalPressPhoto from './ScrollViewInModalPressPhoto.js';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {
  setActivePressedPhoto,
  setActivePressedPhotoModalMore,
  setActiveMoreIndex,
  setIndexOfPressActiveUploads,
} from 'actions/profileActions.js';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const ModalPressPhoto = React.memo((props) => {
  const dispatch = useDispatch();

  var indexOfPressActiveUploads = useSelector((state) => {
    return state.profile.indexOfPressActiveUploads;
  });
  var activeUploadsArray = useSelector((state) => {
    return state.profile.activeUploadsArray;
  });
  var activeMoreIndex = useSelector((state) => {
    return state.profile.activeMoreIndex;
  });
  var activePressedPhoto = useSelector((state) => {
    return state.profile.activePressedPhoto;
  });
  let scrollDown = useRef(new Animated.Value(0));

  const openModalMore = () => {
    dispatch(setActivePressedPhotoModalMore(true));
  };

  // Close the modal
  const closeModalActive = useCallback(() => {
    dispatch(setActivePressedPhoto(false));
    setTimeout(() => {
      dispatch(setIndexOfPressActiveUploads(1));
      dispatch(setActiveMoreIndex(0));
    }, 200);
  }, []);

  // Detects and handles gestures
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        // pauseProgressBar();
        // voteTimer.pause();
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy >= 3) {
          scrollDown.current.setValue(0);
          closeModalActive();
        } else {
          scrollDown.current.setValue(0);
        }
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderMove: (evt, gestureState) => {
        scrollDown.current.setValue(gestureState.dy);
        //swipeDownAnim.setValue( (gestureState.dy / hp(100)))
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this
        if (gestureState.dy > 180 || gestureState.vy >= 2) {
          scrollDown.current.setValue(0);
          closeModalActive();
        } else {
          scrollDown.current.setValue(0);
        }
        // gesture
        // should be cancelled
      },

      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    }),
  ).current;

  const scale = scrollDown.current.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 1.5],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      isVisible={activePressedPhoto}
      style={styles.modalStyle}
      animationInTiming={200}
      animationOutTiming={200}
      deviceWidth={1}
      onBackButtonPress={closeModalActive}
      onBackdropPress={closeModalActive}
      useNativeDriverForBackdrop={true}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
      <View style={styles.container}>
        <View style={styles.genView} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={closeModalActive}
            style={styles.cancelView}>
            <AnimatedFastImage
              resizeMode="contain"
              source={closeInactive}
              style={[styles.imageCancelView, {transform: [{scale}]}]}
            />
          </TouchableOpacity>
          <View style={styles.currentNumbersView}>
            <Text style={styles.textCurrentNumber}>
              {indexOfPressActiveUploads} of{' '}
              {activeUploadsArray[activeMoreIndex].photos.length}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreView} onPress={openModalMore}>
            <FastImage
              source={more}
              style={styles.imageMoreView}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' ? (
          <View style={styles.body}>
            <ScrollViewInModalPressPhoto
              closeModalActive={closeModalActive}
              scrollDown={scrollDown}
              photos={activeUploadsArray[activeMoreIndex].photos}
            />
          </View>
        ) : (
          <View {...panResponder.panHandlers} style={styles.body}>
            <ScrollViewInModalPressPhoto
              closeModalActive={closeModalActive}
              scrollDown={scrollDown}
              photos={activeUploadsArray[activeMoreIndex].photos}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.textFooter}>
            {
              activeUploadsArray[activeMoreIndex].photos[
                indexOfPressActiveUploads - 1
              ].votes
            }
          </Text>
          <FastImage
            resizeMode={FastImage.resizeMode.contain}
            source={TickLogo}
            style={[styles.tickLogo]}
          />
        </View>

        <View style={styles.footerView} />
      </View>
      <ModalPressPhotoMore />
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalStyle: {
    flex: 1,
    backgroundColor: config.WHITE,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 0.87,
    marginHorizontal: wp(6.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 10,
  },
  footer: {
    flex: 0.75,
    alignItems: 'flex-start',
    marginTop: hp(2.8),
    marginLeft: wp(6.15),
    flexDirection: 'row',
  },
  textFooter: {
    color: config.BLACK,
    fontWeight: '600',
    fontSize: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelView: {
    position: 'absolute',
    width: 3 * wp(5.6),
    height: 3 * wp(5.6),
    justifyContent: 'center',
    alignItems: 'center',
    left: -wp(5.6),
  },
  currentNumbersView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCancelView: {
    width: '25%',
    height: '25%',
    resizeMode: 'contain',
  },
  tickLogo: {
    width: wp(4.5),
    height: wp(4.5),
    marginLeft: wp(1.5),
  },
  moreView: {
    width: 4 * wp(4.1),
    height: 16 * hp(0.47),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -1.5 * wp(4.1),
  },
  imageMoreView: {
    width: '30%',
    height: '13%',
    resizeMode: 'contain',
  },
  textCurrentNumber: {
    color: config.BLACK,
    fontWeight: '400',
    fontSize: wp(4),
  },
  genView: {
    flex: 0.7,
  },
  footerView: {
    flex: 0.5,
  },
});

export default ModalPressPhoto;
