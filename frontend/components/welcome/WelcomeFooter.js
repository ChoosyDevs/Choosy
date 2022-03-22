import React from 'react';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StyleSheet, View, Platform} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as RootNavigation from './navigationHelper.js';
import {
  setRouteRegister,
  setInitialStateWelcome,
} from 'actions/welcomeActions.js';
import config from 'config/BasicConfig.json';
import {Linking} from 'react-native';

const WelcomeFooter = () => {
  const dispatch = useDispatch();
  const routeRegister = useSelector((state) => state.welcome.routeRegister);
  const B = (props) => (
    <Text onPress={props.onPress} style={styles.linkText}>
      {props.children}
    </Text>
  );
  let text = {};

  // Go to Login screen
  const resetToInitialState = () => {
    RootNavigation.navigate('Login');
    dispatch(setInitialStateWelcome());
  };

  // Decide what the footer text displays based on current screens
  if (routeRegister === 'login')
    text = (
      <Text>
        Don’t have an account?{' '}
        <B
          onPress={() => {
            dispatch(setRouteRegister('email'));
            RootNavigation.navigate('Email');
          }}>
          Sign up.
        </B>{' '}
      </Text>
    );
  else if (routeRegister === 'welcomeMessage') {
    text = (
      <>
        <Text style={styles.terms}>
          By clicking Register, you agree to our{' '}
          <B
            onPress={() =>
              Linking.openURL('https://choosy-terms-of-service.web.app/')
            }>
            Terms of Service
          </B>
          ,{' '}
          <B
            onPress={() =>
              Linking.openURL('https://choosy-acceptable-use-policy.web.app/')
            }>
            Acceptable use Policy
          </B>{' '}
          and{' '}
          <B
            onPress={() =>
              Linking.openURL('https://choosy-privacy-policy.web.app/')
            }>
            Privacy Policy.
          </B>{' '}
        </Text>
      </>
    );
  } else
    text = (
      <Text>
        Already have an account? <B onPress={resetToInitialState}>Log in.</B>{' '}
      </Text>
    );

  return (
    <View style={styles.container}>
      {routeRegister === 'reset' ? null : (
        <>
          <View style={styles.divider} />
          {text}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.WHITE,
  },
  linkText: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(3.5),
    color: '#0091FF',
  },
  divider: {
    height: 0.8,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    width: wp(88),
    backgroundColor: '#DCDCDC',
  },
  terms: {
    fontSize: wp(3.5),
    position: 'absolute',
    marginHorizontal: wp(6),
    textAlign: 'center',
  },
});

export default WelcomeFooter;
