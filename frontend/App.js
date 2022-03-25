import 'react-native-gesture-handler';
// react-native-gesture-handler has to be imported first
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import Navigation from './components/main/Navigation.js';
import Welcome from './components/welcome/WelcomeNavigator.js';
import {Provider} from 'react-redux';
import {store} from './redux/store/store.js';
import {useSelector, useDispatch} from 'react-redux';
import * as Keychain from 'react-native-keychain';
import {setRoute} from 'actions/generalActions.js';
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
import {enableScreens} from 'react-native-screens';
import NetInfo from '@react-native-community/netinfo';
import {setInternetConnection} from 'actions/generalActions.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import LottieView from 'lottie-react-native';
import noInternet from 'assets/noInternet.json';
import Analytics from 'analytics/Analytics.js';
import {
  setInitialStateGeneral,
  setUploadIdFromLink,
} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import SplashScreen from 'react-native-splash-screen';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import PushNotification from 'react-native-push-notification';

enableScreens();

TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  maxFontSizeMultiplier: 1.1,
};

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [linkReady, setLinkReady] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const route = useSelector((state) => state.general.route);
  const internetConnection = useSelector(
    (state) => state.general.internetConnection,
  );
  const dispatch = useDispatch();

  // hide Splash screen handling
  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  // Go to Home page when we have a link and/or the token is ready
  useEffect(() => {
    if (linkReady && tokenReady) {
      dispatch(setRoute('main'));
      setIsReady(true);
    }
  }, [linkReady, tokenReady]);

  //final function that handles uploadId
  const handleDynamicLink = (url) => {
    if (!url) {
      setLinkReady(true);
      return;
    }
    const arr = url.split('?');
    const uploadId = arr[arr.length - 1];
    dispatch(setUploadIdFromLink(uploadId));
    setLinkReady(true);
  };

  //android for background links
  async function fetchMyAPI() {
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link) handleDynamicLink(link.url);
        else setLinkReady(true);
      })
      .catch((e) => {
        setLinkReady(true);
      });
  }

  // Handling of incoming Links to go to specific poll
  React.useEffect(() => {
    let unsubscribe;

    //if block handles background foreground links for IOS
    if (Platform.OS === 'ios') {
      Linking.addEventListener('url', (arg) => {
        let regex = /[?&]([^=#]+)=([^&#]*)/g,
          params = {},
          match;
        while ((match = regex.exec(arg.url))) {
          params[match[1]] = match[2];
        }
        handleDynamicLink(params.link);
      });
      Linking.getInitialURL().then((url) => {
        if (!url) {
          setLinkReady(true);
        } else {
          let regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
          while ((match = regex.exec(url))) {
            params[match[1]] = match[2];
          }
          handleDynamicLink(params.link);
        }
      });
    } else {
      //android for foreground links
      unsubscribe = dynamicLinks().onLink((link) => {
        if (link) handleDynamicLink(link.url);
      });
    }

    if (Platform.OS === 'android') {
      fetchMyAPI();
    }

    // Check for tokens and if they are active
    Keychain.getGenericPassword()
      .then((creds) => {
        if (!creds || creds.password === '1') {
          throw new Error('credsEmpty');
        } else {
          return creds.password;
        }
      })
      .then(async (refreshToken) => {
        await NetInfo.fetch().then((state) => {
          if (state.isConnected === true) {
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
                  Alert.alert(
                    Platform.OS === 'ios'
                      ? 'Your account is no longer active due to inapropriate posts.'
                      : '',
                    Platform.OS === 'ios'
                      ? ''
                      : 'Your account is no longer active due to inapropriate posts.',
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
                  throw new Error('userBanned');
                } else if (res.status === 201) {
                  return res.json();
                } else {
                  throw new Error('jwtError');
                }
              })
              .then(async (response) => {
                dispatch(setUsername(response.user.name));
                dispatch(setThumbnail(response.user.Thumbnail));
                dispatch(setLevel(response.user.level));
                dispatch(setPublications(response.user.publications));
                dispatch(setEmail(response.user.email));
                dispatch(setAges(response.user.targetAgeGroups));
                dispatch(setInstagramName(response.user.instagramName));
                dispatch(setInstagramIntroSeen(response.user.instaIntro));
                dispatch(setUserVerified(response.user.verified));

                try {
                  await Keychain.setGenericPassword(
                    response.token,
                    response.refreshToken,
                  );
                } catch (e) {
                  //nothing
                }

                //set user property numberOfVotes in Analytics
                Analytics.setNumberOfVotes(response.user.level);
                //set user property numberOfUploads in Analytics
                Analytics.setNumberOfUploads(response.user.publications);

                setTokenReady(true);
              })
              .catch((e) => {
                dispatch(setRoute('welcome'));
                setIsReady(true);
              });
          } else {
            throw new Error('internetIssues');
          }
        });
      })
      .catch((err) => {
        if (err == 'Error: internetIssues') {
          dispatch(setInternetConnection(false));
          SplashScreen.hide();
        } else {
          dispatch(setRoute('welcome'));
          setIsReady(true);
        }
      });

    return () => {
      if (Platform.OS === 'ios') {
        return null;
      } else {
        return unsubscribe();
      }
    };
  }, [internetConnection]);

  // Check if there is internet connection and if not go to "No internet" screen
  const checkInternet = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        dispatch(setInternetConnection(true));
      } else {
        //we donothing
      }
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={config.WHITE} />
      <SafeAreaView style={styles.safeStyle}>
        {!internetConnection ? (
          <View style={styles.flexStyle}>
            <View style={styles.lottieStyleInternet}>
              <LottieView source={noInternet} autoPlay loop />
            </View>
            <View style={styles.view2}>
              <Text style={styles.connectText}>Connect to the internet</Text>
            </View>
            <View style={styles.viewStyle}>
              <Text style={styles.textStyle}>
                It looks like you don't have an internet connection right now.
              </Text>
            </View>
            <TouchableOpacity
              onPress={checkInternet}
              style={styles.touchable}
              activeOpacity={0.7}>
              <Text style={styles.retry}>RETRY</Text>
            </TouchableOpacity>
            <View style={styles.viewDown} />
          </View>
        ) : !isReady ? (
          <View style={styles.indicatorStyle}>
            <ActivityIndicator size="large" color="black" />
          </View>
        ) : route === 'main' ? (
          <Navigation />
        ) : (
          <Welcome />
        )}
      </SafeAreaView>
    </>
  );
};

global.url = '#############';
global.url_auth = '################';
global.appId = '#############';
global.appSecret = '##################';

const styles = StyleSheet.create({
  flexStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeStyle: {
    flex: 1,
  },
  view2: {
    marginTop: hp(4),
  },
  connectText: {
    fontSize: wp(5),
    fontWeight: '600',
  },
  viewStyle: {
    marginTop: hp(1.5),
    width: wp(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: wp(4),
    textAlign: 'center',
  },
  touchable: {
    width: wp(75),
    height: hp(6),
    marginTop: hp(3.5),
    borderColor: config.PRIMARY_COLOUR,
    borderWidth: wp(0.5),
    borderRadius: wp(4),
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retry: {
    color: config.WHITE,
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  viewDown: {
    marginTop: hp(10),
  },
  indicatorStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieStyleInternet: {
    width: wp(90),
    height: wp(40),
  },
});

export default AppWrapper;
