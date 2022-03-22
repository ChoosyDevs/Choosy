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
import {setSettingsState} from 'actions/generalActions.js';
import NetInfo from '@react-native-community/netinfo';
import {setEmail} from 'actions/userActions.js';
import {useFocusEffect} from '@react-navigation/native';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';

function EmailScreen(props) {
  const dispatch = useDispatch();
  var email = useSelector((state) => {
    return state.user.email;
  });
  const [loading, setLoading] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);
  const [validEmail, setValidEmail] = useState(true);
  const [emailExists, setEmailExists] = useState(false);

  // Android back button handling
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

  const changeSettingsState = () => {
    dispatch(setSettingsState('settings'));
  };

  // Check email format
  const onEmailChange = (EnteredValue) => {
    if (!validEmail) {
      setValidEmail(true);
    }
    if (emailExists) {
      setEmailExists(false);
    }
    setTempEmail(EnteredValue);
  };

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthEmail = () => {
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
            } catch (e) {}
          })
          .then((data) => {
            changeEmail();
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

  var mountAnim = useRef(new Animated.Value(0)).current;

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

  // Changes the user's email
  const changeEmail = () => {
    if (ValidateEmail(tempEmail)) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          Keychain.getGenericPassword()
            .then((creds) => creds.username)
            .then((token) => {
              fetch(global.url + 'users/email', {
                method: 'PATCH',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({
                  email: tempEmail,
                }),
              })
                .then((response) => {
                  if (response.status === 200) {
                    dispatch(setEmail(tempEmail));
                    setLoading(false);
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Email address was changed successfully.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Email address was changed successfully.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                    closeAnimation();
                  } else if (response.status === 400) {
                    throw new Error('400');
                  } else if (response.status === 411) {
                    throw new Error('token');
                  } else {
                    throw new Error('500');
                  }
                })
                .catch((err) => {
                  if (err != 'Error: token') {
                    setLoading(false);
                    if (err == 'Error: 400') {
                      setEmailExists(true);
                    }
                  } else {
                    refreshAuthEmail();
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
      setValidEmail(false);
    }
  };

  // Check email format
  const ValidateEmail = (inputText) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
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
          <View style={styles.viewEmailText}>
            <Text style={styles.emailText}>Email</Text>
          </View>
          <View style={styles.rightActionsStyle}>
            {loading ? (
              <View style={styles.rightActionsStyle}>
                <ActivityIndicator color={'black'} size="small" />
              </View>
            ) : tempEmail === email || tempEmail.length < 3 ? (
              <View style={styles.rightActionsStyle}>
                <Text style={styles.textRightActionsBlur}>Save</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rightActionsStyle}
                onPress={changeEmail}
                activeOpacity={0.5}>
                <Text style={styles.textRightActions}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.bodyStyle}>
          <Text style={styles.textStyle}>
            This email is used to access your account.
          </Text>
          <TextInput
            onChangeText={(EnteredValue) => onEmailChange(EnteredValue)}
            autoCapitalize="none"
            numberOfLines={1}
            autoCorrect={false}
            keyboardType="email-address"
            multiline={false}
            defaultValue={email}
            selectionColor="black"
            style={[
              styles.textInputStyle,
              {borderColor: !validEmail || emailExists ? '#D51010' : '#DCDCDC'},
            ]}
          />
          {!validEmail ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>
                Please enter a valid email address.
              </Text>
            </View>
          ) : emailExists ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>
                This email is used by another user.
              </Text>
            </View>
          ) : null}
        </View>
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
  emailText: {
    fontSize: wp(5.6),
    fontWeight: '600',
    color: config.BLACK,
  },
  viewEmailText: {
    height: wp(12),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -wp(1),
  },
  bodyStyle: {
    flex: 9.2,
    top: wp(3),
    paddingTop: wp(3),
  },
  textStyle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#696D7D',
    textAlign: 'justify',
    marginHorizontal: wp(6.15),
    marginTop: hp(4),
  },
  textInputStyle: {
    borderWidth: 1,
    marginTop: hp(2.9),
    paddingRight: wp(6.15),
    marginHorizontal: wp(6.15),
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    height: hp(5.7),
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    fontWeight: '400',
    color: '#01161E',
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
  errorMessageContainer: {
    marginTop: wp(2),
    marginLeft: wp(6),
  },
  errorMessage: {
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: wp(3.5),
    color: '#D51010',
  },
});
export default EmailScreen;
