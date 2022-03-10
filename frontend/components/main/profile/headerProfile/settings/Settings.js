import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
  BackHandler,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import profileBack from 'assets/profileBack.png';
import arrowRight from 'assets/arrowRight.png';
import FastImage from 'react-native-fast-image';
import * as Keychain from 'react-native-keychain';
import {useDispatch, useSelector} from 'react-redux';
import {
  setSettingsState,
  setInitialStateGeneral,
} from 'actions/generalActions.js';

import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';

import UsernameScreen from './UsernameScreen.js';
import EmailScreen from './EmailScreen.js';
import PasswordScreen from './PasswordScreen.js';
import TargetAges from './TargetAges.js';
import LinkedAccounts from './LinkedAccounts.js';

import Contact from './Contact.js';
import About from './About.js';
import Account from './Account.js';

import NetInfo from '@react-native-community/netinfo';
import {setSettingsVisible, setInitialStateUser} from 'actions/userActions.js';
import {useFocusEffect} from '@react-navigation/native';
import Modal from 'react-native-modal';
import Analytics from 'analytics/Analytics.js';
import perf from '@react-native-firebase/perf';
import PushNotification from 'react-native-push-notification';

function Settings(props) {
  const dispatch = useDispatch();
  var username = useSelector((state) => {
    return state.user.username;
  });
  const settingsState = useSelector((state) => state.general.settingsState);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
    }).start(() => dispatch(setSettingsVisible(false)));
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 0],
  });

  // Log user out
  const logOutFunction = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        setLoading(true);
        Keychain.getGenericPassword()
          .then((creds) => creds.password)
          .then(async (refreshToken) => {
            const metric = await perf().newHttpMetric(
              'choosy-application.com/' + 'auth/users/logout',
              'POST',
            );
            await metric.start();
            let fetchResponse = {};

            await fetch(global.url_auth + 'users/logout', {
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + refreshToken,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            })
              .then((response) => {
                fetchResponse = response;
                setLoading(false);
                if (response.status === 200) {
                  Keychain.resetGenericPassword();
                  //send log out event to analytics
                  Analytics.onSignOut();
                  PushNotification.cancelAllLocalNotifications();
                  dispatch(setInitialStateGeneral());
                  dispatch(setInitialStateHome());
                  dispatch(setInitialStateUser());
                  dispatch(setInitialStateWelcome());
                  dispatch(discardUpload());
                  dispatch(setInitialStateProfile());
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
              })
              .catch((err) => {
                //null
              });
            metric.setHttpResponseCode(fetchResponse.status);
            metric.setResponseContentType(
              fetchResponse.headers.get('Content-Type'),
            );
            metric.setResponsePayloadSize(
              parseFloat(fetchResponse.headers.get('Content-Length')),
            );
            await metric.stop();
          })
          .catch((err) => {
            //null
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

  const modalHide = () => {
    setModalVisible(false);
  };

  const modalOpen = () => {
    setModalVisible(true);
  };

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateX: mountInterpolate}]}]}>
      <View style={styles.container}>
        <View style={styles.headerStyle}>
          <TouchableOpacity
            style={styles.backIconView}
            onPress={closeAnimation}>
            <FastImage
              source={profileBack}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.viewSettingsText}>
            <Text style={styles.settingsText}>Settings</Text>
          </View>
        </View>
        <View style={styles.lineStyle} />
        <View style={styles.bodyStyle}>
          <ScrollView>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('username'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Username</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('password'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Password</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('email'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Email</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('targetAges'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Target Ages</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('contact'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Contact</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('about'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>About</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => dispatch(setSettingsState('account'))}
              activeOpacity={0.5}>
              <Text style={styles.title}>Account</Text>
              <FastImage
                source={arrowRight}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.item}  onPress={() => dispatch(setSettingsState('linkedAccounts'))} activeOpacity={0.5}>
              <Text style={styles.title}>Linked Accounts</Text>
              <FastImage source={arrowRight} style={styles.arrowIcon} resizeMode="contain" />
          </TouchableOpacity> */}

            <View style={[styles.item, {justifyContent: 'center'}]}>
              <View style={styles.border} />
            </View>
            <TouchableOpacity
              style={styles.item}
              onPress={modalOpen}
              activeOpacity={0.5}>
              <Text style={styles.logOutText}>Log out {username}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      <Modal
        isVisible={modalVisible}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={modalHide}
        onBackdropPress={modalHide}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        backdropTransitionOutTiming={0}>
        <View style={styles.containerModal}>
          <View style={styles.modal2SubView}>
            <View style={styles.modal2View1}>
              <Text style={styles.modal2DeletePost}>
                Are you sure you want to
              </Text>
              <Text style={styles.modal2DeletePost}>log out?</Text>
            </View>
            <View style={styles.modal2Line} />
            <View style={styles.viewKap}>
              {loading ? (
                <View style={styles.modal2Touchable}>
                  <ActivityIndicator color="black" size="small" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={logOutFunction}>
                  <Text style={styles.modal2Delete}>Yes</Text>
                </TouchableOpacity>
              )}
              <View style={styles.modal2Line} />
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={modalHide}>
                <Text style={styles.modal2Delete2}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.additionalView} />
        </View>
      </Modal>

      {settingsState === 'username' ? <UsernameScreen /> : null}
      {settingsState === 'email' ? <EmailScreen /> : null}
      {settingsState === 'password' ? <PasswordScreen /> : null}
      {settingsState === 'contact' ? <Contact /> : null}
      {settingsState === 'account' ? <Account /> : null}
      {settingsState === 'about' ? <About /> : null}
      {settingsState === 'targetAges' ? <TargetAges /> : null}
      {settingsState === 'linkedAccounts' ? <LinkedAccounts /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: config.WHITE,
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
  settingsText: {
    fontSize: wp(5.6),
    fontWeight: '600',
    color: config.BLACK,
  },
  viewSettingsText: {
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
  item: {
    width: wp(100),
    height: wp(15),
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontWeight: '400',
    fontSize: wp(4),
    color: config.BLACK,
    left: wp(6),
  },
  arrowIcon: {
    width: wp(2),
    height: wp(4),
    position: 'absolute',
    right: wp(6),
  },
  logOutText: {
    fontWeight: Platform.ios ? '600' : 'bold',
    fontSize: wp(4),
    color: '#0091FF',
    left: wp(6),
  },
  border: {
    height: 0.5,
    width: wp(88),
    alignSelf: 'center',
    backgroundColor: '#DCDCDC',
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
  modal2Delete2: {
    fontSize: wp(4.35),
    color: '#FF453A',
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
export default Settings;
