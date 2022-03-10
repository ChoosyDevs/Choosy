import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ChooseButton from './ChooseButton.js';
import SkipButton from './SkipButton.js';
import {useSelector, useDispatch} from 'react-redux';
import Modal from 'react-native-modal';
import Text from 'config/Text.js';
import {setResetSkipsNumber} from 'actions/homeActions.js';
import LottieView from 'lottie-react-native';
import crying from 'assets/crying.json';

const HomeFooter = React.memo((props) => {
  const dispatch = useDispatch();

  const isReady = useSelector((state) => state.home.isReady);
  const skipsCounter = useSelector((state) => state.home.skipsCounter);

  const closeModal = () => {
    dispatch(setResetSkipsNumber());
  };

  return (
    <View style={styles.container}>
      {isReady ? (
        <View style={styles.flex1}>
          <ChooseButton
            photoIndex={props.photoIndex}
            seenAllPhotos={props.seenAllPhotos}
            onVote={props.onVote}
            style={styles.chooseButton}
          />
          <SkipButton onSkip={props.onSkip} style={styles.skipButton} />
          <Modal
            isVisible={skipsCounter === 6}
            style={styles.modalStyle}
            backdropOpacity={0.5}
            onBackButtonPress={closeModal}
            onModalHide={closeModal}
            animationIn={'zoomIn'}
            animationOut={'zoomOut'}
            animationInTiming={200}
            animationOutTiming={200}
            useNativeDriverForBackdrop={true}>
            <View style={styles.containerModal}>
              <View style={styles.viewStyle}>
                <LottieView
                  style={styles.lottieViewStyle}
                  source={crying}
                  autoPlay
                  loop
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.textStyle}>
                  Other users need your opinion about their photos.
                </Text>
              </View>
              <View style={styles.viewTouchable}>
                <TouchableOpacity
                  style={styles.touchable}
                  onPress={closeModal}
                  activeOpacity={0.5}>
                  <Text style={styles.okStyle}>Choose</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <View style={styles.flex1}>
          <ChooseButton style={styles.chooseButton} />
          <SkipButton style={styles.skipButton} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1.2,
    marginHorizontal: wp(6),
  },
  flex1: {
    flex: 1,
  },
  chooseButton: {
    width: wp(53),
    height: '56%',
    position: 'absolute',
    bottom: '33%',
  },
  skipButton: {
    width: wp(32),
    height: '56%',
    position: 'absolute',
    bottom: '33%',
    right: 0,
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  containerModal: {
    width: wp(69.2),
    height: hp(24),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    marginHorizontal: wp(4.5),
    textAlign: 'center',
    fontSize: wp(4),
  },
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.5,
    width: '100%',
    // backgroundColor:'red',
  },
  viewTouchable: {
    borderTopColor: '#DCDCDC',
    borderTopWidth: wp(0.15),
    flex: 1.2,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okStyle: {
    fontSize: wp(4.3),
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieViewStyle: {
    height: '95%',
    top: '3%',
  },
});

export default HomeFooter;
