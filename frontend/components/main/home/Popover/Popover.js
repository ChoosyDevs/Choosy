import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {BlurView} from '@react-native-community/blur';
import tip from 'assets/tip.png';
import TickLogo from 'assets/TickLogo.png';

import FastImage from 'react-native-fast-image';
import {setPopoverVisible} from 'actions/homeActions.js';
import {useSelector, useDispatch} from 'react-redux';

const B = (props) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>;

// Animated dialogue box when the "Upload" icon is pressed (top-right)
const Popover = React.memo(
  (props) => {
    const dispatch = useDispatch();
    const level = useSelector((state) => state.user.level);
    const successVisible = useSelector((state) => state.home.successVisible);
    const {uploadBarOpen} = useSelector((state) => state.general);
    var mountAnim = useRef(new Animated.Value(0)).current;

    // Mounting Animation
    useEffect(() => {
      Animated.timing(mountAnim, {
        toValue: 1,
        useNativeDriver: false,
        duration: 300,
      }).start();
    }, []);

    // Unounting Animation
    const closeAnimation = () => {
      Animated.timing(mountAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 300,
      }).start(() => dispatch(setPopoverVisible(false)));
    };

    useEffect(() => {
      if (successVisible) {
        closeAnimation();
      }
    }, [successVisible]);

    let rightInterpolate = mountAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-wp(9.5), wp(12.9)],
    });

    let topInterpolate = mountAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0.5%', '10%'],
    });

    return (
      <TouchableWithoutFeedback onPress={closeAnimation}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.rectangle,
              {
                right: rightInterpolate,
                top: topInterpolate,
                transform: [
                  {
                    scale: mountAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.absolute}>
              <BlurView
                style={[
                  styles.absolute,
                  {
                    backgroundColor:
                      Platform.OS === 'ios'
                        ? 'rgba(140,140,140,0.7)'
                        : 'rgba(140,140,140,0.3)',
                  },
                ]}
                blurType="dark"
                blurAmount={32}
              />
            </View>
            <View style={styles.tip}>
              <FastImage source={tip} style={styles.tipImage} />
            </View>
            <View style={[styles.textContainer, StyleSheet.absoluteFill]}>
              {uploadBarOpen ? (
                <>
                  <Text style={styles.text}>Please wait until current</Text>
                  <Text style={styles.text}>upload is finished.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.text}>
                    Choose <B>{5 - (level % 5)} </B>more polls{' '}
                  </Text>
                  <Text style={styles.text}>to upload!</Text>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  },
  () => true,
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  rectangle: {
    width: wp(62),
    height: '13.8%',
    borderRadius: wp(3.3),
    position: 'absolute',
    top: '10%',
    right: wp(12.6),
  },
  tip: {
    width: wp(6),
    height: wp(5),
    position: 'absolute',
    right: wp(5.2),
    top: -wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    bottom: -wp(2),
  },
  absolute: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: wp(3.3),
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: wp(4),
    fontWeight: '400',
    color: config.WHITE,
  },
});

export default Popover;
