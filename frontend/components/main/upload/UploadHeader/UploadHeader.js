import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import profileBack from 'assets/profileBack.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setModalVisible, setScreenName} from 'actions/uploadActions.js';
import FastImage from 'react-native-fast-image';

const UploadHeader = React.memo((props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const photos = useSelector((state) => state.upload.photos);
  const postDuration = useSelector((state) => state.upload.postDuration);
  const targetSocialMedia = useSelector(
    (state) => state.upload.targetSocialMedia,
  );
  const preferToggle = useSelector((state) => state.upload.preferToggle);
  const deleteNumber = useSelector(
    (state) => state.upload.arrayOfDeletedPhotos.length,
  );
  const screenName = useSelector((state) => state.upload.screenName);

  const deleteImages = () => {
    props.deleteImagesFunction();
  };

  // Functon that handles what the "Next" (top right corner) does based on the current screen
  const navigationHeaderNext = () => {
    if (screenName === 'TargetSocialMediaScreen') {
      if (photos.length < 2) {
        Alert.alert(
          Platform.OS === 'ios'
            ? 'You need at least 2 photos to create a poll.'
            : '',
          Platform.OS === 'ios'
            ? ''
            : 'You need at least 2 photos to create a poll.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      } else {
        props.uploadImages(true);
      }
    } else {
      navigation.navigate('TargetSocialMediaScreen');
      dispatch(setScreenName('TargetSocialMediaScreen'));
    }
  };

  const navigationHeaderBack = () => {
    if (screenName === 'TargetSocialMediaScreen') {
      navigation.navigate('PostDurationScreen');
      dispatch(setScreenName('PostDurationScreen'));
    } else {
      dispatch(setModalVisible(true));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileBackView}
        onPress={navigationHeaderBack}
        activeOpacity={0.5}>
        <FastImage
          source={profileBack}
          style={styles.imageProfileBack}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
      <View style={styles.newPostView}>
        <Text style={styles.textNewPost}>New poll</Text>
      </View>
      {deleteNumber === 0 ? (
        screenName === 'TargetSocialMediaScreen' ? (
          targetSocialMedia.length === 0 && !preferToggle ? (
            <View style={styles.rightActionsStyle}>
              <Text style={styles.textRightActionsBlur}>Share</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.rightActionsStyle}
              onPress={navigationHeaderNext}
              activeOpacity={0.5}>
              <Text style={styles.textRightActions}>Share</Text>
            </TouchableOpacity>
          )
        ) : screenName === 'PostDurationScreen' &&
          postDuration.minutes === 0 &&
          postDuration.hours === 0 &&
          postDuration.days === 0 ? (
          <View style={styles.rightActionsStyle}>
            <Text style={styles.textRightActionsBlur}>Next</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rightActionsStyle}
            onPress={navigationHeaderNext}
            activeOpacity={0.5}>
            <Text style={styles.textRightActions}>Next</Text>
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity
          style={styles.rightActionsStyle}
          onPress={deleteImages}
          activeOpacity={0.5}>
          <Text style={styles.textRightActions}>Delete ({deleteNumber})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 2.2,
    marginHorizontal: wp(6.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBackView: {
    position: 'absolute',
    width: 4 * wp(2.6),
    height: 3 * hp(1.8),
    justifyContent: 'center',
    alignItems: 'center',
    left: -1.5 * wp(2.6),
  },
  imageProfileBack: {
    width: '25%',
    height: '50%',
    resizeMode: 'contain',
  },
  newPostView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNewPost: {
    color: config.BLACK,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: wp(5.6),
  },
  rightActionsStyle: {
    paddingHorizontal: wp(6.15),
    height: 16 * hp(0.47),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -wp(6),
  },
  textRightActions: {
    color: '#0091FF',
    fontSize: wp(4.1),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
  textRightActionsBlur: {
    color: '#0091FF80',
    fontSize: wp(4.1),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
});

export default UploadHeader;
