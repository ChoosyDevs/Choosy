import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import config from 'config/BasicConfig.json';
import profilePlus from 'assets/profilePlus.png';
import LinearGradient from 'react-native-linear-gradient';

function PlusButton() {
  return (
    <LinearGradient
      colors={[config.PRIMARY_GRADIENT_COLOUR, config.PRIMARY_COLOUR]}
      style={styles.container}>
      <View style={styles.plusImageContainer}>
        <Image style={styles.image} source={profilePlus} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusImageContainer: {
    width: '93%',
    height: '93%',
    borderRadius: 100,
    backgroundColor: config.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '45%',
    height: '45%',
    resizeMode: 'cover',
  },
});

export default PlusButton;
