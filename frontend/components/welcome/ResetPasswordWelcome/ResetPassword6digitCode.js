import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  BackHandler,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import Button from '../Button.js';
import {
  setSixDigitPassword,
  setInitialStateWelcome,
} from 'actions/welcomeActions.js';
import NetInfo from '@react-native-community/netinfo';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import Modal from 'react-native-modal';
import {useFocusEffect} from '@react-navigation/native';

const ResetPassword6digitCode = ({navigation}) => {
  const dispatch = useDispatch();
  const sixDigitPassword = useSelector(
    (state) => state.welcome.sixDigitPassword,
  );
  const resetPasswordEmail = useSelector(
    (state) => state.welcome.resetPasswordEmail,
  );
  const [wrongPassword, setWrongPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Chooses correct behaviour when new digit is pressed
  const onChangeSixDigitPassword = (EnteredValue) => {
    if (wrongPassword) {
      setWrongPassword(false);
    }
    if (passwordExpired) {
      setPasswordExpired(false);
    }
    dispatch(setSixDigitPassword(EnteredValue));
  };

  // Handles press of the cancel button
  const cancelPress = () => {
    setModalVisible(true);
  };

  // Navigates back to Login page
  const backToLogin = () => {
    setModalVisible(false);
    navigation.navigate('Login');
    dispatch(setInitialStateWelcome());
  };

  const stayHere = () => {
    setModalVisible(false);
  };

  // Handles 6-digit input display
  const ref = useBlurOnFulfill({value: sixDigitPassword, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: sixDigitPassword,
    setValue: onChangeSixDigitPassword,
  });

  const Link = (props) => (
    <Text
      onPress={props.onPress}
      style={[styles.titleSmall, {color: '#0091FF'}]}>
      {props.children}
    </Text>
  );

  // Sends new 6-digit password to email
  const resendCodeFetch = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        fetch(global.url_auth + 'users/forgotPassword', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: resetPasswordEmail,
          }),
        })
          .then((response) => {
            setLoading(false);
            if (response.status === 200) {
              Alert.alert(
                Platform.OS === 'ios'
                  ? 'The new 6-digit verification code was just sent to your email.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'The new 6-digit verification code was just sent to your email.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            } else {
              throw new Error('gen');
            }
          })
          .catch((err) => {
            if (err == 'Error: gen') {
              Alert.alert(
                Platform.OS === 'ios'
                  ? 'Something went wrong, please try again.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'Something went wrong, please try again.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }
          });
      } else {
        Alert.alert(
          Platform.OS === 'ios' ? 'Oops! Check your internet connection.' : '',
          Platform.OS === 'ios' ? '' : 'Oops! Check your internet connection.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }
    });
  };

  // Checks if 6-digit password is correct
  const checkVerification = () => {
    setLoading(true);
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        fetch(global.url_auth + 'users/resetPassword', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: resetPasswordEmail,
            resetPassword: sixDigitPassword,
          }),
        })
          .then((response) => {
            if (response.status === 200) {
              //the pass was ok
              setLoading(false);
              navigation.navigate('ResetPasswordNewPassword');
            } else if (response.status === 410) {
              //expired
              setLoading(false);
              setPasswordExpired(true);
            } else if (response.status === 420) {
              //does not match
              setLoading(false);
              setWrongPassword(true);
            } else {
              throw new Error('gen');
            }
          })
          .catch((err) => {
            if (err == 'Error: gen') {
              setLoading(false);
              Alert.alert(
                Platform.OS === 'ios'
                  ? 'Something went wrong, please try again.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'Something went wrong, please try again.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }
          });
      } else {
        setLoading(false);
        Alert.alert(
          Platform.OS === 'ios'
            ? 'Please check your internet connection and try again.'
            : '',
          Platform.OS === 'ios'
            ? ''
            : 'Please check your internet connection and try again.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={Keyboard.dismiss}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reset Password</Text>
      </View>
      <View style={styles.titleSmallContainter}>
        <Text style={styles.titleSmall}>
          Enter the 6-digit code that we sent to{' '}
        </Text>
        <Text style={styles.titleSmall}>
          {resetPasswordEmail}.{' '}
          <Link onPress={resendCodeFetch}>Resend code.</Link>
        </Text>
      </View>
      <CodeField
        ref={ref}
        {...props}
        value={sixDigitPassword.toString()}
        onChangeText={onChangeSixDigitPassword}
        cellCount={6}
        rootStyle={[styles.codeFieldRoot]}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[
              styles.cell,
              {
                borderColor:
                  wrongPassword || passwordExpired ? '#D51010' : '#DCDCDC',
              },
            ]}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />

      {wrongPassword ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Incorrect 6-digit verification code.
          </Text>
        </View>
      ) : passwordExpired ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>6-digit code expired.</Text>
        </View>
      ) : null}
      <View style={styles.minutesLeftContainer}>
        <Text style={styles.titleSmall}>5 minutes left</Text>
      </View>
      <Button
        text={loading ? 'Indicator' : 'Next'}
        style={styles.button}
        transparent={sixDigitPassword.length < 6}
        onPress={checkVerification}
      />
      <Text style={styles.textCancelStyle} onPress={cancelPress}>
        Cancel
      </Text>
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
                onPress={backToLogin}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: config.WHITE,
  },
  button: {
    marginTop: wp(8),
    alignSelf: 'center',
  },
  titleContainer: {
    marginTop: wp(13),
    marginLeft: wp(6),
  },
  title: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(7),
    color: config.PRIMARY_TEXT,
  },
  titleSmallContainter: {
    marginTop: wp(14.3),
    marginLeft: wp(6),
  },
  minutesLeftContainer: {
    marginTop: wp(6.1),
    marginLeft: wp(6),
  },
  errorMessageContainer: {
    marginTop: wp(2),
    marginLeft: wp(6),
  },
  titleSmall: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(3.5),
    color: '#696D7D',
  },
  errorMessage: {
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: wp(3.5),
    color: '#D51010',
  },
  textCancelStyle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#01161E',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: wp(10.2),
  },
  codeFieldRoot: {
    marginTop: wp(4.1),
    marginHorizontal: wp(6.1),
  },
  cell: {
    width: wp(12),
    height: wp(12),
    lineHeight: wp(11.5),
    fontSize: wp(4.5),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'SF-Pro',
    borderWidth: 1,
    borderRadius: wp(2),
    borderColor: '#DCDCDC',
    textAlignVertical: 'center',
    textAlign: 'center',
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

export default ResetPassword6digitCode;
