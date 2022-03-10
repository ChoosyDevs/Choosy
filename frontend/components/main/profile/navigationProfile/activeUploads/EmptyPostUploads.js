import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {
  request,
  PERMISSIONS,
  openSettings,
  check,
  RESULTS,
} from 'react-native-permissions';
import {useSelector} from 'react-redux';

const EmptyPostUploads = React.memo((props) => {
  const navigation = useNavigation();
  const numberOfAvailablePhotos = useSelector(
    (state) => state.home.uploadsArray.length,
  );
  const level = useSelector((state) => state.user.level);
  const publications = useSelector((state) => state.user.publications);
  const uploadLoading = useSelector((state) => state.general.uploadLoading);

  // Checks if permissions are grunted
  const checkPermissionsFunctionActive = () => {
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

  const B = (props) => (
    <Text style={{fontWeight: 'bold'}}>{props.children}</Text>
  );

  return (
    <View style={styles.container}>
      {Math.floor(level / 5) - publications <= 0 &&
      numberOfAvailablePhotos > 0 ? (
        <View>
          <Text style={styles.text}>
            Choose <B>{5 - (level % 5)} </B>more polls
          </Text>
          <Text style={styles.text}>to upload!</Text>
        </View>
      ) : (
        <View style={styles.viewStyle}>
          <View>
            <Text style={styles.textStyle}>
              You don't have any uncompleted photo polls!
            </Text>
            <Text style={styles.textStyleSub}>
              All the polls you upload that are still available for users to
              choose will appear here.
            </Text>
          </View>
          {uploadLoading ? (
            <View>
              <Text style={styles.AddNewStyleBlur}>Add new</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={checkPermissionsFunctionActive}
              activeOpacity={0.4}>
              <Text style={styles.AddNewStyle}>Add new</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: wp(3.8),
    color: config.SECONDARY_TEXT,
    marginHorizontal: wp(6),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textStyleSub: {
    fontSize: wp(3.8),
    marginTop: wp(2),
    color: config.SECONDARY_TEXT,
    marginHorizontal: wp(8),
    textAlign: 'center',
  },
  AddNewStyle: {
    fontSize: wp(4.1),
    color: config.BLUE,
    fontWeight: 'bold',
    marginTop: hp(3.79),
  },
  AddNewStyleBlur: {
    fontSize: wp(4.1),
    color: '#0091FF80',
    fontWeight: 'bold',
    marginTop: hp(3.79),
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: wp(4),
    fontWeight: '400',
    color: config.SECONDARY_TEXT,
  },
  viewStyle: {
    alignItems: 'center',
  },
});

export default EmptyPostUploads;
