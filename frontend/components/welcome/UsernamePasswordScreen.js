import React, {useState, useEffect, useCallback} from 'react';
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
import FastImage from 'react-native-fast-image';
import Button from './Button.js';
import {
  setUsernameRegister,
  setPasswordRegister,
  setRouteRegister,
} from 'actions/welcomeActions.js';
import eyeOff from 'assets/eyeOff.png';
import eyeOn from 'assets/eyeOn.png';
import NetInfo from '@react-native-community/netinfo';

const UsernamePasswordScreen = ({navigation}) => {
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // Prevent default behavior of leaving the screen
        //e.preventDefault();

        // Prompt the user before leaving the screen
        dispatch(setRouteRegister('email'));
      }),
    [],
  );

  const dispatch = useDispatch();
  const registerUsername = useSelector(
    (state) => state.welcome.registerUsername,
  );
  const registerPassword = useSelector(
    (state) => state.welcome.registerPassword,
  );
  const [shouldBeTransparent, setShouldBeTransparent] = useState(true);
  const [eyeOn1, setEyeOn1] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [validPassword, setValidPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usernameMaxLimit, setUsernameMaxLimit] = useState(false);

  useEffect(() => {
    if (registerPassword.length >= 1 && registerUsername.length >= 3) {
      setShouldBeTransparent(false);
    } else {
      setShouldBeTransparent(true);
    }
  }, [registerUsername, registerPassword]);

  // Check format of username
  const onChangeUsernameRegister = (EnteredValue) => {
    if (usernameExists) {
      setUsernameExists(false);
    }
    if (usernameMaxLimit) {
      setUsernameMaxLimit(false);
    }

    if (EnteredValue.charAt(EnteredValue.length - 1) === ' ') {
      EnteredValue = EnteredValue.replace(/ /g, '_');
      dispatch(setUsernameRegister(EnteredValue));
    } else {
      const regex = /^\w+$/;
      if (regex.test(EnteredValue) === true) {
        dispatch(setUsernameRegister(EnteredValue));
      } else if (
        regex.test(EnteredValue) === false &&
        EnteredValue.length === 0
      ) {
        dispatch(setUsernameRegister(''));
      }
    }
  };

  // Handle new password character input
  const onChangePasswordRegister = (EnteredValue) => {
    if (!validPassword) {
      setValidPassword(true);
    }
    dispatch(setPasswordRegister(EnteredValue));
  };

  // check if username and password are valid and go to next screen
  const checkUsernameAndPassword = useCallback(() => {
    if (registerPassword.length >= 8 && registerUsername.length <= 30) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          setTimeout(() => {
            fetch(global.url + 'users/checkName', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                name: registerUsername,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  dispatch(setRouteRegister('ageRange'));
                  navigation.navigate('AgeRange');
                  setLoading(false);
                } else if (response.status === 400) {
                  throw new Error('takenUsername');
                } else if (response.status === 401) {
                  throw new Error('banned');
                } else {
                  throw new Error();
                }
              })
              .catch((err) => {
                if (err == 'Error: banned') {
                  setUsernameExists(true);
                  setLoading(false);
                } else if (err == 'Error: takenUsername') {
                  setUsernameExists(true);
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
    } else if (registerPassword.length < 8 && registerUsername.length > 30) {
      setValidPassword(false);
      setUsernameMaxLimit(true);
    } else if (registerPassword.length < 8 && registerUsername.length <= 30) {
      setValidPassword(false);
    } else {
      setUsernameMaxLimit(true);
    }
  }, [registerPassword, registerUsername]);

  // Go to previous screen
  const goBack = () => {
    setLoading(false);
    dispatch(setRouteRegister('email'));
    navigation.navigate('Email');
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
        <Text style={styles.titleSmall}>Username and Password</Text>
      </View>

      <TextInput
        onChangeText={(EnteredValue) => onChangeUsernameRegister(EnteredValue)}
        numberOfLines={1}
        value={registerUsername}
        autoFocus={true}
        autoCorrect={false}
        multiline={false}
        selectionColor="black"
        placeholder={'Enter your username'}
        style={[
          styles.textInput,
          {
            borderColor:
              usernameExists || usernameMaxLimit ? '#D51010' : '#DCDCDC',
          },
        ]}
      />
      {usernameExists ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            This username is not available.
          </Text>
        </View>
      ) : usernameMaxLimit ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Enter a name under 30 characters.
          </Text>
        </View>
      ) : null}
      <View
        style={[
          styles.passwordTextInputContainer,
          {borderColor: validPassword ? '#DCDCDC' : '#D51010'},
        ]}>
        <TextInput
          onChangeText={(EnteredValue) =>
            onChangePasswordRegister(EnteredValue)
          }
          secureTextEntry={eyeOn1 ? false : true}
          numberOfLines={1}
          value={registerPassword}
          autoCorrect={false}
          multiline={false}
          selectionColor="black"
          autoCapitalize="none"
          placeholder={'Enter your password'}
          style={styles.passwordTextInput}
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
      {!validPassword ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Password must be over 8 characters.
          </Text>
        </View>
      ) : null}

      <Button
        text={loading ? 'Indicator' : 'Next'}
        style={styles.button}
        transparent={shouldBeTransparent}
        onPress={checkUsernameAndPassword}
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
  passwordTextInputContainer: {
    width: wp(88),
    height: wp(12),
    alignSelf: 'center',
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: wp(2),
    marginTop: wp(4),
    justifyContent: 'center',
  },
  passwordTextInput: {
    flex: 1,
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(15),
    fontWeight: '400',
    color: '#01161E',
  },
  eyeStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: 3 * wp(5.1),
    height: 3 * wp(3.8),
    right: 0,
  },
  eyeIcon: {
    width: '33.3%',
    height: '33.3%',
    resizeMode: 'contain',
  },
});

export default UsernamePasswordScreen;
