import React from 'react';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import config from 'config/BasicConfig.json';
import LinearGradient from 'react-native-linear-gradient';

const Button = (props) => {
  return (
    <LinearGradient
      colors={[config.PRIMARY_GRADIENT_COLOUR, config.PRIMARY_COLOUR]}
      style={[props.style, styles.container]}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.innerButton}
        onPress={props.onPress}>
        {props.text === 'Indicator' ? (
          <ActivityIndicator color={config.PRIMARY_COLOUR} size="small" />
        ) : (
          <Text style={styles.text}>{props.text}</Text>
        )}
      </TouchableOpacity>
      <View
        pointerEvents={props.transparent ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: config.WHITE,
            opacity: props.transparent ? 0.35 : 0,
            borderRadius: wp(3.5),
          },
        ]}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(88),
    height: wp(12),
    padding: wp(0.5),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3.5),
    shadowColor: '#008173',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 8,
    //shadowRadius: 2.62,
    elevation: 6,
  },
  innerButton: {
    width: '100%',
    height: '100%',
    borderRadius: wp(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.BLACK,
  },
  text: {
    color: config.PRIMARY_COLOUR,
    fontSize: wp(4),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
});

export default Button;
