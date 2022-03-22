import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import Button from './Button.js';
import {
  setEmailRegister,
  setRouteRegister,
  setInitialStateWelcome,
} from 'actions/welcomeActions.js';
import NetInfo from '@react-native-community/netinfo';

const EmailScreen = ({navigation}) => {
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // Prevent default behavior of leaving the screen
        //e.preventDefault();

        // Prompt the user before leaving the screen
        dispatch(setRouteRegister('login'));
      }),
    [],
  );

  const dispatch = useDispatch();
  const registerEmail = useSelector((state) => state.welcome.registerEmail);
  const [shouldBeTransparent, setShouldBeTransparent] = useState(true);
  const [validEmail, setValidEmail] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registerEmail.length >= 1) {
      setShouldBeTransparent(false);
    } else {
      setShouldBeTransparent(true);
    }
  }, [registerEmail]);

  // Handles email character input
  const onChangeEmailRegister = (EnteredValue) => {
    if (!validEmail) {
      setValidEmail(true);
    }
    if (emailExists) {
      setEmailExists(false);
    }
    dispatch(setEmailRegister(EnteredValue));
  };

  // Navigates to previous screen
  const goBack = () => {
    setLoading(false);
    dispatch(setInitialStateWelcome());
    navigation.navigate('Login');
  };

  // Check email format and if it is already in use and navigate to next page
  const onEmailCheckAndNext = () => {
    if (ValidateEmail(registerEmail)) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          setTimeout(() => {
            fetch(global.url + 'users/checkEmail', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                email: registerEmail,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  setLoading(false);
                  dispatch(setRouteRegister('UsernamePassword'));
                  navigation.navigate('UsernamePassword');
                } else if (response.status === 400) {
                  throw new Error('takenEmail');
                } else if (response.status === 401) {
                  throw new Error('banned');
                } else {
                  throw new Error();
                }
              })
              .catch((err) => {
                if (err == 'Error: banned') {
                  setEmailExists(true);
                  setLoading(false);
                } else if (err == 'Error: takenEmail') {
                  setEmailExists(true);
                  setLoading(false);
                } else {
                  //unknown errors
                  setLoading(false);
                }
              });
          }, 50);
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
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={Keyboard.dismiss}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Sign up</Text>
      </View>
      <View style={styles.titleSmallContainter}>
        <Text style={styles.titleSmall}>Email address</Text>
      </View>

      <TextInput
        onChangeText={(EnteredValue) => onChangeEmailRegister(EnteredValue)}
        numberOfLines={1}
        autoFocus={true}
        keyboardType="email-address"
        autoCorrect={false}
        autoCapitalize="none"
        multiline={false}
        selectionColor="black"
        placeholder={'Enter your email address'}
        style={[
          styles.textInput,
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

      <Button
        text={loading ? 'Indicator' : 'Next'}
        style={styles.button}
        transparent={shouldBeTransparent}
        onPress={onEmailCheckAndNext}
      />

      <TouchableOpacity style={styles.backStyle} onPress={goBack}>
        <Text style={styles.textBack}>Back</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
  textInput: {
    width: wp(88),
    height: wp(12),
    alignSelf: 'center',
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
    marginTop: wp(14.3),
    marginLeft: wp(6),
  },
  errorMessageContainer: {
    marginTop: wp(2),
    marginLeft: wp(6),
  },
  titleSmall: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(4.1),
    color: '#01161E',
  },
  errorMessage: {
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: wp(3.5),
    color: '#D51010',
  },
});

export default EmailScreen;
