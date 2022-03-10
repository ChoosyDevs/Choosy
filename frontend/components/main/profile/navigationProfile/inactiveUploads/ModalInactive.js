import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
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
import ModalMoreInactive from './ModalMoreInactive.js';
import ModalInactiveScrollView from './ModalInactiveScrollView.js';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {
  setModalInactiveUploads,
  setModalMoreInactiveUploads,
} from 'actions/profileActions.js';
import seenBy from 'assets/seenBy.png';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const ModalInactive = React.memo((props) => {
  const dispatch = useDispatch();

  const tappedPhoto = useSelector((state) => state.profile.tappedPhoto);
  const modalInactiveUploads = useSelector(
    (state) => state.profile.modalInactiveUploads,
  );
  const wonPhotosArray = useSelector((state) => {
    return state.profile.wonPhotosArray;
  });

  const openModalMore = () => {
    dispatch(setModalMoreInactiveUploads(true));
  };

  const closeModalInactive = () => {
    dispatch(setModalInactiveUploads(false));
  };

  let scrollDown = useRef(new Animated.Value(0));

  // Handling of gesture
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
          closeModalInactive();
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
          closeModalInactive();
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
      isVisible={modalInactiveUploads}
      style={styles.modalStyle}
      animationInTiming={200}
      animationOutTiming={200}
      deviceWidth={1}
      onBackButtonPress={closeModalInactive}
      onBackdropPress={closeModalInactive}
      useNativeDriverForBackdrop={true}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
        <View style={styles.genView} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={closeModalInactive}
            style={styles.cancelView}
            activeOpacity={0.5}>
            <AnimatedFastImage
              resizeMode="contain"
              source={closeInactive}
              style={[styles.imageCancelView, {transform: [{scale}]}]}
            />
          </TouchableOpacity>
          <View style={styles.currentNumbersView}>
            <Text style={styles.textCurrentNumber}>
              {tappedPhoto + 1} of {wonPhotosArray.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreView}
            onPress={openModalMore}
            activeOpacity={0.5}>
            <Image source={more} style={styles.imageMoreView} />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' ? (
          <View style={styles.body}>
            <ModalInactiveScrollView
              closeModalInactive={closeModalInactive}
              scrollDown={scrollDown}
              photos={wonPhotosArray}
            />
          </View>
        ) : (
          <View {...panResponder.panHandlers} style={styles.body}>
            <ModalInactiveScrollView
              closeModalInactive={closeModalInactive}
              scrollDown={scrollDown}
              photos={wonPhotosArray}
            />
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.eyeAndText}>
            <FastImage
              source={seenBy}
              style={styles.eyeStyle}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.textFooter1}>
              {' '}
              {wonPhotosArray[tappedPhoto].uploadVotes}{' '}
            </Text>
          </View>
        </View>

        <View style={styles.footerView} />
      </View>
      <ModalMoreInactive uploadId={wonPhotosArray[tappedPhoto].uploadId} />
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
  eyeStyle: {
    width: wp(4.5),
    height: wp(4.5),
  },
  footer: {
    flex: 0.75,
    alignItems: 'flex-start',
    marginTop: hp(2.8),
    marginLeft: wp(6.15),
    flexDirection: 'row',
  },
  textFooter1: {
    color: config.BLACK,
    fontWeight: 'bold',
    fontSize: wp(4.1),
  },
  eyeAndText: {
    flexDirection: 'row',
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

export default ModalInactive;
