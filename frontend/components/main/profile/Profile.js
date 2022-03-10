import React from 'react';
import {View, StyleSheet} from 'react-native';
import config from 'config/BasicConfig.json';
import {useSelector} from 'react-redux';
import Usercard from './usercard/Usercard.js';
import HeaderProfile from './headerProfile/HeaderProfile.js';
import NavigationProfile from './navigationProfile/NavigationProfile.js';
import Settings from './headerProfile/settings/Settings.js';
function Profile() {
  const settingsVisible = useSelector((state) => state.user.settingsVisible);
  var instagramLogin = useSelector((state) => state.profile.instagramLogin);

  return (
    <View style={styles.container}>
      <HeaderProfile />
      <Usercard />
      <NavigationProfile />
      {settingsVisible ? <Settings style={styles.modalStyle} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.WHITE,
  },
});

export default Profile;
