import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import Button from './Button.js';
import {setRoute} from 'actions/generalActions.js';
import {setRouteRegister} from 'actions/welcomeActions.js';
import {
  setUsername,
  setThumbnail,
  setEmail,
  setLevel,
  setPublications,
  setAges,
  setInstagramName,
  setInstagramIntroSeen,
  setUserVerified,
} from 'actions/userActions.js';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import Analytics from 'analytics/Analytics.js';
import perf from '@react-native-firebase/perf';

const WelcomeMessageScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const welcomeDetails = useSelector((state) => state.welcome);
  const targetAges = useSelector((state) => state.user.targetAges);

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // Prevent default behavior of leaving the screen
        // e.preventDefault();

        // Prompt the user before leaving the screen
        // navigation.navigate("Birthday");
        dispatch(setRouteRegister('birthday'));
      }),
    [],
  );

  // Send register fetch with all the info on the user
  const onSubmitChangeRegister = async () => {
    const metric = await perf().newHttpMetric(
      'choosy-application.com/' + 'auth/users/register',
      'POST',
    );
    //Start the metric
    await metric.start();
    let fetchResponse = {};

    await NetInfo.fetch().then(async (state) => {
      if (state.isConnected === true) {
        setLoading(true);
        await fetch(global.url_auth + 'users/register', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: welcomeDetails.registerUsername,
            email: welcomeDetails.registerEmail,
            password: welcomeDetails.registerPassword,
            targetAgeGroups: targetAges,
            birthday: welcomeDetails.registerDateOfBirth,
          }),
        })
          .then((response) => {
            fetchResponse = response;
            if (response.status === 201) {
              return response.json();
            } else if (response.status === 401) {
              throw new Error('401');
            } else if (response.status === 402) {
              throw new Error('402');
            } else throw new Error();
          })
          .then((user) => {
            if (user.token) {
              try {
                Keychain.setGenericPassword(user.token, user.refreshToken);
              } catch (e) {
                //null
              }
              //send SingUp Event to Analytics
              Analytics.onSignUp(user.user);
              setLoading(false);
              dispatch(setUsername(user.user.name));
              dispatch(setThumbnail(user.user.Thumbnail));
              dispatch(setEmail(user.user.email));
              dispatch(setLevel(0));
              dispatch(setPublications(0));
              dispatch(setAges(user.user.targetAgeGroups));
              dispatch(setInstagramName(user.user.instagramName));
              dispatch(setInstagramIntroSeen(user.user.instaIntro));
              dispatch(setUserVerified(user.user.verified));
              goNext();
            }
          })
          .catch((err) => {
            if (err == 'Error: 401') {
              Alert.alert(
                Platform.OS === 'ios' ? 'This username is not available.' : '',
                Platform.OS === 'ios' ? '' : 'This username is not available.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            } else if (err == 'Error: 402') {
              Alert.alert(
                Platform.OS === 'ios' ? 'This email is not available.' : '',
                Platform.OS === 'ios' ? '' : 'This email is not available.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }
            setLoading(false);
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
    metric.setHttpResponseCode(fetchResponse.status);
    metric.setResponseContentType(fetchResponse.headers.get('Content-Type'));
    metric.setResponsePayloadSize(
      parseFloat(fetchResponse.headers.get('Content-Length')),
    );
    await metric.stop();
  };

  const dispatch = useDispatch();
  const registerUsername = useSelector(
    (state) => state.welcome.registerUsername,
  );

  // Go to home page
  const goNext = () => {
    dispatch(setRoute('main'));
    dispatch(setRouteRegister('login'));
  };

  // Go to previous page
  const goBack = () => {
    dispatch(setRouteRegister('birthday'));
    navigation.navigate('Birthday');
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Sign up</Text>
      </View>
      <View style={styles.titleSmallContainter}>
        <Text style={styles.titleSmall}>
          Welcome to Choosy, {registerUsername}!
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          Start creating photo polls where users choose which photo they want to
          see on your social media!
        </Text>
      </View>
      <Button
        text={loading ? 'Indicator' : 'Register'}
        style={styles.button}
        transparent={false}
        onPress={onSubmitChangeRegister}
      />
      <TouchableOpacity style={styles.backStyle} onPress={goBack}>
        <Text style={styles.textBack}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: config.WHITE,
  },
  backStyle: {
    width: wp(14),
    marginTop: wp(6),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBack: {
    fontSize: wp(4),
    fontWeight: '600',
    color: config.BLACK,
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
    marginTop: wp(14.1),
    marginRight: wp(6),
    marginLeft: wp(6),
  },
  textContainer: {
    marginTop: wp(1),
    marginRight: wp(6),
    marginLeft: wp(6),
  },
  titleSmall: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(4.1),
    color: '#01161E',
  },
  text: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
    fontSize: wp(3.5),
    color: config.SECONDARY_TEXT,
    textAlign: 'justify',
  },
});

export default WelcomeMessageScreen;
