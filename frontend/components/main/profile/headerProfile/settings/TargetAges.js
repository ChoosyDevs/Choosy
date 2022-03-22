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
import {setAges} from 'actions/userActions.js';
import {useFocusEffect} from '@react-navigation/native';
import DoubleSlider from '../../../../welcome/DoubleSlider.js';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';

function TargetAges(props) {
  const dispatch = useDispatch();

  var targetAges = useSelector((state) => state.user.targetAges);
  const [targetAgesLocal, setTargetAgesLocal] = useState(targetAges);
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

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthAges = () => {
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
            changeAges();
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

  // Change target age range
  const changeAges = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        if (!loading) {
          setLoading(true);
        }
        Keychain.getGenericPassword()
          .then((creds) => creds.username)
          .then((token) => {
            fetch(global.url + 'users/targetAgeGroups', {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify({
                targetAgeGroups: targetAgesLocal,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  setLoading(false);
                  dispatch(setAges(targetAgesLocal));
                  Alert.alert(
                    Platform.OS === 'ios'
                      ? 'Target ages were changed successfully.'
                      : '',
                    Platform.OS === 'ios'
                      ? ''
                      : 'Target ages were changed successfully.',
                    [{text: 'OK'}],
                    {cancelable: false},
                  );
                  closeAnimation();
                } else if (response.status === 400) {
                  throw new Error('400');
                } else if (response.status === 411) {
                  throw new Error('token');
                }
              })
              .catch((err) => {
                if (err != 'Error: token') {
                  setLoading(false);
                  //
                } else {
                  refreshAuthAges();
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

  const onChange = (ages) => {
    setTargetAgesLocal(ages);
  };

  const changeState = () => {
    dispatch(setSettingsState('settings'));
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
          <Text style={styles.usernameText}>Target Ages</Text>
        </View>
        {loading ? (
          <View style={styles.rightActionsStyle}>
            <ActivityIndicator color={'black'} size="small" />
          </View>
        ) : targetAgesLocal[0] === targetAges[0] &&
          targetAgesLocal[1] === targetAges[1] ? (
          <View style={styles.rightActionsStyle}>
            <Text style={styles.textRightActionsBlur}>Save</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rightActionsStyle}
            onPress={changeAges}
            activeOpacity={0.5}>
            <Text style={styles.textRightActions}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.lineStyle} />
      <View style={styles.bodyStyle}>
        <Text style={styles.textStyle}>
          This is the age range of those users who will be able to see and
          choose photos from your polls. This information is only available to
          you.
        </Text>
        <DoubleSlider onChange={onChange} targetAgesBefore={targetAgesLocal} />
      </View>
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
  rightActionsStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    height: wp(12),
    right: wp(3),
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
});
export default TargetAges;
