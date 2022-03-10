import React, {useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import {
  setPostDurationMinutes,
  setPostDurationHours,
  setPostDurationDays,
} from 'actions/uploadActions.js';

// Custom Animated double slider for picking age range
const Slider = React.memo((props) => {
  const dispatch = useDispatch();
  const {snapPoints} = props;
  let scrollX = useRef(new Animated.Value(0)).current;
  let snap = useRef(new Animated.Value(0)).current;

  const onPanGestureEvent = Animated.event([{nativeEvent: {x: scrollX}}], {
    useNativeDriver: true,
  });

  //const scrollCalc =  Animated.add( scrollX, new Animated.Value(-wp(5.6) ))
  const scrollCalc = scrollX.interpolate({
    inputRange: [0, wp(82.1)],
    outputRange: [0, wp(82.1)],
    extrapolate: 'clamp',
  });

  const setValue = () => {
    // props.snapPoint[0] === 5 =>>> minutes
    // props.snapPoint[0] === 2 =>>> hours
    // props.snapPoint[0] === 1 =>>> days

    if (props.snapPoints[0] === 5)
      dispatch(setPostDurationMinutes(snapPoints[snap.__getValue()]));
    else if (props.snapPoints[0] === 2)
      dispatch(setPostDurationHours(snapPoints[snap.__getValue()]));
    else dispatch(setPostDurationDays(snapPoints[snap.__getValue()]));
    // setPostDuration(snapPoints[snap.current])
  };

  const onPanEndTransition = () => {
    Animated.timing(scrollX, {
      toValue: snap.__getValue() * (wp(82.1) / (snapPoints.length - 1)),
      useNativeDriver: true,
      duration: 100,
    }).start(() => setValue());
  };

  scrollX.addListener((value) => {
    let snapPoint = Math.round(
      value.value / (wp(82.1) / (snapPoints.length - 1)),
    );

    if (snapPoint > -1 && snapPoint < snapPoints.length) {
      // setSnap(snapPoint)
      //snap = snapPoint;
      snap.setValue(snapPoint);
    }
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={({nativeEvent}) => {
          if (nativeEvent.state === 5) onPanEndTransition();
        }}>
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
                        translateX: scrollCalc,
                      },
                    ],
                  },
                ]}
              />
            </LinearGradient>
            <Animated.View
              style={[
                styles.thumb,
                {
                  transform: [
                    {
                      translateX: scrollCalc,
                    },
                  ],
                },
              ]}
            />

            <View style={styles.snapPointLines}>
              {snapPoints.map((number, index) => (
                <View
                  key={index}
                  style={[styles.numberOrLinesListContainer, {zIndex: -1}]}>
                  <View
                    style={{
                      backgroundColor: '#F4F5F5',
                      width: wp(0.3),
                      height:
                        index === 0 || index === snapPoints.length - 1
                          ? '100%'
                          : '50%',
                      borderRadius: 10,
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.numberList}>
            {snapPoints.map((number, index) => (
              <View key={index} style={styles.numberOrLinesListContainer}>
                <Animated.Text
                  maxFontSizeMultiplier={1.1}
                  style={[
                    styles.numberText,
                    {
                      color: config.BLACK,
                      fontWeight: '400',
                      opacity: snap.interpolate({
                        inputRange: [index - 1, index, index + 1],
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}>
                  {number}
                </Animated.Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

export default Slider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F5F5',
  },
  thumb: {
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: wp(0.3),
    borderColor: '#29CCBB',
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
  numberList: {
    width: wp(87.7),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  snapPointLines: {
    width: wp(87.7),
    height: wp(5),
    zIndex: -1,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  numberOrLinesListContainer: {
    width: wp(5.6),
    height: wp(5.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: wp(3),
  },
});
