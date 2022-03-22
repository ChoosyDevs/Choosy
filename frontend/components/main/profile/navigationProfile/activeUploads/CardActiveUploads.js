import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Alert,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import clockProfile from 'assets/clockProfile.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import more from 'assets/more.png';
import share from 'assets/share.png';
import shareIOS from 'assets/shareIOS.png';
import Analytics from 'analytics/Analytics.js';
import {useDispatch, useSelector} from 'react-redux';
import {
  setIndexOfPressActiveUploads,
  setActiveMorePressed,
  setActiveMoreIndex,
  setActivePressedPhoto,
  setShareModal,
  setPollLink,
} from 'actions/profileActions.js';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import Modal from 'react-native-modal';
import dynamicLinks from '@react-native-firebase/dynamic-links';

const CardActiveUploads = (props) => {
  const dispatch = useDispatch();

  let shareModal = useSelector((state) => state.profile.shareModal);
  let pollLink = useSelector((state) => state.profile.pollLink);

  const functionMore = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setActiveMorePressed(true));
  };

  // Different Functions for when each photo is tapped
  const firstPhotoPressed = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setIndexOfPressActiveUploads(1));
    dispatch(setActivePressedPhoto(true));
  };

  const secondPhotoPressed = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setIndexOfPressActiveUploads(2));
    dispatch(setActivePressedPhoto(true));
  };

  const thirdPhotoPressed = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setIndexOfPressActiveUploads(3));
    dispatch(setActivePressedPhoto(true));
  };

  const fourthPhotoPressed = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setIndexOfPressActiveUploads(4));
    dispatch(setActivePressedPhoto(true));
  };

  const fifthPhotoPressed = () => {
    dispatch(setActiveMoreIndex(props.index));
    dispatch(setIndexOfPressActiveUploads(5));
    dispatch(setActivePressedPhoto(true));
  };

  const openShareModal = async () => {
    dispatch(setShareModal(true));
    Analytics.onShareLink();

    let link = await dynamicLinks().buildShortLink(
      {
        link:
          'https://apps.apple.com/us/app/choosy-create-photo-polls/id1558143012' +
          '?' +
          props.item._id.toString(),
        android: {
          packageName: 'com.choosy.choosephotos',
          // minimumVersion: '18',
          fallbackUrl:
            'https://play.google.com/store/apps/details?id=com.choosy.choosephotos',
        },
        ios: {
          bundleId: 'com.choosy.choosephotos',
          appStoreId: '1558143012',
          // minimumVersion: '18',
        },
        // domainUriPrefix is created in your Firebase console
        domainUriPrefix: 'https://choosy-linking.xyz/link',
        social: {
          title: 'Choosy App',
          imageUrl:
            'https://storage.googleapis.com/choosy-storage/GooglePlayGraphic.png',
        },
      },
      dynamicLinks.ShortLinkType.SHORT,
    );

    // var link = "https://choosy-linking.xyz/link/?link=https://apps.apple.com/us/app/choosy-create-photo-polls/id1558143012&apn=com.choosy.choosephotos&ibi=com.choosy.choosephotos&isi=1558143012"
    dispatch(setPollLink(link));
  };

  const closeShareModal = () => {
    dispatch(setShareModal(false));
  };

  // When Share is pressed
  const onShare = async () => {
    if (pollLink) {
      closeShareModal();
      setTimeout(async () => {
        try {
          const result = await Share.share({
            message: Platform.OS === 'ios' ? null : pollLink,
            url: Platform.OS === 'ios' ? pollLink : null,
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          Alert.alert(
            Platform.OS === 'ios'
              ? 'Please wait a few seconds for link to be set up.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'Please wait a few seconds for link to be set up.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
        dispatch(setPollLink(''));
      }, 350);
    } else {
      Alert.alert(
        Platform.OS === 'ios'
          ? 'Please wait a few seconds for link to be set up.'
          : '',
        Platform.OS === 'ios'
          ? ''
          : 'Please wait a few seconds for link to be set up.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  };

  // Function when copy to clipboard is pressed
  const copyToClipboard = () => {
    if (pollLink) {
      Clipboard.setString(pollLink);
      closeShareModal();
      setTimeout(() => {
        Alert.alert(
          Platform.OS === 'ios' ? 'Link copied to clipboard.' : '',
          Platform.OS === 'ios' ? '' : 'Link copied to clipboard.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }, 300);
    } else {
      Alert.alert(
        Platform.OS === 'ios'
          ? 'Please wait a few seconds for link to be set up.'
          : '',
        Platform.OS === 'ios'
          ? ''
          : 'Please wait a few seconds for link to be set up.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  };

  if (
    props.timeSpec[0] === '' &&
    props.timeSpec[1] === 'Moments left' &&
    props.timeSpec[2] === '' &&
    props.timeSpec[3] === '' &&
    props.timeSpec[4] === ''
  ) {
    return <View>{props.onChangeActiveMode(props.item._id)}</View>;
  } else {
    return (
      <View
        style={{
          flex: 1,
          height:
            props.item.photos.length === 2 || props.item.photos.length === 5
              ? wp(96.4) / 2 + wp(5)
              : props.item.photos.length === 3
              ? wp(96.4) / 3 + wp(5)
              : wp(96.4) / 4 + wp(5),
          marginVertical: wp(1),
          marginHorizontal: wp(2.3),
          marginTop: '5%',
        }}>
        <View style={styles.viewTimeMore}>
          <View style={styles.viewClockTime}>
            <FastImage
              source={clockProfile}
              style={styles.imageClockProfile}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.textTimeLeft}>{props.timeSpec}</Text>
          </View>
          <TouchableOpacity
            style={[styles.viewMore, {right: wp(10)}]}
            onPress={openShareModal}
            activeOpacity={0.9}>
            <FastImage
              source={Platform.OS === 'ios' ? shareIOS : share}
              style={[
                styles.imageShare,
                Platform.OS === 'ios' ? {width: '36%', height: '70%'} : {},
              ]}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewMore}
            onPress={functionMore}
            activeOpacity={0.9}>
            <FastImage
              source={more}
              style={styles.imageMore}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>
        {props.item.photos.length === 2 ? (
          <View style={styles.viewPhotos}>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={firstPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                source={{uri: props.item.photos[0].uri}}
                style={styles.imageTwoPhotos}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[0].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={secondPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.imageTwoPhotos2}
                source={{uri: props.item.photos[1].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[1].votes}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : props.item.photos.length === 3 ? (
          <View style={styles.photosThree}>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={firstPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                source={{uri: props.item.photos[0].uri}}
                style={styles.image0Photos3}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[0].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={secondPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.flex1Style}
                source={{uri: props.item.photos[1].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[1].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={thirdPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.imageViewDown3Photos}
                source={{uri: props.item.photos[2].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[2].votes}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : props.item.photos.length === 4 ? (
          <View style={styles.photos4View}>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={firstPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                source={{uri: props.item.photos[0].uri}}
                style={styles.imageViewDown4}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[0].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={secondPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.flex1Style}
                source={{uri: props.item.photos[1].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[1].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={thirdPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.flex1Style}
                source={{uri: props.item.photos[2].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[2].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={fourthPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                style={styles.sub4Style}
                source={{uri: props.item.photos[3].uri}}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[3].votes}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : props.item.photos.length === 5 ? (
          <View style={styles.viewPhotos}>
            <TouchableOpacity
              style={styles.flex1Style}
              onPress={firstPhotoPressed}
              activeOpacity={0.9}>
              <FastImage
                source={{uri: props.item.photos[0].uri}}
                style={styles.image5Photos}
              />
              <View style={styles.numberBottomLeft}>
                <Text
                  allowFontScaling={false}
                  style={styles.textNumberBottomLeft}>
                  {props.item.photos[0].votes}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.fivePhotosFirstView}>
              <View style={styles.flex1Style}>
                <TouchableOpacity
                  style={styles.flex1Style}
                  onPress={secondPhotoPressed}
                  activeOpacity={0.9}>
                  <FastImage
                    style={styles.flex1Style}
                    source={{uri: props.item.photos[1].uri}}
                  />
                  <View style={styles.numberBottomLeft}>
                    <Text
                      allowFontScaling={false}
                      style={styles.textNumberBottomLeft}>
                      {props.item.photos[1].votes}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.flex1Style}
                  onPress={thirdPhotoPressed}
                  activeOpacity={0.9}>
                  <FastImage
                    style={styles.flex1Style}
                    source={{uri: props.item.photos[2].uri}}
                  />
                  <View style={styles.numberBottomLeft}>
                    <Text
                      allowFontScaling={false}
                      style={styles.textNumberBottomLeft}>
                      {props.item.photos[2].votes}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.flex1Style}>
                <TouchableOpacity
                  style={styles.flex1Style}
                  onPress={fourthPhotoPressed}
                  activeOpacity={0.9}>
                  <FastImage
                    style={styles.subImage}
                    source={{uri: props.item.photos[3].uri}}
                  />
                  <View style={styles.numberBottomLeft}>
                    <Text
                      allowFontScaling={false}
                      style={styles.textNumberBottomLeft}>
                      {props.item.photos[3].votes}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.flex1Style}
                  onPress={fifthPhotoPressed}
                  activeOpacity={0.9}>
                  <FastImage
                    style={styles.imageSub5}
                    source={{uri: props.item.photos[4].uri}}
                  />
                  <View style={styles.numberBottomLeft}>
                    <Text
                      allowFontScaling={false}
                      style={styles.textNumberBottomLeft}>
                      {props.item.photos[4].votes}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
        <Modal
          isVisible={shareModal}
          style={styles.modalStyle}
          backdropOpacity={0.5}
          onBackButtonPress={closeShareModal}
          onBackdropPress={closeShareModal}
          animationIn={'zoomIn'}
          animationOut={'zoomOut'}
          animationInTiming={200}
          animationOutTiming={200}
          backdropTransitionOutTiming={0}
          useNativeDriverForBackdrop={true}
          onSwipeComplete={closeShareModal}>
          <View style={styles.containerModal}>
            <View style={styles.modal2SubView}>
              <View style={styles.modal2View1}>
                <Text style={styles.modal2DeletePost}>Share poll?</Text>
                <Text style={styles.modal2Text}>
                  Send this poll to your friends so they can help you decide.
                </Text>
              </View>
              <View style={styles.modal2Line} />
              <View style={styles.viewKap}>
                <TouchableOpacity
                  onPress={onShare}
                  style={styles.modal2Touchable}
                  activeOpacity={0.5}>
                  <Text style={styles.modal2Delete}>Share poll</Text>
                </TouchableOpacity>
                <View style={styles.modal2Line} />
                <TouchableOpacity
                  onPress={copyToClipboard}
                  style={styles.modal2Touchable}
                  activeOpacity={0.5}>
                  <Text style={styles.modal2DontDelete}>Copy link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  viewTimeMore: {
    height: wp(3),
    flexDirection: 'row',
    marginBottom: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewClockTime: {
    flexDirection: 'row',
    position: 'absolute',
    left: wp(3.2),
    alignItems: 'center',
  },
  imageClockProfile: {
    width: wp(3),
    height: wp(3),
  },
  textTimeLeft: {
    fontSize: wp(2.8),
    fontWeight: '400',
    color: config.SECONDARY_TEXT,
    marginLeft: wp(1.2),
  },
  viewMore: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(12),
    height: wp(10),
  },
  imageMore: {
    width: '33.3%',
    height: 4.5,
    resizeMode: 'contain',
  },
  viewPhotos: {
    flexDirection: 'row',
    flex: 94.4,
  },
  numberBottomLeft: {
    height: wp(4.1),
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFFE6',
    zIndex: 1,
    padding: wp(0.8),
    position: 'absolute',
    borderRadius: wp(1),
  },
  textNumberBottomLeft: {
    color: '#01161E',
    fontSize: wp(2.5),
    fontWeight: '500',
  },
  fivePhotosFirstView: {
    flex: 1,
    flexDirection: 'row',
  },
  imageTwoPhotos: {
    flex: 1,
    borderBottomLeftRadius: wp(4.6),
    borderTopLeftRadius: wp(4.6),
  },
  imageTwoPhotos2: {
    flex: 1,
    borderTopRightRadius: wp(4.6),
    borderBottomRightRadius: wp(4.6),
  },
  photosThree: {
    flexDirection: 'row',
    flex: 64.1,
  },
  image0Photos3: {
    flex: 1,
    borderBottomLeftRadius: wp(4.6),
    borderTopLeftRadius: wp(4.6),
  },
  imageViewDown3Photos: {
    flex: 1,
    borderBottomRightRadius: wp(4.6),
    borderTopRightRadius: wp(4.6),
  },
  photos4View: {
    flexDirection: 'row',
    flex: 48.2,
  },
  imageViewDown4: {
    flex: 1,
    borderBottomLeftRadius: wp(4.6),
    borderTopLeftRadius: wp(4.6),
  },
  flex1Style: {
    flex: 1,
  },
  image5Photos: {
    flex: 1,
    borderBottomLeftRadius: wp(4.6),
    borderTopLeftRadius: wp(4.6),
  },
  subImage: {
    flex: 1,
    borderTopRightRadius: wp(4.6),
  },
  imageSub5: {
    flex: 1,
    borderBottomRightRadius: wp(4.6),
  },
  sub4Style: {
    flex: 1,
    borderTopRightRadius: wp(4.6),
    borderBottomRightRadius: wp(4.6),
  },
  imageShare: {
    resizeMode: 'contain',
    width: '25%',
    height: '50%',
  },
  containerModal: {
    width: wp(69.2),
    height: '25.7%',
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
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
    fontSize: wp(4.55),
    // color:'#FF453A',
    color: 'black',
    // fontWeight:Platform.OS === 'ios' ? '600' : 'bold'
  },
  modal2DontDelete: {
    fontSize: wp(4.35),
    // color:'#007AFF'
    color: 'black',
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
    fontSize: wp(4.7),
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
});

export default CardActiveUploads;
