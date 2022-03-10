import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  BackHandler,
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
import Button from '../Button.js';
import NetInfo from '@react-native-community/netinfo';
import eyeOff from 'assets/eyeOff.png';
import eyeOn from 'assets/eyeOn.png';
import Modal from 'react-native-modal';
import {
  setRouteRegister,
  setSixDigitPassword,
  setResetPasswordEmail,
  setSuccessToast,
  setInitialStateWelcome,
} from 'actions/welcomeActions.js';
import {useFocusEffect} from '@react-navigation/native';

const ResetPasswordNewPassword = ({navigation}) => {
  const dispatch = useDispatch();
  const [shouldBeTransparent, setShouldBeTransparent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [eyeOn1, setEyeOn1] = useState(false);
  const [sameAndValidPasswords, setSameAndValidPasswords] = useState(true);
  const [newPasswordLengthValid, setNewPasswordLengthValid] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const resetPasswordEmail = useSelector(
    (state) => state.welcome.resetPasswordEmail,
  );

  // Android back button handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setModalVisible(true);
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  // Handles "Reset password" button opacity
  useEffect(() => {
    if (newPassword.length >= 1 && confirmPassword.length >= 1) {
      setShouldBeTransparent(false);
    } else {
      setShouldBeTransparent(true);
    }
  }, [newPassword, confirmPassword]);

  // Handles input of new password character input
  const onChangeNewPassword = (EnteredValue) => {
    if (!sameAndValidPasswords) setSameAndValidPasswords(true);
    if (!newPasswordLengthValid) setNewPasswordLengthValid(true);
    setNewPassword(EnteredValue);
  };

  // Handles input of password repetition character input
  const onChangeConfirmNewPassword = (EnteredValue) => {
    if (!sameAndValidPasswords) setSameAndValidPasswords(true);
    setConfirmPassword(EnteredValue);
  };

  // Compares new password and repetition
  const compareNewPasswords = () => {
    if (newPassword === confirmPassword) {
      return true;
    } else {
      return false;
    }
  };

  // Handles press of cancel button
  const cancelPress = () => {
    setModalVisible(true);
  };

  // Navigates back to login pages
  const backToLogin = () => {
    setModalVisible(false);
    navigation.navigate('Login');
    dispatch(setInitialStateWelcome());
  };

  const stayHere = () => {
    setModalVisible(false);
  };

  // Checks of new password is valid and calls function that saves it
  const changePassword = () => {
    if (newPassword.length >= 8) {
      if (compareNewPasswords()) {
        setLoading(true);
        newPasswordChange();
      } else {
        setSameAndValidPasswords(false);
      }
    } else {
      setNewPasswordLengthValid(false);
    }
  };

  // Saves new password
  const newPasswordChange = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        fetch(global.url_auth + 'users/newPassword', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: resetPasswordEmail,
            newPassword: newPassword,
          }),
        })
          .then((response) => {
            if (response.status === 200) {
              setLoading(false);
              dispatch(setSuccessToast(true));
              navigation.navigate('Login');
              dispatch(setRouteRegister('login'));
              dispatch(setResetPasswordEmail(''));
              dispatch(setSixDigitPassword(''));
            } else {
              throw new Error('gen');
            }
          })
          .catch((err) => {
            if (err == 'Error: gen') {
              setLoading(false);
              Alert.alert(
                Platform.OS === 'ios'
                  ? 'Something went wrong, please try again.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'Something went wrong, please try again.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }
          });
      } else {
        setLoading(false);
        Alert.alert(
          Platform.OS === 'ios' ? 'Oops! Check your internet connection.' : '',
          Platform.OS === 'ios' ? '' : 'Oops! Check your internet connection.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={Keyboard.dismiss}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reset Password</Text>
      </View>
      <View
        style={[
          styles.passwordTextInputContainer,
          {
            borderColor:
              sameAndValidPasswords && newPasswordLengthValid
                ? '#DCDCDC'
                : '#D51010',
          },
        ]}>
        <TextInput
          onChangeText={(EnteredValue) => onChangeNewPassword(EnteredValue)}
          autoFocus={true}
          autoCapitalize="none"
          secureTextEntry={eyeOn1 ? false : true}
          numberOfLines={1}
          autoCorrect={false}
          multiline={false}
          placeholder={'New password'}
          selectionColor="black"
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
      {!newPasswordLengthValid ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Password must be over 8 characters.
          </Text>
        </View>
      ) : null}
      <TextInput
        onChangeText={(EnteredValue) =>
          onChangeConfirmNewPassword(EnteredValue)
        }
        secureTextEntry={eyeOn1 ? false : true}
        numberOfLines={1}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={false}
        placeholder={'Confirm new password'}
        selectionColor="black"
        style={[
          styles.textInput,
          {borderColor: sameAndValidPasswords ? '#DCDCDC' : '#D51010'},
        ]}
      />
      {!sameAndValidPasswords ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>Passwords must match.</Text>
        </View>
      ) : null}
      <Button
        text={loading ? 'Indicator' : 'Reset Password'}
        style={styles.button}
        transparent={shouldBeTransparent}
        onPress={changePassword}
      />
      <TouchableOpacity
        style={styles.cancelStyle}
        onPress={cancelPress}
        activeOpacity={0.5}>
        <Text style={styles.textCancelStyle}>Cancel</Text>
      </TouchableOpacity>
      <Modal
        isVisible={modalVisible}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={() => setModalVisible(false)}
        onBackdropPress={() => setModalVisible(false)}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        backdropTransitionOutTiming={0}>
        <View style={styles.containerModal}>
          <View style={styles.modal2SubView}>
            <View style={styles.modal2View1}>
              <Text style={styles.modal2DeletePost}>
                Are you sure you want to cancel?
              </Text>
            </View>
            <View style={styles.modal2Line} />
            <View style={styles.viewKap}>
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={backToLogin}
                activeOpacity={0.5}>
                <Text style={styles.modal2Delete}>Yes</Text>
              </TouchableOpacity>
              <View style={styles.modal2Line} />
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={stayHere}
                activeOpacity={0.5}>
                <Text style={styles.modal2Delete}>No, continue</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.additionalView} />
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: config.WHITE,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: wp(3.58),
    paddingLeft: wp(6.15),
    paddingRight: wp(15),
    fontWeight: '400',
    color: '#01161E',
  },
  textInput: {
    width: wp(88),
    height: wp(12),
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: wp(2),
    marginTop: hp(1.9),
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
  errorMessageContainer: {
    marginTop: wp(2),
    marginLeft: wp(6),
  },
  errorMessage: {
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontSize: wp(3.5),
    color: '#D51010',
  },
  cancelStyle: {
    alignItems: 'center',
    marginTop: hp(4.7),
  },
  textCancelStyle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#01161E',
  },
  eyeStyle: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: wp(13),
    height: wp(13),
    right: 0,
  },
  passwordTextInputContainer: {
    width: wp(88),
    height: wp(12),
    alignSelf: 'center',
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: wp(2),
    marginTop: wp(14.3),
    justifyContent: 'center',
  },
  eyeIcon: {
    width: '33.3%',
    height: '33.3%',
    resizeMode: 'contain',
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

export default ResetPasswordNewPassword;
