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
import {setUsername} from 'actions/userActions.js';
import {useFocusEffect} from '@react-navigation/native';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';

function UsernameScreen(props) {
  const dispatch = useDispatch();
  var username = useSelector((state) => {
    return state.user.username;
  });
  const [tempUsername, setTempUsername] = useState(username);
  const [loading, setLoading] = useState(false);
  const [usernameMaxLimit, setUsernameMaxLimit] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

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

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthUsername = () => {
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
            changeName(tempUsername);
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
    }).start(() => changeState());
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 0],
  });

  // Change username
  const changeName = () => {
    if (tempUsername.length <= 30) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          Keychain.getGenericPassword()
            .then((creds) => creds.username)
            .then((token) => {
              fetch(global.url + 'users/name', {
                method: 'PATCH',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({
                  name: tempUsername,
                }),
              })
                .then((response) => {
                  if (response.status === 200) {
                    setLoading(false);
                    dispatch(setUsername(tempUsername));
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Username was changed successfully.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Username was changed successfully.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                    closeAnimation();
                  } else if (response.status === 400) {
                    throw new Error('400');
                  } else if (response.status === 411) {
                    throw new Error('token');
                  } else throw new Error('gen');
                })
                .catch((err) => {
                  if (err != 'Error: token') {
                    setLoading(false);
                    if (err == 'Error: 400') {
                      setUsernameExists(true);
                    }
                  } else {
                    refreshAuthUsername();
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
      setUsernameMaxLimit(true);
    }
  };

  const changeState = () => {
    dispatch(setSettingsState('settings'));
  };

  // Check username format
  const onNameChange = (EnteredValue) => {
    if (usernameMaxLimit) {
      setUsernameMaxLimit(false);
    }

    if (usernameExists) {
      setUsernameExists(false);
    }

    if (EnteredValue.charAt(EnteredValue.length - 1) === ' ') {
      EnteredValue = EnteredValue.replace(/ /g, '_');
      setTempUsername(EnteredValue);
    } else {
      const regex = /^\w+$/;
      if (regex.test(EnteredValue) === true) {
        setTempUsername(EnteredValue);
      } else if (
        regex.test(EnteredValue) === false &&
        EnteredValue.length === 0
      ) {
        setTempUsername('');
      }
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
            <Text style={styles.usernameText}>Username</Text>
          </View>
          <View style={styles.rightActionsStyle}>
            {loading ? (
              <View style={styles.rightActionsStyle}>
                <ActivityIndicator color={'black'} size="small" />
              </View>
            ) : tempUsername === username || tempUsername.length < 3 ? (
              <View style={styles.rightActionsStyle}>
                <Text style={styles.textRightActionsBlur}>Save</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rightActionsStyle}
                onPress={changeName}
                activeOpacity={0.5}>
                <Text style={styles.textRightActions}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.bodyStyle}>
          <Text style={styles.textStyle}>
            This is the public username that others see in your polls.
          </Text>
          <TextInput
            onChangeText={(EnteredValue) => onNameChange(EnteredValue)}
            value={tempUsername}
            numberOfLines={1}
            autoCorrect={false}
            multiline={false}
            defaultValue={username}
            selectionColor="black"
            style={[
              styles.textInputStyle,
              {
                borderColor:
                  usernameMaxLimit || usernameExists ? '#D51010' : '#DCDCDC',
              },
            ]}
          />

          {usernameMaxLimit ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>
                Username must be under 30 characters.
              </Text>
            </View>
          ) : usernameExists ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>
                This username is not available.
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
    marginHorizontal: wp(6.15),
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    height: hp(5.7),
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    fontWeight: '400',
    color: '#01161E',
    paddingRight: wp(6.15),
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
export default UsernameScreen;
