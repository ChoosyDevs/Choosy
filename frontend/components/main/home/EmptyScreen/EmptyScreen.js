import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import emptyScreenImage from 'assets/emptyScreen.png';
import FastImage from 'react-native-fast-image';
import {setUploadIdFromLink} from 'actions/generalActions.js';
import {useSelector} from 'react-redux';

const EmptyScreen = React.memo((props) => {
  const uploadIdFromLink = useSelector(
    (state) => state.general.uploadIdFromLink,
  );

  // Refresh empty screen (clear uploadIdFromLink)
  const refreshPressed = () => {
    if (uploadIdFromLink != '') dispatch(setUploadIdFromLink(''));
    else props.onUploadChange();
  };

  return (
    <View style={styles.container}>
      <View style={styles.emptyImageContainer}>
        <FastImage source={emptyScreenImage} style={styles.emptyImage} />
      </View>
      <Text style={styles.text}>You have seen every poll!</Text>
      <Text style={styles.textSub}>
        Come again later to help more users decide what their next social media
        upload should be.
      </Text>
      <TouchableOpacity onPress={refreshPressed} activeOpacity={0.4}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 9.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImageContainer: {
    width: wp(36.4),
    height: wp(36.4),
    backgroundColor: 'gray',
  },
  emptyImage: {
    width: '100%',
    height: '100%',
  },
  text: {
    marginTop: wp(6.4),
    fontWeight: 'bold',
    marginHorizontal: wp(10),
    textAlign: 'center',
    fontSize: wp(4),
    color: '#626F74',
  },
  textSub: {
    marginTop: wp(5),
    fontWeight: '400',
    marginHorizontal: wp(10),
    textAlign: 'center',
    fontSize: wp(4),
    color: '#626F74',
  },
  refreshText: {
    marginTop: wp(5),
    fontWeight: 'bold',
    marginHorizontal: wp(10),
    textAlign: 'center',
    fontSize: wp(4.4),
    color: '#0091FF',
  },
});

export default EmptyScreen;
