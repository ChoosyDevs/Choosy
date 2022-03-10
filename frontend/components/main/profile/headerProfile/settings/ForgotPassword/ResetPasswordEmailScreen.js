import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  TextInput,
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
import {setResetPasswordEmail} from 'actions/welcomeActions.js';
import {setForgotPasswordRoute} from 'actions/userActions.js';

import NetInfo from '@react-native-community/netinfo';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';

const ResetPasswordEmailScreen = (props) => {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.welcome.resetPasswordEmail);

  const setEmail = (email) => {
    dispatch(setResetPasswordEmail(email));
  };

  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(true);

  // Check if email has valid format
  const onChangeEmail = (EnteredValue) => {
    if (!validEmail) {
      setValidEmail(true);
    }
    if (!emailExists) {
      setEmailExists(true);
    }
    setEmail(EnteredValue);
  };

  const cancelPress = () => {
    props.setModalVisible(true);
  };

  // Validate email format
  const ValidateEmail = (inputText) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  };

  // Send 6-digit password to the given email
  const forgotPasswordFetch = () => {
    if (ValidateEmail(email)) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          fetch(global.url_auth + 'users/forgotPassword', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              email: email,
            }),
          })
            .then((response) => {
              setLoading(false);
              if (response.status === 200) {
                if (!emailExists) {
                  setEmailExists(true);
                }
                dispatch(setForgotPasswordRoute('verification'));
              } else if (response.status === 404) {
                setEmailExists(false);
              } else if (response.status === 401) {
                throw new Error('banned');
              } else {
                throw new Error('gen');
              }
            })
            .catch((err) => {
              if (err == 'Error: banned') {
                Alert.alert(
                  Platform.OS === 'ios'
                    ? 'Your account is no longer active due to inappropriate posts.'
                    : '',
                  Platform.OS === 'ios'
                    ? ''
                    : 'Your account is no longer active due to inappropriate posts.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        dispatch(setInitialStateGeneral());
                        dispatch(setInitialStateHome());
                        dispatch(setInitialStateUser());
                        dispatch(setInitialStateWelcome());
                        dispatch(discardUpload());
                        dispatch(setInitialStateProfile());
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            });
        } else {
          Alert.alert(
            Platform.OS === 'ios'
              ? 'Oops! Check your internet connection.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'Oops! Check your internet connection.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      });
    } else {
      setValidEmail(false);
    }
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
          Enter the email address linked to your account.
        </Text>
      </View>
      <TextInput
        onChangeText={(EnteredValue) => onChangeEmail(EnteredValue)}
        numberOfLines={1}
        autoCapitalize="none"
        autoFocus={true}
        keyboardType="email-address"
        autoCorrect={false}
        multiline={false}
        placeholder={'Email address'}
        selectionColor="black"
        style={[
          styles.textInput,
          {borderColor: !validEmail || !emailExists ? '#D51010' : '#DCDCDC'},
        ]}
      />
      {!validEmail ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Please enter a valid email address.
          </Text>
        </View>
      ) : !emailExists ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            This email is not linked to a user account.
          </Text>
        </View>
      ) : null}

      <Button
        text={loading ? 'Indicator' : 'Next'}
        style={styles.button}
        transparent={email.length < 1}
        onPress={forgotPasswordFetch}
      />
      <TouchableOpacity
        style={styles.cancelStyle}
        onPress={cancelPress}
        activeOpacity={0.5}>
        <Text style={styles.textCancelStyle}>Cancel</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: config.WHITE,
  },
  textInput: {
    width: wp(88),
    height: wp(12),
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: wp(2),
    marginTop: wp(4),
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(6.15),
    fontWeight: '400',
    color: '#01161E',
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
  cancelStyle: {
    alignItems: 'center',
    marginTop: hp(4.7),
  },
  textCancelStyle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#01161E',
  },
});

export default ResetPasswordEmailScreen;
