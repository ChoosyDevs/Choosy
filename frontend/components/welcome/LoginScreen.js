import React, {useState, useEffect} from 'react';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  StyleSheet,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import choosyLogo from 'assets/ChoosyLogo.png';
import FastImage from 'react-native-fast-image';
import Button from './Button.js';
import eyeOff from 'assets/eyeOff.png';
import eyeOn from 'assets/eyeOn.png';
import {
  setEmailSignIn,
  setPasswordSignIn,
  setRouteRegister,
} from 'actions/welcomeActions.js';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import {
  setUsername,
  setThumbnail,
  setLevel,
  setPublications,
  setEmail,
  setAges,
  setInstagramName,
  setInstagramIntroSeen,
  setUserVerified,
} from 'actions/userActions.js';
import {setRoute} from 'actions/generalActions.js';
import * as RootNavigation from './navigationHelper.js';
import SuccessToast from './SuccessToast.js';
import Analytics from 'analytics/Analytics.js';
import perf from '@react-native-firebase/perf';
import PushNotification from 'react-native-push-notification';

const LoginScreen = (props) => {
  const dispatch = useDispatch();
  const signInEmail = useSelector((state) => state.welcome.signInEmail);
  const signInPassword = useSelector((state) => state.welcome.signInPassword);
  const successToast = useSelector((state) => state.welcome.successToast);
  const [eyeOn1, setEyeOn1] = useState(false);
  const [shouldBeTransparent, setShouldBeTransparent] = useState(true);
  const [validEmailAdress, setValidEmailAdress] = useState(true);
  const [userExists, setUserExists] = useState(true);
  const [loading, setLoading] = useState(false);

  // Handle password character input
  const onChangePassword = (EnteredValue) => {
    if (!userExists) {
      setUserExists(true);
    }
    dispatch(setPasswordSignIn(EnteredValue));
  };

  // Handle email character input
  const onChangeEmail = (EnteredValue) => {
    if (!userExists) {
      setUserExists(true);
    }
    if (!validEmailAdress) {
      setValidEmailAdress(true);
    }
    dispatch(setEmailSignIn(EnteredValue));
  };

  useEffect(() => {
    if (signInEmail.length >= 1 && signInPassword.length >= 1) {
      setShouldBeTransparent(false);
    } else {
      setShouldBeTransparent(true);
    }
  }, [signInEmail, signInPassword]);

  const onCurrentPasswordChange = (EnteredValue) => {
    setCurrentPassword(EnteredValue);
  };

  // Attempt login with given credentials
  onSubmitChangeLogIn = async () => {
    if (ValidateEmail(signInEmail)) {
      if (!validEmailAdress) {
        setValidEmailAdress(true);
      }

      const metric = await perf().newHttpMetric(
        'choosy-application.com/' + 'auth/users/login',
        'POST',
      );
      // Start the metric
      await metric.start();
      let fetchResponse = {};

      await NetInfo.fetch().then(async (state) => {
        if (state.isConnected === true) {
          setLoading(true);
          await fetch(global.url_auth + 'users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: signInEmail,
              password: signInPassword,
            }),
          })
            .then((response) => {
              fetchResponse = response;
              if (response.status === 413) {
                throw new Error('banned');
              } else if (response.status === 200) {
                return response.json();
              } else {
                throw new Error('general');
              }
            })
            .then((user) => {
              if (user.token) {
                try {
                  Keychain.setGenericPassword(user.token, user.refreshToken);
                } catch (e) {
                  //null
                }
                //send SingIn Event to Analytics
                Analytics.onSignIn(user.user);
                setLoading(false);
                dispatch(setRoute('main'));
                dispatch(setUsername(user.user.name));
                dispatch(setThumbnail(user.user.Thumbnail));
                dispatch(setLevel(user.user.level));
                dispatch(setPublications(user.user.publications));
                dispatch(setEmail(user.user.email));
                dispatch(setAges(user.user.targetAgeGroups));
                dispatch(setInstagramName(user.user.instagramName));
                dispatch(setInstagramIntroSeen(user.user.instaIntro));
                dispatch(setUserVerified(user.user.verified));
                if (!userExists) {
                  setUserExists(true);
                }
              }
            })
            .catch((err) => {
              if (err == 'Error: banned') {
                //handle ban users
                setLoading(false);
                Alert.alert(
                  Platform.OS === 'ios'
                    ? 'Your account is no longer active due to inappropriate posts.'
                    : '',
                  Platform.OS === 'ios'
                    ? ''
                    : 'Your account is no longer active due to inappropriate posts.',
                  [{text: 'OK'}],
                  {cancelable: false},
                );
              } else if (err == 'Error: general') {
                //there is no user with that credentials
                setLoading(false);
                setUserExists(false);
              } else {
                //unknown error
                setLoading(false);
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
        metric.setHttpResponseCode(fetchResponse.status);
        metric.setResponseContentType(
          fetchResponse.headers.get('Content-Type'),
        );
        metric.setResponsePayloadSize(
          parseFloat(fetchResponse.headers.get('Content-Length')),
        );
        await metric.stop();
      });
    } else {
      setValidEmailAdress(false);
    }
  };

  // Check email format
  ValidateEmail = (inputText) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  };

  // Go to "Reset password" screen
  const resetPasswordScreenFunction = () => {
    dispatch(setRouteRegister('reset'));
    RootNavigation.navigate('ResetPasswordEmailScreen');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={Keyboard.dismiss}
      activeOpacity={1}>
      <View style={styles.logoContainer}>
        <FastImage
          source={choosyLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TextInput
        onChangeText={(EnteredValue) => onChangeEmail(EnteredValue)}
        value={signInEmail}
        numberOfLines={1}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        multiline={false}
        placeholder={'Email'}
        selectionColor="black"
        style={[
          styles.emailTextInput,
          {borderColor: userExists && validEmailAdress ? '#DCDCDC' : '#D51010'},
        ]}
      />
      {validEmailAdress ? null : (
        <Text style={styles.errorMessage}>
          Please enter a valid email address.
        </Text>
      )}
      <View
        style={[
          styles.passwordTextInputContainer,
          ,
          {borderColor: userExists ? '#DCDCDC' : '#D51010'},
        ]}>
        <TextInput
          onChangeText={(EnteredValue) => onChangePassword(EnteredValue)}
          value={signInPassword}
          secureTextEntry={eyeOn1 ? false : true}
          numberOfLines={1}
          autoCorrect={false}
          multiline={false}
          placeholder={'Password'}
          autoCapitalize="none"
          selectionColor="black"
          style={styles.passwordTextInput}
        />
        <TouchableOpacity
          style={styles.eyeStyle}
          onPress={() => setEyeOn1((eyeOn1) => !eyeOn1)}
          activeOpacity={0.5}>
          <FastImage
            source={eyeOn1 ? eyeOn : eyeOff}
            style={styles.eyeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {userExists ? null : (
        <Text style={styles.errorMessage}>
          Can’t find an account with these credentials.
        </Text>
      )}
      <Button
        text={loading ? 'Indicator' : 'Sign in'}
        style={styles.button}
        transparent={shouldBeTransparent}
        onPress={onSubmitChangeLogIn}
      />

      <Text style={styles.linkText} onPress={resetPasswordScreenFunction}>
        Forgot your password?
      </Text>

      {successToast ? (
        <View style={[StyleSheet.absoluteFill, {elevation: 6}]}>
          <SuccessToast />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logoContainer: {
    width: wp(39),
    height: wp(11),
    marginBottom: wp(4),
  },
  logo: {
    flex: 1,
  },
  passwordTextInputContainer: {
    width: wp(88),
    height: wp(12),
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: wp(2),
    marginTop: wp(4),
    justifyContent: 'center',
  },
  passwordTextInput: {
    flex: 1,
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(15),
    fontWeight: '400',
    color: '#01161E',
  },
  emailTextInput: {
    width: wp(88),
    height: wp(12),
    borderColor: '#DCDCDC',
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
  },
  linkText: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(3.5),
    color: '#0091FF',
    top: wp(10),
  },
  eyeStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: 3 * wp(5.1),
    height: 3 * wp(3.8),
    right: 0,
  },
  eyeIcon: {
    width: '33.3%',
    height: '33.3%',
    resizeMode: 'contain',
  },
  errorMessage: {
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: wp(3.5),
    color: '#D51010',
    alignSelf: 'flex-start',
    marginLeft: wp(6),
    marginTop: wp(2),
  },
});

export default LoginScreen;
