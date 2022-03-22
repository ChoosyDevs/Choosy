import React from 'react';
import {View, Image, TouchableHighlight, StyleSheet} from 'react-native';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import skip from 'assets/skip.png';
import {useSelector, useDispatch} from 'react-redux';
import {setIncrementNumberOfSkipsCounter} from 'actions/homeActions.js';

function SkipButton(props) {
  const currentIndex = useSelector((state) => state.home.currentIndex);
  const isReady = useSelector((state) => state.home.isReady);
  const dispatch = useDispatch();
  const skipsCounter = useSelector((state) => state.home.skipsCounter);

  // Skips the current poll and updates the skip counter
  const onPressSkip = () => {
    if (skipsCounter < 5) {
      props.onSkip(true, currentIndex);
      dispatch(setIncrementNumberOfSkipsCounter());
    } else {
      dispatch(setIncrementNumberOfSkipsCounter());
    }
  };

  return (
    <View style={[props.style, styles.container]}>
      {isReady ? (
        <TouchableHighlight
          onPress={onPressSkip}
          underlayColor={'#0000001A'}
          activeOpacity={1}
          style={styles.touchableHighlight}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Skip</Text>
            <Image source={skip} style={styles.tick} />
          </View>
        </TouchableHighlight>
      ) : (
        <TouchableHighlight
          underlayColor={'#0000001A'}
          style={styles.touchableHighlight}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Skip</Text>
            <Image source={skip} style={styles.tick} />
          </View>
        </TouchableHighlight>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(4),
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  touchableHighlight: {
    flex: 1,
    backgroundColor: '#F4F5F5',
    margin: wp(0.5),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#626F74',
    fontSize: wp(4.6),
    fontWeight: '400',
  },
  tick: {
    width: wp(4.1),
    marginLeft: wp(4),
    resizeMode: 'contain',
  },
});

export default SkipButton;
