import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import more from 'assets/more.png';
import verified from 'assets/verified.png';
import Shape from 'assets/Shape.png';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';

function HomeBodyHeader(props) {
  const uploadsArray = useSelector((state) => state.home.uploadsArray);
  const currentIndex = useSelector((state) => state.home.currentIndex);
  const {openMoreModal} = props;

  // Format the time this post has been posted
  let duration = (t1) => {
    let d = new Date() - new Date(t1);
    let days = Math.floor(d / 1000 / 60 / 60 / 24);
    let hours = Math.floor(d / 1000 / 60 / 60 - days * 24);
    let minutes = Math.floor(d / 1000 / 60 - days * 24 * 60 - hours * 60);

    if (
      (minutes === 0 && hours === 0 && days === 0) ||
      days < 0 ||
      minutes < 0 ||
      hours < 0
    ) {
      return 1 + ' minute ago';
    } else if (minutes > 0 && hours === 0 && days === 0) {
      return minutes + ' minutes ago';
    } else if (hours === 1 && days === 0) {
      return 1 + ' hour ago';
    } else if (hours > 1 && days === 0) {
      return hours + ' hours ago';
    } else if (days === 1) {
      return 1 + ' day ago';
    } else if (days > 1 && days < 7) {
      return days + ' days ago';
    } else {
      return 1 + ' week ago';
    }
  };

  return (
    <View style={styles.container}>
      {uploadsArray[currentIndex].ownerThumbnail === '' ? (
        <View style={styles.profileImageContainer}>
          <FastImage
            source={Shape}
            key={Shape}
            style={styles.profileImageEmpty}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      ) : (
        <View style={styles.profileImageContainer}>
          <FastImage
            source={{
              uri: uploadsArray[currentIndex].ownerThumbnail,
              priority: FastImage.priority.normal,
            }}
            key={uploadsArray[currentIndex].ownerThumbnail}
            style={styles.profileImage}
          />
        </View>
      )}
      <View style={styles.nameTimeContainer}>
        <Text oneLine={true} style={styles.name}>
          {uploadsArray[currentIndex].ownerName}
        </Text>
        <Text style={styles.time}>
          {duration(uploadsArray[currentIndex].createdAt)}
        </Text>
      </View>
      {uploadsArray[currentIndex].ownerVerified ? (
        <View style={styles.verified}>
          <FastImage
            source={verified}
            key={verified}
            style={{width: '80%', aspectRatio: 1}}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      ) : null}

      <TouchableOpacity
        onPress={openMoreModal}
        style={styles.more}
        activeOpacity={0.5}>
        <Image source={more} style={styles.moreImage} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.7,
    marginHorizontal: wp(6),
    flexDirection: 'row',
    zIndex: 1,
  },
  containerModal: {
    width: wp(69.2),
    height: wp(50),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
  },

  profileImageContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29CCBB1A',
    alignSelf: 'flex-end',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    borderRadius: 100,
  },
  profileImageEmpty: {
    width: '60%',
    height: '80%',
    borderRadius: 100,
  },
  nameTimeContainer: {
    maxWidth: wp(50),
    left: wp(2),
    alignSelf: 'flex-end',
    textAlign: 'left',
  },
  verified: {
    left: wp(3),
    textAlign: 'left',
    width: wp(6),
    height: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  name: {
    color: config.BLACK,
    fontWeight: '600',
    fontSize: wp(3.5),
  },
  time: {
    color: '#696D7D',
    fontWeight: '400',
    fontSize: wp(2.8),
  },
  more: {
    width: 3 * wp(4),
    height: 4 * wp(2),
    position: 'absolute',
    right: -wp(4),
    bottom: '6.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImage: {
    width: '33.3333%',
    height: '25%',
    resizeMode: 'contain',
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2Touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2Delete: {
    fontSize: wp(4.35),
    color: '#007AFF',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  modal2DontDelete: {
    fontSize: wp(4.35),
    color: '#007AFF',
  },
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2SubView: {
    flex: 1,
  },
  modal2View1: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2DeletePost: {
    color: config.BLACK,
    fontSize: wp(4.35),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  modal2Text: {
    textAlign: 'center',
    marginHorizontal: wp(5.92),
    fontSize: wp(3.33),
    marginTop: '1.7%',
  },
  viewKap: {
    flex: 2,
  },
  instaButton: {
    left: wp(4),
    textAlign: 'left',
    width: wp(8),
    height: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});

export default HomeBodyHeader;
