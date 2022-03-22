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
import Button from '../Button.js';
import {
  setResetPasswordEmail,
  setInitialStateWelcome,
} from 'actions/welcomeActions.js';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import {useFocusEffect} from '@react-navigation/native';

const ResetPasswordEmailScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.welcome.resetPasswordEmail);

  const setEmail = (email) => {
    dispatch(setResetPasswordEmail(email));
  };

  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Handles new email character input
  const onChangeEmail = (EnteredValue) => {
    if (!validEmail) {
      setValidEmail(true);
    }
    if (!emailExists) {
      setEmailExists(true);
    }
    setEmail(EnteredValue);
  };

  // handles press of the cancel button
  const cancelPress = () => {
    setModalVisible(true);
  };

  // Navigated back to login page
  const backToLogin = () => {
    setModalVisible(false);
    navigation.navigate('Login');
    dispatch(setInitialStateWelcome());
  };

  const stayHere = () => {
    setModalVisible(false);
  };

  // checks email format
  ValidateEmail = (inputText) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  };

  // Requests 6-digit password for given email
  const forgotPasswordFetch = () => {
    if (ValidateEmail(email)) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          setLoading(true);
          fetch(global.url_auth + 'users/forgotPassword', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              email: email,
            }),
          })
            .then((response) => {
              setLoading(false);
              if (response.status === 200) {
                if (!emailExists) {
                  setEmailExists(true);
                }
                navigation.navigate('ResetPassword6digitCode');
              } else if (response.status === 404) {
                setEmailExists(false);
              } else if (response.status === 401) {
                throw new Error('banned');
              } else {
                throw new Error('gen');
              }
            })
            .catch((err) => {
              if (err == 'Error: banned') {
                //handle ban users
                Alert.alert(
                  Platform.OS === 'ios'
                    ? 'Your account is no more active due to inappropriate posts.'
                    : '',
                  Platform.OS === 'ios'
                    ? ''
                    : 'Your account is no more active due to inappropriate posts.',
                  [{text: 'OK'}],
                  {cancelable: false},
                );
              } else if (err == 'Error: gen') {
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

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={Keyboard.dismiss}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reset Password</Text>
      </View>
      <View style={styles.titleSmallContainter}>
        <Text style={styles.titleSmall}>
          Enter the email address linked to your account.
        </Text>
      </View>
      <TextInput
        onChangeText={(EnteredValue) => onChangeEmail(EnteredValue)}
        numberOfLines={1}
        autoFocus={true}
        keyboardType="email-address"
        autoCorrect={false}
        autoCapitalize="none"
        multiline={false}
        placeholder={'Email address'}
        selectionColor="black"
        style={[
          styles.textInput,
          {borderColor: !validEmail || !emailExists ? '#D51010' : '#DCDCDC'},
        ]}
      />
      {!validEmail ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            Please enter a valid email address.
          </Text>
        </View>
      ) : !emailExists ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>
            This email is not linked to a user account.
          </Text>
        </View>
      ) : null}

      <Button
        text={loading ? 'Indicator' : 'Next'}
        style={styles.button}
        transparent={email.length < 1}
        onPress={forgotPasswordFetch}
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
    fontSize: wp(3.5),
    color: '#696D7D',
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

export default ResetPasswordEmailScreen;
