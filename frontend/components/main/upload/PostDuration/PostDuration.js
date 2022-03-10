import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Platform, BackHandler} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toggle from './Toggle.js';
import Slider from './Slider.js';
import {useSelector, useDispatch} from 'react-redux';
import {
  setPostDuration,
  setModalVisible,
  setPostDurationMinutes,
  setPostDurationHours,
  setPostDurationDays,
} from 'actions/uploadActions.js';
import {useFocusEffect} from '@react-navigation/native';

function PostDuration({navigation}) {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        dispatch(setModalVisible(true));
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const dispatch = useDispatch();

  const minutes = useSelector((state) => state.upload.postDuration.minutes);
  const hours = useSelector((state) => state.upload.postDuration.hours);
  const days = useSelector((state) => state.upload.postDuration.days);

  useEffect(() => {
    dispatch(setPostDuration({minutes, hours, days}));
  }, [minutes, hours, days]);

  const valuesVisual = () => {
    let daysValue, hoursValue, minutesValue;
    if (days !== 0) daysValue = days + 'd';
    else daysValue = '';

    if (hours !== 0) hoursValue = hours + 'h';
    else hoursValue = '';

    if (minutes !== 0) minutesValue = minutes + 'm';
    else minutesValue = '';

    let answer =
      '(' +
      daysValue +
      (daysValue !== '' && (hoursValue !== '' || minutesValue !== '')
        ? ' '
        : '') +
      hoursValue +
      (minutesValue !== '' && (hoursValue !== '' || daysValue !== '')
        ? ' '
        : '') +
      minutesValue +
      ')';
    return answer === '()' ? '' : answer;
  };

  const setMinutes = (mins) => {
    dispatch(setPostDurationMinutes(mins));
  };

  const setHours = (mins) => {
    dispatch(setPostDurationHours(mins));
  };

  const setDays = (mins) => {
    dispatch(setPostDurationDays(mins));
  };

  return (
    <View style={styles.container}>
      <View style={styles.postDuration}>
        <Text style={styles.postDurationText}>Poll duration</Text>
        <Text style={styles.postDurationValue}>{valuesVisual()}</Text>
      </View>
      <View style={styles.slidersContainer}>
        <View
          style={[
            styles.minutesSliderContainer,
            {flex: 1 + (minutes !== 0 ? 1 : 0)},
          ]}>
          <View style={styles.upperHalf}>
            <Text style={styles.title}>Minutes</Text>
            <View style={styles.viewToggle}>
              <Toggle
                isOn={minutes !== 0}
                onToggle={() => {
                  minutes === 0 ? setMinutes(5) : setMinutes(0);
                }}
              />
            </View>
          </View>
          {minutes !== 0 ? (
            <View style={[styles.lowerHalf, {flex: 2}]}>
              <Slider
                snapPoints={[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.divider} />
        <View
          style={[
            styles.hoursSliderContainer,
            {flex: 1 + (hours !== 0 ? 1 : 0)},
          ]}>
          <View style={styles.upperHalf}>
            <Text style={styles.title}>Hours</Text>
            <View style={styles.viewToggle}>
              <Toggle
                isOn={hours !== 0}
                onToggle={() => {
                  hours === 0 ? setHours(2) : setHours(0);
                }}
              />
            </View>
          </View>
          {hours !== 0 ? (
            <View style={[styles.lowerHalf, {flex: 2}]}>
              <Slider snapPoints={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]} />
            </View>
          ) : null}
        </View>
        <View style={styles.divider} />
        <View
          style={[
            styles.daysSliderContainer,
            {flex: 1 + (days !== 0 ? 1 : 0)},
          ]}>
          <View style={styles.upperHalf}>
            <Text style={styles.title}>Days</Text>
            <View style={styles.viewToggle}>
              <Toggle
                isOn={days !== 0}
                onToggle={() => {
                  days === 0 ? setDays(1) : setDays(0);
                }}
              />
            </View>
          </View>
          {days !== 0 ? (
            <View style={[styles.lowerHalf, {flex: 2}]}>
              <Slider snapPoints={[1, 2, 3, 4, 5, 6]} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6.15),
    backgroundColor: config.WHITE,
  },
  postDuration: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  postDurationText: {
    fontSize: wp(4.1),
    color: config.BLACK,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  viewToggle: {
    position: 'absolute',
    right: 0,
  },
  postDurationValue: {
    position: 'absolute',
    right: 0,
    fontSize: wp(3.5),
    color: config.BLACK,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  slidersContainer: {
    flex: 9,
  },
  minutesSliderContainer: {},
  hoursSliderContainer: {},
  daysSliderContainer: {},
  title: {
    fontWeight: '400',
    fontSize: wp(3.5),
  },
  upperHalf: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  lowerHalf: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  divider: {
    width: '100%',
    height: wp(0.5),
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
  },
});

export default PostDuration;
