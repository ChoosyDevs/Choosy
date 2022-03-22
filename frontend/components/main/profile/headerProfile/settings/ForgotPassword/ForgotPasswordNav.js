import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Animated,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {
  setForgotYourPassword,
  setForgotPasswordRoute,
} from '../../../../../../redux/actions/userActions';
import ResetPasswordEmailScreen from './ResetPasswordEmailScreen.js';
import ResetPassword6digitCode from './ResetPassword6digitCode.js';
import ResetPasswordNewPassword from './ResetPasswordNewPassword.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import Modal from 'react-native-modal';

const ForgotPasswordNav = ({navigation}) => {
  const dispatch = useDispatch();
  const forgotPasswordRoute = useSelector(
    (state) => state.user.forgotPasswordRoute,
  );
  const [modalVisible, setModalVisible] = useState(false);
  var mountAnim = useRef(new Animated.Value(0)).current;

  // Android back button handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setModalVisible(true);
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
      useNativeDriver: false,
      duration: 200,
    }).start();
  }, []);

  // Unounting Animation
  const closeAnimation = () => {
    Animated.timing(mountAnim, {
      toValue: 0,
      useNativeDriver: false,
      duration: 200,
    }).start(() => closeDispatch());
  };

  const closeDispatch = () => {
    dispatch(setForgotPasswordRoute('email'));
    dispatch(setInitialStateWelcome());
    dispatch(setForgotYourPassword(false));
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 0],
  });

  const backToPassword = () => {
    setModalVisible(false);
    setTimeout(closeAnimation, 200);
  };

  const stayHere = () => {
    setModalVisible(false);
  };

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateX: mountInterpolate}]}]}>
      {forgotPasswordRoute === 'email' ? (
        <ResetPasswordEmailScreen
          setModalVisible={setModalVisible}
          closeAnimation={closeAnimation}
        />
      ) : forgotPasswordRoute === 'verification' ? (
        <ResetPassword6digitCode
          setModalVisible={setModalVisible}
          closeAnimation={closeAnimation}
        />
      ) : (
        <ResetPasswordNewPassword
          setModalVisible={setModalVisible}
          closeAnimation={closeAnimation}
        />
      )}
      <Modal
        isVisible={modalVisible}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={() => setModalVisible(false)}
        onBackdropPress={() => setModalVisible(false)}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        backdropTransitionOutTiming={0}>
        <View style={styles.containerModal}>
          <View style={styles.modal2SubView}>
            <View style={styles.modal2View1}>
              <Text style={styles.modal2DeletePost}>
                Are you sure you want to cancel?
              </Text>
            </View>
            <View style={styles.modal2Line} />
            <View style={styles.viewKap}>
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={backToPassword}
                activeOpacity={0.5}>
                <Text style={styles.modal2Delete}>Yes</Text>
              </TouchableOpacity>
              <View style={styles.modal2Line} />
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={stayHere}
                activeOpacity={0.5}>
                <Text style={styles.modal2Delete}>No, continue</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.additionalView} />
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    backgroundColor: 'red',
  },
  containerModal: {
    width: wp(69.2),
    height: hp(23.7),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2Touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2Delete: {
    fontSize: wp(4.35),
    color: '#007AFF',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2SubView: {
    flex: 1,
  },
  modal2View1: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2DeletePost: {
    color: config.BLACK,
    fontSize: wp(4.35),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    textAlign: 'center',
    marginHorizontal: wp(5.92),
  },
  viewKap: {
    flex: 2,
  },
  additionalView: {
    flex: 0.04,
  },
});

export default ForgotPasswordNav;
