import React from 'react';
import {View, StyleSheet} from 'react-native';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';

function PercentagePhoto(props) {
  return (
    <View style={[props.style, styles.container]}>
      <FastImage
        source={{
          uri: props.photo.uri,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.cacheOnly,
        }}
        style={[styles.fastImage, {width: props.width, height: props.height}]}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.percentageContainer}>
        <Text style={styles.percentage}>{props.uploadPercentagesIndex}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(2),
    backgroundColor: '#252525C7',
    margin: wp(2),
  },
  fastImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp(2),
  },
  percentageContainer: {
    height: wp(6),
    width: '100%',
    backgroundColor: '#00000080',
    position: 'absolute',
    bottom: 0,
    borderBottomLeftRadius: wp(2),
    borderBottomRightRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    color: 'white',
    fontSize: wp(3),
    fontWeight: '600',
  },
});

export default PercentagePhoto;
