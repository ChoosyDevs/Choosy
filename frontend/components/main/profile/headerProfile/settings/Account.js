import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Button,
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
import {useDispatch, useSelector} from 'react-redux';
import {setSettingsState} from 'actions/generalActions.js';
import {useFocusEffect} from '@react-navigation/native';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import * as Keychain from 'react-native-keychain';

import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import PushNotification from 'react-native-push-notification';

function About(props) {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const changeState = () => {
    dispatch(setSettingsState('settings'));
  };

  const setModalVisibleTrue = () => {
    setModalVisible(true);
  };
  const setModalVisibleFalse = () => {
    setModalVisible(false);
  };

  // Function that deletes the account
  const deleteAccount = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        setLoading(true);
        Keychain.getGenericPassword()
          .then((creds) => creds.password)
          .then((refreshToken) => {
            fetch(global.url_auth + 'users/me', {
              method: 'DELETE',
              headers: {
                Authorization: 'Bearer ' + refreshToken,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            })
              .then((response) => {
                setLoading(false);
                if (response.status === 200) {
                  Keychain.resetGenericPassword();
                  dispatch(setInitialStateGeneral());
                  dispatch(setInitialStateHome());
                  dispatch(setInitialStateUser());
                  dispatch(setInitialStateWelcome());
                  dispatch(discardUpload());
                  dispatch(setInitialStateProfile());
                  Alert.alert(
                    Platform.OS === 'ios'
                      ? 'Your account was deleted successfully.'
                      : '',
                    Platform.OS === 'ios'
                      ? ''
                      : 'Your account was deleted successfully.',
                    [{text: 'OK'}],
                    {cancelable: false},
                  );
                  PushNotification.cancelAllLocalNotifications();
                } else {
                  throw new Error();
                }
              })
              .catch((err) => {
                Alert.alert(
                  Platform.OS === 'ios'
                    ? 'Please check your internet connection and try again.'
                    : '',
                  Platform.OS === 'ios'
                    ? ''
                    : 'Please check your internet connection and try again.',
                  [{text: 'OK'}],
                  {cancelable: true},
                );
              });
          })
          .catch((err) => {
            //nothing
          });
      } else {
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
    <Animated.View
      style={[styles.container, {transform: [{translateX: mountInterpolate}]}]}
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
          <Text style={styles.usernameText}>Account</Text>
        </View>
      </View>
      <View style={styles.lineStyle} />
      <View style={styles.bodyStyle}>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.5}
          onPress={setModalVisibleTrue}>
          <Text style={styles.title}>Delete Account</Text>
          <FastImage
            source={arrowRight}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={modalVisible}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={setModalVisibleFalse}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        backdropTransitionOutTiming={0}>
        <View style={styles.containerModal}>
          <View style={styles.modal2SubView}>
            <View style={styles.modal2View1}>
              <Text style={styles.modal2DeletePost}>Delete account?</Text>
              <Text style={styles.modal2Text}>
                This action is immediate and irreversible. Your personal
                information will now be deleted from the app.
              </Text>
            </View>
            <View style={styles.modal2Line} />
            <View style={styles.viewKap}>
              {loading ? (
                <View style={styles.modal2Touchable} activeOpacity={0.5}>
                  <ActivityIndicator color="black" size="small" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={deleteAccount}
                  activeOpacity={0.5}>
                  <Text style={styles.modal2Delete}>Delete</Text>
                </TouchableOpacity>
              )}

              <View style={styles.modal2Line} />
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={setModalVisibleFalse}
                activeOpacity={0.5}>
                <Text style={styles.modal2DontDelete}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: wp(5),
  },
  title: {
    fontWeight: '400',
    fontSize: wp(4),
    color: config.BLACK,
    left: wp(5),
  },
  arrowIcon: {
    width: wp(2),
    height: wp(4),
    position: 'absolute',
    right: wp(6),
  },
  item: {
    width: wp(100),
    height: wp(12),
    alignItems: 'center',
    flexDirection: 'row',
  },
  containerModal: {
    width: wp(69.2),
    height: wp(55),
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
    color: '#FF453A',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  modal2DontDelete: {
    fontSize: wp(4.35),
    color: '#007AFF',
  },
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2SubView: {
    flex: 1,
  },
  modal2View1: {
    flex: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2DeletePost: {
    color: config.BLACK,
    fontSize: wp(4.35),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  modal2Text: {
    textAlign: 'center',
    marginHorizontal: wp(5.92),
    fontSize: wp(3.33),
    marginTop: '1.7%',
  },
  viewKap: {
    flex: 2,
  },
});
export default About;
