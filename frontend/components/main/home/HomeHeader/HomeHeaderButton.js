import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  request,
  PERMISSIONS,
  openSettings,
  check,
  RESULTS,
} from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {setPopoverVisible} from 'actions/homeActions.js';
import Shape from 'assets/Shape.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import config from 'config/BasicConfig.json';

function HomeHeaderButton(props) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const uploadBarOpen = useSelector((state) => state.general.uploadBarOpen);
  const numberOfAvailablePhotos = useSelector(
    (state) => state.home.uploadsArray.length,
  );
  const level = useSelector((state) => state.user.level);
  const publications = useSelector((state) => state.user.publications);

  // Function that checks if permissions are provided and acts accordingly
  const checkPermissionsFunction = () => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ).then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          Alert.alert(
            Platform.OS === 'ios'
              ? 'This feature is not available on this device.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'This feature is not available on this device.',
            [{text: 'OK'}],
            {cancelable: false},
          );
          break;
        case RESULTS.DENIED:
          request(
            Platform.OS === 'ios'
              ? PERMISSIONS.IOS.PHOTO_LIBRARY
              : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          ).then((result) => {
            if (result === 'granted' || result === 'limited') {
              navigation.navigate('Upload', {screen: 'PostDurationScreen'});
            } else if (result === 'blocked') {
              Alert.alert(
                'Enable photo library access',
                'Enable access to all photos so you can upload polls with them.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {text: 'OK', onPress: () => openSettings()},
                ],
                {cancelable: false},
              );
            } else {
            }
          });
          break;
        case RESULTS.LIMITED:
          navigation.navigate('Upload', {screen: 'PostDurationScreen'});
          setTimeout(() => {
            Alert.alert(
              'Enable access to all photos',
              'Enable access to all photos so you can upload polls with them.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => openSettings()},
              ],
              {cancelable: false},
            );
          }, 500);

          break;
        case RESULTS.GRANTED:
          navigation.navigate('Upload', {screen: 'PostDurationScreen'});
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Enable photo library access',
            'Enable access to all photos so you can upload polls with them.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {text: 'OK', onPress: () => openSettings()},
            ],
            {cancelable: false},
          );
          break;
      }
    });
  };

  //onPress it will either navigate to Profile (borderRadius = 0) or Upload
  const onPress = () => {
    props.imageRadius === 0
      ? uploadNavigate()
      : navigation.navigate('ProfileScreen');
  };

  const uploadNavigate = () => {
    if (
      uploadBarOpen ||
      (Math.floor(level / 5) - publications <= 0 && numberOfAvailablePhotos > 0)
    )
      dispatch(setPopoverVisible(true));
    else checkPermissionsFunction();
  };

  const thumbImage = props.image === '' ? Shape : {uri: props.image};

  return props.imageRadius !== 0 && props.image === '' ? (
    <TouchableOpacity
      style={[styles.container, props.style]}
      onPress={onPress}
      activeOpacity={0.5}>
      <View style={styles.placeholderContainer}>
        <FastImage
          key={thumbImage}
          source={thumbImage}
          style={[styles.image, styles.placeholderImage]}
        />
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={[styles.container, props.style]}
      onPress={onPress}
      activeOpacity={0.5}>
      {props.imageRadius == 0 &&
      (Math.floor(level / 5) - publications > 0 ||
        numberOfAvailablePhotos <= 0) ? (
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
        </View>
      ) : null}
      <FastImage
        key={props.image}
        source={props.imageRadius === 0 ? props.image : thumbImage}
        style={[
          styles.image,
          {
            borderRadius: props.imageRadius,
            backgroundColor:
              props.imageRadius === 0 ? 'transparent' : '#29CCBB1A',
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderContainer: {
    width: '105%',
    height: '105%',
    backgroundColor: '#29CCBB1A',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    borderRadius: 100,
    width: '60%',
    height: '80%',
    resizeMode: 'contain',
  },
  dotContainer: {
    zIndex: 1,
    position: 'absolute',
    top: '30%',
    right: '30%',
    width: wp(3.2),
    height: wp(3.2),
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    backgroundColor: config.PRIMARY_COLOUR,
  },
});

export default HomeHeaderButton;
