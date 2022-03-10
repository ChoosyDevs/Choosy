import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Animated,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useDispatch} from 'react-redux';
import Button from './Button.js';
import {setRouteRegister, setDateOfBirth} from 'actions/welcomeActions.js';

// -------------------- Prepare dates help data ---------------------------------------
let days = [''];
let daysOffsets = [0];

for (var i = 1; i < 32; i++) {
  days.push(i);
  daysOffsets.push(i * wp(12));
  if (i === 31) {
    days.push('');
    daysOffsets.push(31 * wp(12));
  }
}

let months = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  '',
];
let monthsOffets = [
  0,
  1 * wp(12),
  2 * wp(12),
  3 * wp(12),
  4 * wp(12),
  5 * wp(12),
  6 * wp(12),
  7 * wp(12),
  8 * wp(12),
  9 * wp(12),
  10 * wp(12),
  11 * wp(12),
  12 * wp(12),
];

let years = [''];
let yearsOffsets = [0];

var k = 1;
var currentYear = new Date().getFullYear();
for (var i = 1900; i <= currentYear; i++) {
  years.push(i);
  yearsOffsets.push(k++ * wp(12));
  if (i === currentYear) {
    years.push('');
    yearsOffsets.push(currentYear * wp(12));
  }
}
// -------------------- End of preparation ---------------------------------

const BirthdayScreen = ({navigation}) => {
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // Prevent default behavior of leaving the screen
        //e.preventDefault();

        // Prompt the user before leaving the screen
        dispatch(setRouteRegister('ageRange'));
      }),
    [],
  );

  const dispatch = useDispatch();

  const day = useRef(17);
  const month = useRef('Jul');
  const year = useRef(2000);

  const scrollDayRef = useRef();

  let scrollDay = useRef(new Animated.Value(0)).current;
  let positionDay = Animated.divide(scrollDay, wp(12));

  let scrollMonth = useRef(new Animated.Value(0)).current;
  let positionMonth = Animated.divide(scrollMonth, wp(12));

  let scrollYear = useRef(new Animated.Value(0)).current;
  let positionYear = Animated.divide(scrollYear, wp(12));

  // Go to previous register page
  const goBack = () => {
    dispatch(setRouteRegister('ageRange'));
    navigation.navigate('AgeRange');
  };

  // Go to next register page
  const goNext = () => {
    if (new Date().getFullYear() - year.current < 13) {
      Alert.alert(
        Platform.OS === 'ios'
          ? 'You have to be over 13 years old to create an account.'
          : '',
        Platform.OS === 'ios'
          ? ''
          : 'You have to be over 13 years old to create an account.',
        [{text: 'OK'}],
        {cancelable: true},
      );
    } else {
      const dateString =
        year.current.toString() +
        '-' +
        monthStringToNumber() +
        '-' +
        (day.current > 9 ? day.current : '0' + day.current.toString());
      const birthday = new Date(dateString);
      dispatch(setDateOfBirth(birthday));
      dispatch(setRouteRegister('welcomeMessage'));
      navigation.navigate('WelcomeMessage');
    }
  };

  // Month abbreviation -> Month id number
  const monthStringToNumber = () => {
    const monthStringToNumberHelper = (element) => element === month.current;
    const index = months.findIndex(monthStringToNumberHelper);
    return index > 9 ? index : '0' + index.toString();
  };

  // Flatlist key extractor
  const keyExtractor = (item, index) => index.toString();

  // Returns Animated Day text
  const renderItemDay = ({item, index}) => {
    let opacity = positionDay.interpolate({
      inputRange: [index - 2, index - 1, index],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        style={{
          height: wp(12),
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
        }}>
        <Text style={styles.pickerText}>{item}</Text>
      </Animated.View>
    );
  };

  // Returns Animated Month text

  const renderItemMonth = ({item, index}) => {
    let opacity = positionMonth.interpolate({
      inputRange: [index - 2, index - 1, index],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        style={{
          height: wp(12),
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
        }}>
        <Text style={styles.pickerText}>{item}</Text>
      </Animated.View>
    );
  };

  // Returns Animated Year text
  const renderItemYear = ({item, index}) => {
    let opacity = positionYear.interpolate({
      inputRange: [index - 2, index - 1, index],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          height: wp(12),
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
        }}>
        <Text style={styles.pickerText}>{item}</Text>
      </Animated.View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: wp(12),
    offset: wp(12) * index,
    index,
  });

  // Return if a year is leap year
  const leapYear = () => {
    return (
      (year.current % 4 == 0 && year.current % 100 != 0) ||
      year.current % 400 == 0
    );
  };

  // set new selected day
  const onMomentumScrollEndDays = (event) => {
    day.current = Math.round(event.nativeEvent.contentOffset.y / wp(12)) + 1;

    fixDate();
  };

  // set new selected month
  const onMomentumScrollEndMonth = (event) => {
    month.current =
      months[Math.round(event.nativeEvent.contentOffset.y / wp(12)) + 1];

    fixDate();
  };

  // set new selected year
  const onMomentumScrollEndYear = (event) => {
    year.current =
      years[Math.round(event.nativeEvent.contentOffset.y / wp(12)) + 1];

    fixDate();
  };

  // scroll to a different day if the current month doesnt support it
  // Example: if we selected 31st Februari -> scroll back to 28 or 29 (depending on leap year)
  const fixDate = () => {
    if (month.current === 'Feb' && day.current > 28) {
      const leap = leapYear();
      if (leap) {
        day.current = 29;
        scrollDayRef.current.scrollToIndex({
          index: 28,
        });
      } else {
        day.current = 28;
        scrollDayRef.current.scrollToIndex({
          index: 27,
        });
      }
    } else if (
      (month.current === 'Apr' ||
        month.current === 'Jun' ||
        month.current === 'Sep' ||
        month.current === 'Nov') &&
      day.current === 31
    ) {
      day.current = 30;
      scrollDayRef.current.scrollToIndex({
        index: 29,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Sign up</Text>
      </View>
      <View style={styles.titleSmallContainter}>
        <Text style={styles.titleSmall}>Add your birthday</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          Your birthday will not be shown publicly.
        </Text>
      </View>
      <View style={styles.datePickerContainer}>
        <FlatList
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={onMomentumScrollEndDays}
          initialScrollIndex={16}
          ref={scrollDayRef}
          data={days}
          showsVerticalScrollIndicator={false}
          snapToStart
          snapToEnd
          snapToOffsets={daysOffsets}
          snapToAlignment={'center'}
          style={{flex: 1}}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollDay}}}],
            {
              useNativeDriver: false,
            },
          )}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          renderItem={renderItemDay}
          keyExtractor={keyExtractor}
        />
        <FlatList
          getItemLayout={getItemLayout}
          data={months}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={6}
          snapToStart
          snapToEnd
          snapToOffsets={monthsOffets}
          onMomentumScrollEnd={onMomentumScrollEndMonth}
          style={{flex: 1}}
          snapToAlignment={'center'}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollMonth}}}],
            {
              useNativeDriver: false,
            },
          )}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          renderItem={renderItemMonth}
          keyExtractor={keyExtractor}
        />
        <FlatList
          getItemLayout={getItemLayout}
          data={years}
          initialScrollIndex={100}
          showsVerticalScrollIndicator={false}
          snapToStart
          snapToEnd
          snapToOffsets={yearsOffsets}
          style={{flex: 1}}
          snapToAlignment={'center'}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEndYear}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollYear}}}],
            {
              useNativeDriver: false,
            },
          )}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          renderItem={renderItemYear}
          keyExtractor={keyExtractor}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', top: wp(12), left: wp(2)},
          ]}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', bottom: wp(12), left: wp(2)},
          ]}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', top: wp(12), right: wp(51) / 3 + wp(2)},
          ]}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', bottom: wp(12), right: wp(51) / 3 + wp(2)},
          ]}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', top: wp(12), right: wp(2)},
          ]}
        />
        <View
          style={[
            styles.divider,
            {position: 'absolute', bottom: wp(12), right: wp(2)},
          ]}
        />
      </View>
      <Button
        text={'Next'}
        style={styles.button}
        transparent={false}
        onPress={goNext}
      />
      <TouchableOpacity style={styles.backStyle} onPress={goBack}>
        <Text style={styles.textBack}>Back</Text>
      </TouchableOpacity>
    </View>
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
    marginTop: wp(14.1),
    marginRight: wp(6),
    marginLeft: wp(6),
  },
  textContainer: {
    marginTop: wp(1),
    marginRight: wp(6),
    marginLeft: wp(6),
  },
  titleSmall: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(4.1),
    color: '#01161E',
  },
  text: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
    fontSize: wp(3.5),
    color: config.SECONDARY_TEXT,
  },
  datePickerContainer: {
    width: wp(51),
    height: wp(36),
    alignSelf: 'center',
    marginTop: wp(12.3),
    flexDirection: 'row',
  },
  pickerText: {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(4.1),
    color: config.BLACK,
  },
  divider: {
    width: wp(51) / 3 - wp(4),
    height: 1,
    backgroundColor: config.BLACK,
  },
});

export default BirthdayScreen;
