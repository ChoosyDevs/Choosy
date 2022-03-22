import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import config from 'config/BasicConfig.json';
import ActiveUploads from './activeUploads/ActiveUploads.js';
import InactiveUploads from './inactiveUploads/InactiveUploads.js';
import trophy from 'assets/trophy.png';
import trophyGray from 'assets/trophyGray.png';
import flame from 'assets/flame.png';
import flameGray from 'assets/flameGray.png';
import Text from 'config/Text.js';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import {useSelector, useDispatch} from 'react-redux';
import {setRefreshingProfile} from 'actions/profileActions.js';
import {setInternetConnectionInTheApp} from 'actions/generalActions.js';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import {
  setActiveMoreIndex,
  setIndexOfPressActiveUploads,
  setActiveAndInactivePhotosArray,
} from 'actions/profileActions.js';
import perf from '@react-native-firebase/perf';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import celebration from 'assets/celebration.json';
import {setModalFinishedPoll} from 'actions/profileActions.js';
import PushNotification from 'react-native-push-notification';

const NavigationProfile = React.memo((props) => {
  const dispatch = useDispatch();
  var uploadEnded = useSelector((state) => {
    return state.general.uploadEnded;
  });
  const modalFinishedPoll = useSelector(
    (state) => state.profile.modalFinishedPoll,
  );

  useEffect(() => {
    loadUploads(false);
  }, [uploadEnded]);

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthNavigationProfile = () => {
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
            loadUploads(true);
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
              PushNotification.cancelAllLocalNotifications();
            }
          });
      });
  };

  // Bring uploads from database and sort them in Active and Inactive array
  const loadUploads = (flag) => {
    dispatch(setIndexOfPressActiveUploads(1));
    dispatch(setActiveMoreIndex(0));
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        Keychain.getGenericPassword()
          .then((creds) => creds.username)
          .then(async (token) => {
            const metric = await perf().newHttpMetric(
              'choosy-application.com/' + 'uploads/me',
              'GET',
            );
            await metric.start();
            let fetchResponse = {};

            await fetch(global.url + 'uploads/me', {
              method: 'GET',
              headers: {
                Authorization: 'Bearer ' + token,
              },
            })
              .then((uploadsArray) => {
                fetchResponse = uploadsArray;
                if (uploadsArray.status === 411) {
                  throw new Error('token');
                } else if (uploadsArray.status === 400) {
                  throw new Error('400');
                } else {
                  return uploadsArray.json();
                }
              })
              .then((uploadsParsed) => {
                let activeArray = [];
                let wonPhotos = [];

                uploadsParsed.forEach((upload) => {
                  //sorts the uploads array from highest to lower voted photo
                  upload.photos.sort((a, b) => b.votes - a.votes);
                  if (upload.active) {
                    activeArray.push(upload);
                  } else {
                    var obj = {};
                    obj.uri = upload.photos[0].uri;
                    obj.uploadId = upload._id;
                    obj.uploadVotes = upload.totalvotes;
                    wonPhotos.push(obj);
                  }
                });

                if (flag) {
                  dispatch(setRefreshingProfile(false));
                }

                dispatch(
                  setActiveAndInactivePhotosArray({activeArray, wonPhotos}),
                );
              })
              .catch((err) => {
                if (err != 'Error: token') {
                  if (flag) {
                    dispatch(setRefreshingProfile(false));
                  }
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
                } else {
                  refreshAuthNavigationProfile();
                }
              });
            metric.setHttpResponseCode(fetchResponse.status);
            metric.setResponseContentType(
              fetchResponse.headers.get('Content-Type'),
            );
            await metric.stop();
          });
      } else {
        if (flag) {
          dispatch(setRefreshingProfile(false));
        }
        if (!flag) {
          dispatch(setInternetConnectionInTheApp(false));
        }
        Alert.alert(
          Platform.OS === 'ios' ? 'Oops! Check your internet connection.' : '',
          Platform.OS === 'ios' ? '' : 'Oops! Check your internet connection.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }
    });
  };

  // function that calls loadUploads when active upload converts to inactive
  const callLoadUploads = (flag) => {
    loadUploads(flag);
  };

  const scrollViewRef = useRef();
  let scrollX = useRef(new Animated.Value(0)).current;

  let tabBarColor = scrollX.interpolate({
    inputRange: [0, wp(50)],
    outputRange: [config.PRIMARY_COLOUR, config.PRIMARY_GRADIENT_COLOUR],
  });

  let tabBarPosition = scrollX.interpolate({
    inputRange: [0, wp(100)],
    outputRange: [0, wp(50)],
  });

  let tabBarFirstIconOpacity = scrollX.interpolate({
    inputRange: [0, wp(100)],
    outputRange: [1, 0],
  });

  let tabBarSecondIconOpacity = scrollX.interpolate({
    inputRange: [0, wp(100)],
    outputRange: [0, 1],
  });

  const scrollToActive = () => {
    if (scrollX.__getValue() == 0) {
      dispatch(setRefreshingProfile(true));
      setTimeout(() => callLoadUploads(true), 1000);
    } else {
      scrollViewRef.current.scrollTo({x: 0, animated: true});
    }
  };

  const scrollToInactive = () => {
    scrollViewRef.current.scrollToEnd({animated: true});
  };

  return (
    <View style={styles.container}>
      <View style={[styles.tabBarContainer]}>
        <TouchableOpacity
          onPress={scrollToActive}
          style={styles.button}
          activeOpacity={0.5}>
          <Animated.Image
            style={[
              styles.image,
              {position: 'absolute', opacity: tabBarSecondIconOpacity},
            ]}
            source={flameGray}
          />
          <Animated.Image
            style={[styles.image, {opacity: tabBarFirstIconOpacity}]}
            source={flame}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={scrollToInactive}
          style={styles.button}
          activeOpacity={0.5}>
          <Animated.Image
            style={[
              styles.image,
              {position: 'absolute', opacity: tabBarFirstIconOpacity},
            ]}
            source={trophyGray}
          />
          <Animated.Image
            style={[styles.image, {opacity: tabBarSecondIconOpacity}]}
            source={trophy}
          />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: tabBarColor,
              transform: [{translateX: tabBarPosition}],
            },
          ]}
        />
      </View>
      <ScrollView
        scrollEventThrottle={16}
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: false,
          }, // Optional async listener
        )}
        scrollEventThrottle={16}>
        <ActiveUploads
          style={styles.scrollViewChild}
          callLoadUploads={callLoadUploads}
        />
        <InactiveUploads style={styles.scrollViewChild} />
      </ScrollView>
      <Modal
        isVisible={modalFinishedPoll}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={() => dispatch(setModalFinishedPoll(false))}
        onBackdropPress={() => dispatch(setModalFinishedPoll(false))}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        useNativeDriverForBackdrop={true}>
        <View style={styles.containerModal}>
          <View style={styles.viewStyle}>
            <LottieView
              style={styles.lottieViewStyle}
              source={celebration}
              autoPlay
              loop
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.textStyle}>
              One or more polls have finished!
            </Text>
          </View>
          <View style={styles.viewTouchable}>
            <TouchableOpacity
              style={styles.touchable}
              onPress={() => {
                dispatch(setModalFinishedPoll(false));
                scrollToInactive();
              }}
              activeOpacity={0.5}>
              <Text style={styles.okStyle}>See Results</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.viewTouchable}>
            <TouchableOpacity
              style={styles.touchable}
              onPress={() => dispatch(setModalFinishedPoll(false))}
              activeOpacity={0.5}>
              <Text style={styles.okStyle2}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 6.9,
  },
  scrollViewChild: {
    width: wp(100),
  },
  tabBarContainer: {
    width: wp(100),
    height: wp(12),
    backgroundColor: config.WHITE,
    flexDirection: 'row',
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.4),
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '65%',
    resizeMode: 'contain',
  },
  bar: {
    width: wp(50),
    height: wp(0.8),
    borderRadius: 100,
    position: 'absolute',
    left: 0,
    bottom: -wp(0.4),
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  containerModal: {
    width: wp(69.2),
    height: wp(63),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    marginHorizontal: wp(10),
    textAlign: 'center',
    fontSize: wp(4.2),
  },
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.5,
    width: '100%',
    // backgroundColor:'red',
  },
  viewTouchable: {
    borderTopColor: '#DCDCDC',
    borderTopWidth: wp(0.15),
    flex: 1.1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okStyle: {
    fontSize: wp(4.3),
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieViewStyle: {
    height: '110%',
    top: '0%',
  },
  okStyle2: {
    color: 'black',
    fontSize: wp(4.3),
    fontWeight: '300',
  },
});

export default NavigationProfile;
