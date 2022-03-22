import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import settings from 'assets/settings.png';
import verified from 'assets/verified.png';
import profileBack from 'assets/profileBack.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {setSettingsVisible} from 'actions/userActions.js';

const HeaderProfile = React.memo((props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  var username = useSelector((state) => {
    return state.user.username;
  });
  var userVerified = useSelector((state) => {
    return state.user.userVerified;
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backIconView}
        onPress={() => navigation.navigate('HomeScreen')}
        activeOpacity={0.5}>
        <FastImage
          source={profileBack}
          style={styles.backIcon}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
      <View style={styles.viewUsernameText}>
        <Text oneLine={true} style={styles.usernameText}>
          {username}
        </Text>
        {userVerified ? (
          <FastImage
            source={verified}
            style={styles.verified}
            resizeMode={'contain'}
          />
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.settingsIconView}
        onPress={() => dispatch(setSettingsVisible(true))}
        activeOpacity={0.5}>
        <FastImage
          source={settings}
          style={styles.settingsIcon}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: wp(6),
    justifyContent: 'center',
  },
  settingsIcon: {
    width: '50%',
    height: '50%',
  },
  settingsIconView: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -wp(3.3),
    bottom: -wp(1),
    width: wp(12),
    height: wp(12),
  },
  backIcon: {
    width: '33.3%',
    height: '40%',
    resizeMode: 'contain',
  },
  backIconView: {
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    width: wp(12),
    height: wp(12),
    left: -wp(4.5),
    bottom: -wp(1),
  },
  usernameText: {
    fontSize: wp(5.6),
    fontWeight: '600',
    color: config.BLACK,
  },
  viewUsernameText: {
    flexDirection: 'row',
    height: wp(12),
    position: 'absolute',
    bottom: -wp(1),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(50),
  },
  verified: {
    height: '45%',
    left: wp(1),
    aspectRatio: 1,
  },
});

export default HeaderProfile;
