import React, {useRef, useState} from 'react';
import {Animated, Platform, StyleSheet, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import LinearGradient from 'react-native-linear-gradient';

// Custom animated double slider component for age range selection
const DoubleSlider = React.memo(
  (props) => {
    var fakeScrollAnim = useRef(new Animated.Value(0)).current;

    var scrollMin = useRef(
      new Animated.Value(
        wp(5.6 + 5.6 / 2) +
          (props.targetAgesBefore[0] - 13) * (wp(90 - 5.6 - 5.6 / 2) / 87),
      ),
    ).current;
    var [scrollMinValue, setScrollMinValue] = useState(
      wp(5.6 + 5.6 / 2) +
        (props.targetAgesBefore[0] - 13) * (wp(90 - 5.6 - 5.6 / 2) / 87),
    );

    var scrollMax = useRef(
      new Animated.Value(
        wp(5.6 + 5.6 / 2) +
          (props.targetAgesBefore[1] - 13) * (wp(90 - 5.6 - 5.6 / 2) / 87),
      ),
    ).current;
    var [scrollMaxValue, setScrollMaxValue] = useState(
      wp(5.6 + 5.6 / 2) +
        (props.targetAgesBefore[1] - 13) * (wp(90 - 5.6 - 5.6 / 2) / 87),
    );

    // Handle gesture event of left slider
    const onPanGestureEventMin = Animated.event(
      [{nativeEvent: {absoluteX: fakeScrollAnim}}],
      {
        useNativeDriver: true,
        listener: (e) => {
          if (e.nativeEvent.absoluteX < wp(5.6 + 5.6 / 2)) {
            scrollMin.setValue(wp(5.6 + 5.6 / 2));
            setScrollMinValue(wp(5.6 + 5.6 / 2));
          } else if (
            e.nativeEvent.absoluteX <
            scrollMaxValue - 6 * (wp(90 - 5.6 - 5.6 / 2) / 87)
          ) {
            scrollMin.setValue(e.nativeEvent.absoluteX);
            setScrollMinValue(e.nativeEvent.absoluteX);
          } else {
            scrollMin.setValue(
              scrollMaxValue - 6 * (wp(90 - 5.6 - 5.6 / 2) / 87),
            );
            setScrollMinValue(
              scrollMaxValue - 6 * (wp(90 - 5.6 - 5.6 / 2) / 87),
            );
          }
        },
      },
    );

    // Handle gesture event of right slider
    const onPanGestureEventMax = Animated.event(
      [{nativeEvent: {absoluteX: fakeScrollAnim}}],
      {
        useNativeDriver: true,
        listener: (e) => {
          if (e.nativeEvent.absoluteX > wp(90)) {
            scrollMax.setValue(wp(90));
            setScrollMaxValue(wp(90));
          } else if (
            e.nativeEvent.absoluteX >
            scrollMinValue + 6 * (wp(90 - 5.6 - 5.6 / 2) / 87)
          ) {
            scrollMax.setValue(e.nativeEvent.absoluteX);
            setScrollMaxValue(e.nativeEvent.absoluteX);
          } else {
            scrollMax.setValue(
              scrollMinValue + 6 * (wp(90 - 5.6 - 5.6 / 2) / 87),
            );
            setScrollMaxValue(
              scrollMinValue + 6 * (wp(90 - 5.6 - 5.6 / 2) / 87),
            );
          }
        },
      },
    );

    const scrollMinInterpolate = scrollMin.interpolate({
      inputRange: [wp(5.6 + 5.6 / 2), wp(90)],
      outputRange: [-wp(5.6 - 5.6 / 2), wp(90 - 5.6 - 5.6 / 2)],
      extrapolate: 'clamp',
    });

    const grayBarMinInterpolate = scrollMin.interpolate({
      inputRange: [wp(5.6 + 5.6 / 2), wp(90)],
      outputRange: [-wp(90 - 5.6), wp(0)],
      extrapolate: 'clamp',
    });

    const scrollMaxInterpolate = scrollMax.interpolate({
      inputRange: [wp(5.6 + 5.6 / 2), wp(90)],
      outputRange: [-wp(5.6 - 5.6 / 2), wp(90 - 5.6 - 5.6 / 2)],
      extrapolate: 'clamp',
    });

    const grayBarMaxInterpolate = scrollMax.interpolate({
      inputRange: [wp(5.6 + 5.6 / 2), wp(90)],
      outputRange: [-wp(5.6 - 5.6), wp(90 - 5.6 / 2)],
      extrapolate: 'clamp',
    });

    // Convert slider positon to age number
    const numFromPosition = (position) => {
      if (position <= wp(5.6 + 5.6 / 2)) return 13;
      if (position >= wp(90)) return 100;
      const calcAnswer = Math.round(
        13 + ((position - wp(5.6 + 5.6 / 2)) / wp(90 - 5.6 - 5.6 / 2)) * 87,
      );
      // if(calcAnswer === 100) return '100+'
      return calcAnswer;
    };

    // save age range
    const handleEndOfGesture = ({nativeEvent}) => {
      if (nativeEvent.state === 5) {
        props.onChange([
          numFromPosition(scrollMinValue),
          numFromPosition(scrollMaxValue) < 100
            ? numFromPosition(scrollMaxValue)
            : 10000,
        ]);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.numbersContainer}>
          <Text style={styles.numberText}>
            {numFromPosition(scrollMinValue) !== 100
              ? numFromPosition(scrollMinValue)
              : '100+'}
          </Text>
          <Text style={styles.numberText}> - </Text>
          <Text style={styles.numberText}>
            {numFromPosition(scrollMaxValue) !== 100
              ? numFromPosition(scrollMaxValue)
              : '100+'}
          </Text>
        </View>

        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
          }}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <LinearGradient
              useAngle={true}
              colors={[config.PRIMARY_COLOUR, config.PRIMARY_GRADIENT_COLOUR]}
              style={[styles.gradient]}>
              <Animated.View
                style={[
                  styles.grayBar,
                  {
                    transform: [
                      {
                        translateX: grayBarMinInterpolate,
                      },
                    ],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.grayBar,
                  {
                    transform: [
                      {
                        translateX: grayBarMaxInterpolate,
                      },
                    ],
                  },
                ]}
              />
            </LinearGradient>

            <PanGestureHandler
              onGestureEvent={onPanGestureEventMin}
              onHandlerStateChange={handleEndOfGesture}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: wp(11.2),
                    height: wp(11.2),
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  {
                    transform: [
                      {
                        translateX: scrollMinInterpolate,
                      },
                    ],
                  },
                ]}>
                <View style={styles.thumb} />
              </Animated.View>
            </PanGestureHandler>
            <PanGestureHandler
              onGestureEvent={onPanGestureEventMax}
              onHandlerStateChange={handleEndOfGesture}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: wp(11.2),
                    height: wp(11.2),
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  {
                    transform: [
                      {
                        translateX: scrollMaxInterpolate,
                      },
                    ],
                  },
                ]}>
                <View style={styles.thumb} />
              </Animated.View>
            </PanGestureHandler>
          </View>
        </Animated.View>
      </View>
    );
  },
  () => true,
);

export default DoubleSlider;

const styles = StyleSheet.create({
  container: {
    width: wp(90),
    height: wp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  gradient: {
    width: wp(87.7),
    height: wp(1),
    borderRadius: 100,
    position: 'absolute',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  grayBar: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F5F5',
  },
  thumb: {
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: wp(0.3),
    borderColor: config.PRIMARY_COLOUR,
    height: wp(5.6),
    width: wp(5.6),
    zIndex: 1,
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  numberText: {
    fontSize: wp(3.8),
    fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
    color: config.BLACK,
  },
  numbersContainer: {
    //backgroundColor:'green',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: wp(1),
    padding: wp(1.5),
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
  },
});
