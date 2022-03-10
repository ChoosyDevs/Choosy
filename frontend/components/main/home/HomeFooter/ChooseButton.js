import React from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import TickLogo from 'assets/TickLogo.png';
import {useSelector, useDispatch} from 'react-redux';
import {setVoting} from 'actions/homeActions.js';
import {setSeenAll} from 'actions/homeActions.js';
import FastImage from 'react-native-fast-image';

function ChooseButton(props) {
  const currentIndex = useSelector((state) => state.home.currentIndex);
  const isReady = useSelector((state) => state.home.isReady);
  const uploadsArray = useSelector((state) => state.home.uploadsArray);

  const dispatch = useDispatch();

  // Function that sends vote or shows the "See all photos" indicator
  const onPressChoose = () => {
    if (
      props.photoIndex.current ===
        uploadsArray[currentIndex].photos.length - 1 ||
      props.seenAllPhotos.current === true
    ) {
      dispatch(setVoting(true));
      props.onVote(true, currentIndex, props.photoIndex.current);
    } else {
      dispatch(setSeenAll(true));
    }
  };

  return (
    <View style={[props.style, styles.container]}>
      {isReady ? (
        <LinearGradient
          colors={[config.PRIMARY_GRADIENT_COLOUR, config.PRIMARY_COLOUR]}
          style={[styles.linearGradient]}>
          <TouchableOpacity
            onPress={onPressChoose}
            activeOpacity={0.9}
            style={styles.touchableOpacity}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Choose</Text>
              <FastImage
                source={TickLogo}
                style={styles.tick}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={[config.PRIMARY_GRADIENT_COLOUR, config.PRIMARY_COLOUR]}
          style={[styles.linearGradient]}>
          <View style={styles.touchableOpacity}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Choose</Text>
              <FastImage
                source={TickLogo}
                style={styles.tick}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(4),
    shadowColor: '#008173',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 8,
    //shadowRadius: 2.62,
    elevation: 4,
  },
  linearGradient: {
    flex: 1,
    borderRadius: wp(4),
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  touchableOpacity: {
    flex: 1,
    backgroundColor: config.BLACK,
    margin: wp(0.5),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: config.PRIMARY_COLOUR,
    fontSize: wp(4.6),
    fontWeight: '600',
  },
  tick: {
    width: wp(4.5),
    height: '100%',
    marginLeft: wp(4),
    resizeMode: 'contain',
  },
});

export default ChooseButton;
