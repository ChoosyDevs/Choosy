import React from 'react';
import {View, StyleSheet} from 'react-native';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import tick from 'assets/tick.png';
import FastImage from 'react-native-fast-image';

function Tick(props) {
  return (
    <View style={[styles.container, props.style]}>
      <LinearGradient
        colors={[config.PRIMARY_GRADIENT_COLOUR, config.PRIMARY_COLOUR]}
        style={[styles.linearGradient]}>
        <View style={styles.touchableOpacity}>
          <View style={styles.buttonContent}>
            <FastImage
              source={tick}
              style={styles.tick}
              resizeMode={'contain'}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(1),
  },
  linearGradient: {
    flex: 1,
    borderRadius: wp(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  touchableOpacity: {
    width: '90%',
    height: '90%',
    backgroundColor: config.BLACK,
    borderRadius: wp(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
});

export default Tick;
