import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  BackHandler,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import profileBack from 'assets/profileBack.png';
import arrowRight from 'assets/arrowRight.png';
import FastImage from 'react-native-fast-image';
import {useDispatch} from 'react-redux';
import {setSettingsState} from 'actions/generalActions.js';
import {useFocusEffect} from '@react-navigation/native';
import {Linking} from 'react-native';

function About(props) {
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        closeAnimation();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  var mountAnim = useRef(new Animated.Value(0)).current;

  // Mounting Animation
  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200,
    }).start();
  }, []);

  // Unounting Animation
  const closeAnimation = () => {
    Animated.timing(mountAnim, {
      toValue: 0,
      useNativeDriver: false,
      duration: 200,
    }).start(() => changeState());
  };

  let mountInterpolate = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 0],
  });

  const changeState = () => {
    dispatch(setSettingsState('settings'));
  };

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateX: mountInterpolate}]}]}
      activeOpacity={1}>
      <View style={styles.headerStyle}>
        <TouchableOpacity
          style={styles.backIconView}
          onPress={closeAnimation}
          activeOpacity={0.5}>
          <FastImage
            source={profileBack}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.viewUsernameText}>
          <Text style={styles.usernameText}>About</Text>
        </View>
      </View>
      <View style={styles.lineStyle} />
      <View style={styles.bodyStyle}>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.5}
          onPress={() =>
            Linking.openURL('https://choosy-privacy-policy.web.app/')
          }>
          <Text style={styles.title}>Privacy Policy</Text>
          <FastImage
            source={arrowRight}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.5}
          onPress={() =>
            Linking.openURL('https://choosy-terms-of-service.web.app/')
          }>
          <Text style={styles.title}>Terms of Service</Text>
          <FastImage
            source={arrowRight}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.5}
          onPress={() =>
            Linking.openURL('https://choosy-acceptable-use-policy.web.app/')
          }>
          <Text style={styles.title}>Acceptable use Policy</Text>
          <FastImage
            source={arrowRight}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  lineStyle: {
    borderBottomColor: '#DCDCDC',
    borderBottomWidth: 1,
    top: wp(3),
  },
  headerStyle: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: wp(6),
  },
  usernameText: {
    fontSize: wp(5.6),
    fontWeight: '600',
    color: config.BLACK,
  },
  viewUsernameText: {
    height: wp(12),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -wp(1),
  },
  bodyStyle: {
    flex: 9.2,
    top: wp(3),
    paddingTop: wp(5),
  },
  title: {
    fontWeight: '400',
    fontSize: wp(4),
    color: config.BLACK,
    left: wp(5),
  },
  arrowIcon: {
    width: wp(2),
    height: wp(4),
    position: 'absolute',
    right: wp(6),
  },
  item: {
    width: wp(100),
    height: wp(12),
    alignItems: 'center',
    flexDirection: 'row',
  },
});
export default About;
