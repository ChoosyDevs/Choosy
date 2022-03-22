import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
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
import Button from './Button.js';
import {setSixDigitPassword} from 'actions/welcomeActions.js';
import NetInfo from '@react-native-community/netinfo';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {setForgotPasswordRoute} from 'actions/userActions.js';

const ResetPassword6digitCode = ({setModalVisible}) => {
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

  // Function called when 6-digit password is entered
  const onChangeSixDigitPassword = (EnteredValue) => {
    if (wrongPassword) {
      setWrongPassword(false);
    }
    if (passwordExpired) {
      setPasswordExpired(false);
    }
    dispatch(setSixDigitPassword(EnteredValue));
  };

  const cancelPress = () => {
    setModalVisible(true);
  };

  // Needed for 6 digit onput manipulation
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

  // Function to resend new 6-digit code
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
                  ? 'A new 6-digit verification code was just sent to your email address.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'A new 6-digit verification code was just sent to your email address.',
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

  // Check if password was correct
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
              dispatch(setForgotPasswordRoute('newPassword'));
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
          Platform.OS === 'ios' ? 'Oops! Check your internet connection.' : '',
          Platform.OS === 'ios' ? '' : 'Oops! Check your internet connection.',
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
});

export default ResetPassword6digitCode;
