import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import config from 'config/BasicConfig.json';


// Custom animated toggle between 2 states
export default class Toggle extends React.PureComponent<Props> {

  animatedValue = new Animated.Value(0);

  static defaultProps = {
    onColor: config.PRIMARY_COLOUR,
    offColor: '#DCDCDC',
    label: '',
    onToggle: () => { },
    style: {},
    isOn: false,
    labelStyle: {}
  }

  render() {
    const moveToggle = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [ wp(11.2) - wp(5.6), wp(0.4)],
    });

    const {
      isOn,
      onColor,
      offColor,
      style,
      onToggle,
      labelStyle,
      label
    } = this.props;

    const color = isOn ? onColor : offColor;

    this.animatedValue.setValue(isOn ? 0 : 1);

    const toggleValue = () => {
      setTimeout(onToggle, 50)
      Animated.timing(this.animatedValue, {
      toValue: isOn ? 1 : 0,
      duration: 150,
      useNativeDriver:true,
      easing: Easing.linear,
    }).start();
    }
    

    return (
      <View style={styles.container}>

        {!!label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => {

            typeof onToggle === 'function' && toggleValue();

            }}>
          <View
            style={[
              styles.toggleContainer,
              style,
              { backgroundColor: color }
            ]}>
            <Animated.View
              style={[
                styles.toggleWheelStyle, {
                  transform: [{ translateX: moveToggle }] ,
                }]}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toggleContainer: {
    width: wp(11.2),
    height: wp(6),
    borderRadius: 100,
    justifyContent: 'center',
  },
  label: {
    marginRight: 2,
  },
  toggleWheelStyle: {
    width: wp(5.2),
    height: wp(5.2),
    backgroundColor: config.WHITE,
    borderRadius: wp(5.2),
  }
})