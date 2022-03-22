import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import profileBack from 'assets/profileBack.png';
import FastImage from 'react-native-fast-image';
import * as Keychain from 'react-native-keychain';
import {useDispatch, useSelector} from 'react-redux';
import {setForgotYourPassword} from 'actions/userActions.js';
import {setSettingsState} from 'actions/generalActions.js';
import NetInfo from '@react-native-community/netinfo';
import eyeOff from 'assets/eyeOff.png';
import eyeOn from 'assets/eyeOn.png';
import {useFocusEffect} from '@react-navigation/native';
import ForgotPasswordNav from './ForgotPassword/ForgotPasswordNav.js';
import SuccessToast from '../../../../welcome/SuccessToast.js';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';

function PasswordScreen(props) {
  const dispatch = useDispatch();
  var forgotYourPassword = useSelector(
    (state) => state.user.forgotYourPassword,
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [eyeOn1, setEyeOn1] = useState(false);
  const [eyeOn2, setEyeOn2] = useState(false);
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(true);
  const [confirmPasswordVerified, setConfirmPasswordVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const successToast = useSelector((state) => state.user.successToast);

  var mountAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        closeAnimation();
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
    }).start(() => changeSettingsState());
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 0],
  });

  const changeSettingsState = () => {
    dispatch(setSettingsState('settings'));
  };

  const onCurrentPasswordChange = (EnteredValue) => {
    if (!currentPasswordVerified) setCurrentPasswordVerified(true);
    setCurrentPassword(EnteredValue);
  };

  const onNewPasswordChange = (EnteredValue) => {
    if (!confirmPasswordVerified) setConfirmPasswordVerified(true);
    if (!currentPasswordVerified) setCurrentPasswordVerified(true);
    setNewPassword(EnteredValue);
  };

  const onConfirmPasswordChange = (EnteredValue) => {
    if (!confirmPasswordVerified) setConfirmPasswordVerified(true);
    if (!currentPasswordVerified) setCurrentPasswordVerified(true);
    setConfirmPassword(EnteredValue);
  };

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthPassword = (func) => {
    Keychain.getGenericPassword()
      .then((creds) => creds.password)
      .then((refreshToken) => {
        fetch(global.url_auth + 'token', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + refreshToken,
          },
        })
          .then((res) => {
            if (res.status === 412) {
              throw new Error('banned');
            } else if (res.status === 201) {
              return res.json();
            } else {
              throw new Error('gen');
            }
          })
          .then(async (response) => {
            try {
              await Keychain.setGenericPassword(
                response.token,
                response.refreshToken,
              );
            } catch (e) {
              //null
            }
          })
          .then((data) => {
            switch (func) {
              case 'checkOldPassword':
                checkOldPassword();
                break;
              case 'finalChangePassword':
                finalChangePassword();
              default:
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
      });
  };

  // Check if the old password provided was correct
  const checkOldPassword = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        setLoading(true);
        Keychain.getGenericPassword()
          .then((creds) => creds.username)
          .then((token) => {
            fetch(global.url + 'users/password', {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify({
                password: currentPassword,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  //call the function to change user's password
                  if (!currentPasswordVerified) {
                    setCurrentPasswordVerified(true);
                  }
                  finalChangePassword();
                } else if (response.status === 411) {
                  throw new Error('token');
                } else {
                  throw new Error('gen');
                }
              })
              .catch((e) => {
                if (e != 'Error: token') {
                  //that means user did not type the right password
                  setCurrentPasswordVerified(false);
                  setLoading(false);
                } else {
                  refreshAuthPassword('checkOldPassword');
                }
              });
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

  // Check if new passwords match
  const compareNewPasswords = () => {
    if (newPassword === confirmPassword) {
      return true;
    } else {
      return false;
    }
  };

  //last fetch checks function -> compareNewPasswords and currentPasswordVerified variable if is true
  const finalChangePassword = () => {
    if (compareNewPasswords()) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          Keychain.getGenericPassword()
            .then((creds) => creds.username)
            .then((token) => {
              fetch(global.url + 'users/changePassword', {
                method: 'PATCH',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({
                  password: newPassword,
                }),
              })
                .then((response) => {
                  if (response.status === 200) {
                    setLoading(false);
                    closeAnimation();
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Password was changed successfully.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Password was changed successfully.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                  } else if (response.status === 411) {
                    throw new Error('token');
                  } else {
                    throw new Error('gen');
                  }
                })
                .catch((e) => {
                  if (e != 'Error: token') {
                    //something went wrong
                    setLoading(false);
                  } else {
                    refreshAuthPassword('finalChangePassword');
                  }
                });
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
      setLoading(false);
      setConfirmPasswordVerified(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View
        style={[
          styles.container,
          {transform: [{translateX: mountInterpolate}]},
        ]}
        activeOpacity={1}>
        <View style={styles.headerStyle}>
          <TouchableOpacity
            style={styles.backIconView}
            onPress={closeAnimation}
            activeOpacity={0.5}>
            <FastImage
              source={profileBack}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.viewUsernameText}>
            <Text style={styles.usernameText}>Password</Text>
          </View>
          <View style={styles.rightActionsStyle}>
            {loading ? (
              <View style={styles.rightActionsStyle}>
                <ActivityIndicator color={'black'} size="small" />
              </View>
            ) : currentPassword.length >= 8 &&
              newPassword.length >= 8 &&
              confirmPassword.length >= 8 ? (
              <TouchableOpacity
                style={styles.rightActionsStyle}
                onPress={checkOldPassword}
                activeOpacity={0.5}>
                <Text style={styles.textRightActions}>Save</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.rightActionsStyle}>
                <Text style={styles.textRightActionsBlur}>Save</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.bodyStyle}>
          <View
            style={[
              styles.textInputContainer,
              {
                marginTop: hp(7),
                borderColor: currentPasswordVerified ? '#DCDCDC' : '#D51010',
              },
            ]}>
            <TextInput
              onChangeText={(EnteredValue) =>
                onCurrentPasswordChange(EnteredValue)
              }
              autoFocus={false}
              secureTextEntry={eyeOn1 ? false : true}
              numberOfLines={1}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
              placeholder={'Current password'}
              selectionColor="black"
              style={[styles.textInput]}
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
          {currentPasswordVerified ? null : (
            <Text style={styles.errorMessage}>
              This is not your current password.
            </Text>
          )}
          <View
            style={[
              styles.textInputContainer,
              {
                marginTop: hp(2),
                borderColor: confirmPasswordVerified ? '#DCDCDC' : '#D51010',
              },
            ]}>
            <TextInput
              onChangeText={(EnteredValue) => onNewPasswordChange(EnteredValue)}
              secureTextEntry={eyeOn2 ? false : true}
              numberOfLines={1}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
              placeholder={'New password'}
              selectionColor="black"
              style={styles.textInput}
            />
            <TouchableOpacity
              style={styles.eyeStyle}
              onPress={() => setEyeOn2((eyeOn2) => !eyeOn2)}
              activeOpacity={0.5}>
              <FastImage
                source={eyeOn2 ? eyeOn : eyeOff}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.textInputContainer,
              {
                marginTop: hp(2),
                borderColor: confirmPasswordVerified ? '#DCDCDC' : '#D51010',
              },
            ]}>
            <TextInput
              onChangeText={(EnteredValue) =>
                onConfirmPasswordChange(EnteredValue)
              }
              secureTextEntry={eyeOn2 ? false : true}
              numberOfLines={1}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
              placeholder={'Confirm password'}
              selectionColor="black"
              style={styles.textInput2}
            />
          </View>
          {confirmPasswordVerified ? null : (
            <Text style={styles.errorMessage}>
              New and confirmation password must match.
            </Text>
          )}
          <Text
            style={styles.forgotPasswordStyle}
            onPress={() => dispatch(setForgotYourPassword(true))}>
            Forgot your password?
          </Text>
        </View>
        {forgotYourPassword ? <ForgotPasswordNav /> : null}
        {successToast ? (
          <View style={[StyleSheet.absoluteFill, {elevation: 6}]}>
            <SuccessToast />
          </View>
        ) : null}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  lineStyle: {
    borderBottomColor: '#DCDCDC',
    borderBottomWidth: 1,
    top: wp(3),
  },
  headerStyle: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: '33.3%',
    height: '40%',
    resizeMode: 'contain',
  },
  backIconView: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: wp(12),
    height: wp(12),
    left: -wp(4.5),
    bottom: -wp(1),
    marginLeft: wp(6),
  },
  usernameText: {
    fontSize: wp(5.6),
    fontWeight: '600',
    color: config.BLACK,
  },
  viewUsernameText: {
    height: wp(12),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -wp(1),
  },
  bodyStyle: {
    flex: 9.2,
  },
  rightActionsStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    height: wp(12),
    right: wp(2.5),
    bottom: -wp(1),
    marginLeft: wp(6),
  },
  textRightActionsBlur: {
    color: '#0091FF80',
    fontSize: wp(4.1),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  textRightActions: {
    color: '#0091FF',
    fontSize: wp(4.1),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  forgotPasswordStyle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#0091FF',
    marginLeft: wp(6.15),
    marginTop: hp(4.73),
  },
  eyeStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: wp(13),
    height: wp(13),
    right: 0,
  },
  eyeIcon: {
    width: '40%',
    height: '40%',
  },
  textInput: {
    flex: 1,
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(15),
    fontWeight: '400',
    color: '#01161E',
  },
  textInput2: {
    flex: 1,
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(6.15),
    fontWeight: '400',
    color: '#01161E',
  },
  textInputContainer: {
    borderWidth: 1,
    marginHorizontal: wp(6.15),
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    height: hp(5.7),
    justifyContent: 'center',
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
export default PasswordScreen;
