import React from 'react';
import {StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import {useDispatch} from 'react-redux';
import WelcomeFooter from './WelcomeFooter.js';
import LoginScreen from './LoginScreen.js';
import EmailScreen from './EmailScreen.js';
import UsernamePasswordScreen from './UsernamePasswordScreen.js';
import WelcomeMessageScreen from './WelcomeMessageScreen.js';
import ResetPasswordEmailScreen from './ResetPasswordWelcome/ResetPasswordEmailScreen.js';
import ResetPassword6digitCode from './ResetPasswordWelcome/ResetPassword6digitCode.js';
import ResetPasswordNewPassword from './ResetPasswordWelcome/ResetPasswordNewPassword.js';
import AgeRangeScreen from './AgeRangeScreen.js';
import {CardStyleInterpolators} from '@react-navigation/stack';

import BirthdayScreen from './BirthdayScreen.js';

import {navigationRef} from './navigationHelper.js';

const Stack = createStackNavigator();

const WelcomeNavigator = () => {
  const dispatch = useDispatch();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        headerMode="screen"
        screenOptions={{
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: false,
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Email"
          component={EmailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UsernamePassword"
          component={UsernamePasswordScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AgeRange"
          component={AgeRangeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Birthday"
          component={BirthdayScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WelcomeMessage"
          component={WelcomeMessageScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ResetPasswordEmailScreen"
          component={ResetPasswordEmailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ResetPassword6digitCode"
          component={ResetPassword6digitCode}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ResetPasswordNewPassword"
          component={ResetPasswordNewPassword}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      <WelcomeFooter />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default WelcomeNavigator;
