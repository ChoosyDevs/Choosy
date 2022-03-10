import React, {useState, useCallback} from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useFocusEffect} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import PostDuration from './PostDuration/PostDuration.js';
import TargetSocialMedia from './TargetSocialMedia/TargetSocialMedia.js';
import UploadHeader from './UploadHeader/UploadHeader.js';
import SelectedPhotos from './SelectedPhotos/SelectedPhotos.js';
import ImagePicker from 'react-native-image-crop-picker';
import * as Keychain from 'react-native-keychain';
import {useSelector, useDispatch} from 'react-redux';
import {
  setPhotos,
  setModalVisible,
  discardUpload,
  setArrayOfDeletedPhotos,
  setScreenName,
} from 'actions/uploadActions.js';
import {
  setUploadLoading,
  setUploadSuccessful,
  setUploadEnded,
  setUploadBarOpen,
} from 'actions/generalActions.js';
import NetInfo from '@react-native-community/netinfo';
import {setPublicationsIncrease} from 'actions/userActions.js';
import Modal from 'react-native-modal';
import {useNavigation} from '@react-navigation/native';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import Analytics from 'analytics/Analytics.js';
import perf from '@react-native-firebase/perf';
import PushNotification from 'react-native-push-notification';

const Stack = createStackNavigator();

Date.prototype.addDuration = function (duration) {
  this.setTime(
    this.getTime() +
      duration.minutes * 60 * 1000 +
      duration.hours * 60 * 60 * 1000 +
      duration.days * 24 * 60 * 60 * 1000,
  );
  return this;
};

const Upload = React.memo((props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const photos = useSelector((state) => state.upload.photos);
  const postDuration = useSelector((state) => state.upload.postDuration);
  const targetAges = useSelector((state) => state.user.targetAges);
  const targetSocialMedia = useSelector(
    (state) => state.upload.targetSocialMedia,
  );
  const preferToggle = useSelector((state) => state.upload.preferToggle);
  const modalVisible = useSelector((state) => state.upload.modalVisible);
  const arrayOfDeletedPhotos = useSelector(
    (state) => state.upload.arrayOfDeletedPhotos,
  );

  let numberOfAvailablePhotosHomeScreen = useSelector(
    (state) => state.home.uploadsArray.length,
  );

  const [loading, setLoading] = useState(false);

  // Opens ImagePicker
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        ImagePicker.openPicker({
          multiple: true,
          waitAnimationEnd: false,
          mediaType: 'photo',
          compressImageMaxWidth: 1024,
          compressImageQuality: 0.7,
          forceJpg: true,
          includeBase64: true,
          minFiles: 2,
          maxFiles: 5,
        })
          .then((images) => {
            if (images.length >= 1 && images.length <= 5) {
              dispatch(
                setPhotos(
                  images.map((i) => {
                    return {
                      base64: i.data,
                      uri: i.path,
                      width: i.width,
                      height: i.height,
                      mime: i.mime,
                      modificationDate: i.modificationDate,
                      filename: Platform.OS === 'ios' ? i.filename : null,
                    };
                  }),
                ),
              );
            } else {
              Alert.alert(
                Platform.OS === 'ios' ? 'You can upload up to 5 photos.' : '',
                Platform.OS === 'ios' ? '' : 'You can upload up to 5 photos.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }
            setLoading(true);
          })
          .catch((e) => {
            navigation.navigate('HomeScreen');
          });
      }, 200);

      return () => {
        setLoading(false);
      };
    }, []),
  );

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthUpload = () => {
    Keychain.getGenericPassword()
      .then((creds) => creds.password)
      .then((refreshToken) => {
        fetch(global.url_auth + 'token', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + refreshToken,
          },
        })
          .then((res) => {
            if (res.status === 412) {
              throw new Error('banned');
            } else if (res.status === 201) {
              return res.json();
            } else {
              throw new Error('gen');
            }
          })
          .then(async (response) => {
            try {
              await Keychain.setGenericPassword(
                response.token,
                response.refreshToken,
              );
            } catch (e) {
              //null
            }
          })
          .then((data) => {
            uploadImages(false);
          })
          .catch((err) => {
            if (err == 'Error: banned') {
              Alert.alert(
                Platform.OS === 'ios'
                  ? 'Your account is no longer active due to inappropriate posts.'
                  : '',
                Platform.OS === 'ios'
                  ? ''
                  : 'Your account is no longer active due to inappropriate posts.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      dispatch(setInitialStateGeneral());
                      dispatch(setInitialStateHome());
                      dispatch(setInitialStateUser());
                      dispatch(setInitialStateWelcome());
                      dispatch(discardUpload());
                      dispatch(setInitialStateProfile());
                    },
                  },
                ],
                {cancelable: false},
              );
              PushNotification.cancelAllLocalNotifications();
            }
          });
      });
  };

  //function that uploads New Post
  const uploadImages = useCallback(
    (arg) => {
      NetInfo.fetch().then((stateInternet) => {
        if (stateInternet.isConnected === true) {
          //that arg uses when we call refresh auth for not doing two times below commands
          if (arg) {
            navigation.navigate('HomeScreen');
            dispatch(setScreenName('PostDurationScreen'));
            dispatch(setUploadLoading());
            dispatch(setUploadBarOpen(true));
          }
          const formData = new FormData();

          //set images in FormData
          var formDataSelectedImages = photos;

          formDataSelectedImages.map((image) => {
            formData.append('photos', {
              uri: image.uri,
              type: image.mime,
              name: image.uri,
            });
          });

          //set Final date in FormData

          var formDataPostDuration = postDuration;

          const finalDate = new Date().addDuration(formDataPostDuration);
          formData.append('finalDate', finalDate.toString());

          //set targetAges in FormData
          var formDataTargetAges = targetAges;

          formDataTargetAges.map((age) => {
            formData.append('targetAgeGroups', age);
          });

          //set targetSocialMedia in FormData
          var formDataTargetSocialMedia = targetSocialMedia;
          var formDataTargetSocialMediaToggleOnOff = preferToggle;

          if (formDataTargetSocialMediaToggleOnOff) {
            formData.append('targetSocialMedia', 'empty');
          } else {
            formDataTargetSocialMedia.map((media) => {
              formData.append('targetSocialMedia', media);
            });
          }

          //set if home screen was empty when uploading a poll

          if (numberOfAvailablePhotosHomeScreen > 0) {
            formData.append('homeEmptyScreen', false.toString());
          } else {
            formData.append('homeEmptyScreen', true.toString());
          }

          Keychain.getGenericPassword()
            .then((creds) => creds.username)
            .then(async (token) => {
              const metric = await perf().newHttpMetric(
                'choosy-application.com/' + 'uploads',
                'POST',
              );
              await metric.start();
              let fetchResponse = {};

              await fetch(global.url + 'uploads', {
                method: 'POST',
                headers: {
                  Authorization: 'Bearer ' + token,
                },
                body: formData,
              })
                .then(async (response) => {
                  fetchResponse = response;
                  if (response.status === 201) {
                    const {uploadId} = await response.json();

                    PushNotification.localNotificationSchedule({
                      //... You can use all the options from localNotifications
                      message: 'Your poll has finished. See results!', // (required)
                      date: new Date().addDuration(formDataPostDuration),
                      // date: new Date(Date.now() + 20 * 1000), // in 60 secs
                      // playSound: true,
                      // soundName: "default",
                      // visibility: "public",
                      //... You can use all the options from localNotifications
                      allowWhileIdle: true, // (optional) set notification to work while on doze, default: false,
                      id: parseInt(uploadId.substr(18), 16).toString(),
                      //  id:"1223",
                      channelId: 'choosyNotific',
                    });

                    dispatch(setUploadSuccessful(true));
                    dispatch(setUploadEnded());
                    dispatch(discardUpload());
                    dispatch(setUploadLoading());
                    if (numberOfAvailablePhotosHomeScreen > 0) {
                      dispatch(setPublicationsIncrease());
                    }
                    const uploadProperties = {
                      targetSocialMedia: targetSocialMedia,
                      photosCount: photos.length,
                    };

                    //send Upload Event to Analytics
                    Analytics.onUpload(uploadProperties);
                    return 1;
                  } else if (response.status === 411) {
                    throw new Error('token');
                  } else if (response.status === 401) {
                    throw new Error('401');
                  } else if (response.status === 402) {
                    throw new Error('402');
                  } else {
                    throw new Error('500');
                  }
                })
                .catch((err) => {
                  if (err != 'Error: token') {
                    dispatch(discardUpload());
                    dispatch(setUploadSuccessful(false));
                    dispatch(setUploadLoading());
                    dispatch(setUploadEnded());
                    dispatch(setUploadBarOpen(false));
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Oops! Check your internet connection.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Oops! Check your internet connection.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                  } else {
                    refreshAuthUpload();
                  }
                });
              metric.setHttpResponseCode(fetchResponse.status);
              metric.setResponseContentType(
                fetchResponse.headers.get('Content-Type'),
              );
              metric.setResponsePayloadSize(
                parseFloat(fetchResponse.headers.get('Content-Length')),
              );
              await metric.stop();
            });
        } else {
          Alert.alert(
            Platform.OS === 'ios'
              ? 'Oops! Check your internet connection.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'Oops! Check your internet connection.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      });
    },
    [photos, postDuration, targetAges, targetSocialMedia, preferToggle],
  );

  // function that adds and removes photos from arrayOfDeletedPhotos
  const functionAddInDeletedArray = useCallback(
    (photo) => {
      if (arrayOfDeletedPhotos.includes(photo)) {
        let array = arrayOfDeletedPhotos.filter((item) => {
          return item !== photo;
        });
        dispatch(setArrayOfDeletedPhotos(array));
      } else {
        var joined = arrayOfDeletedPhotos.concat(photo);
        dispatch(setArrayOfDeletedPhotos(joined));
      }
    },
    [arrayOfDeletedPhotos],
  );

  // function that executes when we press delete (number) and deletes images
  const deleteImagesFunction = useCallback(() => {
    let tempNewArray = [];
    let flag;
    photos.map((photo) => {
      flag = false;
      arrayOfDeletedPhotos.map((delIds) => {
        if (photo.uri === delIds) {
          flag = true;
        }
      });
      if (flag === false) {
        tempNewArray.push(photo);
      }
    });
    dispatch(setPhotos(tempNewArray));
    dispatch(setArrayOfDeletedPhotos([]));
  }, [photos, arrayOfDeletedPhotos]);

  // function that add moreImages in SelectedPics Array
  const addSelectedImages = useCallback(() => {
    ImagePicker.openPicker({
      multiple: true,
      waitAnimationEnd: false,
      mediaType: 'photo',
      compressImageMaxWidth: 1024,
      compressImageQuality: 0.7,
      forceJpg: true,
      includeBase64: true,
      maxFiles: 5,
    })
      .then((images) => {
        var joined = photos;
        if (photos.length + images.length <= 5) {
          images.map((i) => {
            var img = {
              base64: i.data,
              uri: i.path,
              width: i.width,
              height: i.height,
              mime: i.mime,
              filename: Platform.OS === 'ios' ? i.filename : null,
            };
            let duplicate = checkForTheSameImage(img.base64, photos);
            if (duplicate === false) {
              joined = joined.concat(img);
            }
          });
          dispatch(setPhotos(joined));
        } else {
          Alert.alert(
            Platform.OS === 'ios' ? 'You can select up to 5 photos.' : '',
            Platform.OS === 'ios' ? '' : 'You can select up to 5 photos.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      })
      .catch((e) => {});
  }, [photos]);

  //function that checks if during addImagesProcess user selected the same photo
  const checkForTheSameImage = (image, array) => {
    for (var i = 0; i < array.length; i++) {
      if (array[i].base64 === image) {
        return true;
      }
    }
    return false;
  };

  const DiscardButtonFunction = () => {
    dispatch(setModalVisible(false));
    dispatch(setArrayOfDeletedPhotos([]));
    dispatch(discardUpload());
    navigation.navigate('HomeScreen');
  };

  const CancelButtonFunction = () => {
    dispatch(setModalVisible(false));
  };

  if (loading === false) {
    return (
      <View style={styles.loadingStyle}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.headerAndPhotos}>
          <UploadHeader
            uploadImages={uploadImages}
            deleteImagesFunction={deleteImagesFunction}
          />
          <SelectedPhotos
            addSelectedImages={addSelectedImages}
            functionAddInDeletedArray={functionAddInDeletedArray}
          />
        </View>
        <Stack.Navigator
          initialRouteName="PostDurationScreen"
          screenOptions={{
            headerShown: false,
            //animationEnabled: false,
            ...TransitionPresets.SlideFromRightIOS,
          }}>
          <Stack.Screen
            name="PostDurationScreen"
            component={PostDuration}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen
            name="TargetSocialMediaScreen"
            component={TargetSocialMedia}
            options={{gestureEnabled: false}}
          />
        </Stack.Navigator>
        <Modal
          isVisible={modalVisible}
          style={styles.modalStyle}
          backdropOpacity={0.5}
          onBackButtonPress={CancelButtonFunction}
          onBackdropPress={CancelButtonFunction}
          animationIn={'zoomIn'}
          animationOut={'zoomOut'}
          animationInTiming={200}
          animationOutTiming={200}
          backdropTransitionOutTiming={0}>
          <View style={styles.containerModal}>
            <View style={styles.modal2SubView}>
              <View style={styles.modal2View1}>
                <Text style={styles.modal2DeletePost}>Discard poll?</Text>
                <Text style={styles.modal2Text}>
                  If you go back now, your edits will be discarded.
                </Text>
              </View>
              <View style={styles.modal2Line} />
              <View style={styles.viewKap}>
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={DiscardButtonFunction}
                  activeOpacity={0.5}>
                  <Text style={styles.modal2Delete}>Discard</Text>
                </TouchableOpacity>
                <View style={styles.modal2Line} />
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={CancelButtonFunction}
                  activeOpacity={0.5}>
                  <Text style={styles.modal2DontDelete}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.WHITE,
  },
  headerAndPhotos: {
    flex: 1.08,
    backgroundColor: config.WHITE,
  },
  containerModal: {
    width: wp(69.2),
    height: hp(23.7),
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
    fontSize: wp(4.35),
    color: '#FF453A',
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
  loadingStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default Upload;
