import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Profile from './profile/Profile.js';
import Home from './home/Home.js';
import Upload from './upload/Upload.js';
import {useSelector} from 'react-redux';
import UploadCompletedToast from './home/UploadCompletedToast/UploadCompletedToast.js';

const Tab = createMaterialTopTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    primary: 'white',
  },
};

const getActiveRouteName = (state) => {
  const route = state.routes[state?.index || 0];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

function Navigation() {
  var [name, setName] = useState('HomeScreen');
  const settingsVisible = useSelector((state) => state.user.settingsVisible);
  const instagramLogin = useSelector((state) => state.profile.instagramLogin);

  const successVisible = useSelector((state) => state.home.successVisible);
  const voting = useSelector((state) => state.home.voting);
  const popoverVisible = useSelector((state) => state.home.popoverVisible);

  return (
    <NavigationContainer
      onStateChange={(state) => {
        setName(getActiveRouteName(state));
      }}
      theme={MyTheme}>
      <Tab.Navigator
        lazy={true}
        backBehavior="initialRoute"
        initialRouteName="HomeScreen"
        swipeEnabled={
          name === 'ProfileScreen' && !settingsVisible && !instagramLogin
            ? true
            : false
        }
        tabBarOptions={{
          style: {height: 0, backgroundColor: 'white'},
        }}
        gestureHandlerProps={{
          maxPointers: 1,
        }}>
        <Tab.Screen name="Upload" component={Upload} />
        <Tab.Screen name="HomeScreen" component={Home} />
        <Tab.Screen name="ProfileScreen" component={Profile} />
      </Tab.Navigator>
      {successVisible && !voting && !popoverVisible ? (
        <View style={styles.absolute}>
          <UploadCompletedToast />
        </View>
      ) : null}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Navigation;
