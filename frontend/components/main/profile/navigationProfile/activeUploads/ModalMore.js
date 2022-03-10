import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import profileBack from 'assets/profileBack.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import {setUploadEnded} from 'actions/generalActions.js';
import {useSelector, useDispatch} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import * as Keychain from 'react-native-keychain';
import FastImage from 'react-native-fast-image';
import {
  setActiveMorePressed,
  setActivePostDetails,
  setActiveMoreIndex,
  setActiveModalDeletePost,
  setDeleteLoadingIndicator,
} from 'actions/profileActions.js';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import SocialMediaIcon from 'config/SocialMediaIcon.js';
import PushNotification from 'react-native-push-notification';

// Month number -> Month abbreviation
const functionForMonthActive = (input) => {
  if (input === 0) {
    return 'Jan';
  } else if (input === 1) {
    return 'Feb';
  } else if (input === 2) {
    return 'Mar';
  } else if (input === 3) {
    return 'Apr';
  } else if (input === 4) {
    return 'May';
  } else if (input === 5) {
    return 'Jun';
  } else if (input === 6) {
    return 'Jul';
  } else if (input === 7) {
    return 'Aug';
  } else if (input === 8) {
    return 'Sep';
  } else if (input === 9) {
    return 'Oct';
  } else if (input === 10) {
    return 'Nov';
  } else if (input === 11) {
    return 'Dec';
  }
};

// Format date
const formatAMPMActive = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  return strTime;
};

const ModalMore = React.memo((props) => {
  const dispatch = useDispatch();

  var activeMorePressed = useSelector((state) => {
    return state.profile.activeMorePressed;
  });
  var activeUploadsArray = useSelector((state) => {
    return state.profile.activeUploadsArray;
  });
  var activeMoreIndex = useSelector((state) => {
    return state.profile.activeMoreIndex;
  });
  var activePostDetails = useSelector((state) => {
    return state.profile.activePostDetails;
  });
  var activeModalDeletePost = useSelector((state) => {
    return state.profile.activeModalDeletePost;
  });
  var activeDeleteLoadingIndicator = useSelector((state) => {
    return state.profile.activeDeleteLoadingIndicator;
  });

  let timeAgo = new Date(activeUploadsArray[activeMoreIndex].createdAt);
  let stateDateTime = {
    date: timeAgo.getDate(),
    year: timeAgo.getFullYear(),
    month: functionForMonthActive(timeAgo.getMonth()),
    time: formatAMPMActive(timeAgo),
  };

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthModalMore = () => {
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
            deleteUpload();
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
            }
          });
      });
  };

  // Detele an upload
  const deleteUpload = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        if (!activeDeleteLoadingIndicator) {
          dispatch(setDeleteLoadingIndicator(true));
        }
        Keychain.getGenericPassword()
          .then((creds) => creds.username)
          .then((token) => {
            fetch(global.url + 'uploads/deleteUpload', {
              method: 'DELETE',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify({
                id: activeUploadsArray[activeMoreIndex]._id,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  dispatch(setDeleteLoadingIndicator(false));
                  dispatch(setActiveModalDeletePost(false));
                  dispatch(setActiveMoreIndex(0));
                  setTimeout(() => {
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Poll was deleted successfully.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Poll was deleted successfully.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                    dispatch(setUploadEnded());
                  }, 300);

                  PushNotification.cancelLocalNotifications({
                    id: parseInt(
                      activeUploadsArray[activeMoreIndex]._id.substr(18),
                      16,
                    ).toString(),
                  });
                } else if (response.status === 411) {
                  throw new Error('token');
                } else {
                  throw new Error('gen');
                }
              })
              .catch((err) => {
                if (err != 'Error: token') {
                  dispatch(setDeleteLoadingIndicator(false));
                  Alert.alert(
                    Platform.OS === 'ios'
                      ? 'Something went wrong, please try again.'
                      : '',
                    Platform.OS === 'ios'
                      ? ''
                      : 'Something went wrong, please try again.',
                    [{text: 'OK'}],
                    {cancelable: false},
                  );
                } else {
                  refreshAuthModalMore();
                }
              });
          });
      } else {
        Alert.alert(
          Platform.OS === 'ios' ? 'Oops! Check your internet connection.' : '',
          Platform.OS === 'ios' ? '' : 'Oops! Check your internet connection.',
          [{text: 'OK'}],
          {cancelable: false},
        );
      }
    });
  };

  const onPressDeletePost = () => {
    dispatch(setActivePostDetails(false));
    dispatch(setActiveMorePressed(false));
    setTimeout(() => {
      dispatch(setActiveModalDeletePost(true));
    }, 300);
  };

  const closeModalDelete = () => {
    dispatch(setActiveModalDeletePost(false));
    dispatch(setActiveMoreIndex(0));
  };

  const setFalsePostDetails = () => {
    dispatch(setActivePostDetails(false));
  };

  const onPressSetDetailsTrue = () => {
    dispatch(setActivePostDetails(true));
  };

  const onModal1Close = () => {
    dispatch(setActiveMorePressed(false));
    dispatch(setActivePostDetails(false));
    dispatch(setActiveMoreIndex(0));
  };

  return (
    <View>
      <Modal
        isVisible={activeMorePressed}
        style={styles.modal1Style}
        backdropOpacity={0.5}
        onBackButtonPress={onModal1Close}
        onBackdropPress={onModal1Close}
        animationInTiming={200}
        animationOutTiming={200}
        useNativeDriverForBackdrop={true}
        onSwipeComplete={onModal1Close}
        swipeDirection="down">
        {activePostDetails === false ? (
          <View style={styles.genModalView}>
            <View style={styles.genModalViewSub1}>
              <View style={styles.headerView} />
            </View>
            <View style={styles.bodyView}>
              <TouchableOpacity
                style={styles.postDetailsButton}
                onPress={onPressSetDetailsTrue}>
                <Text style={styles.postDetailsText}>Poll details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onPressDeletePost}>
                <Text style={styles.deleteButtonText}>Delete poll</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.safeArea} />
          </View>
        ) : (
          <View style={styles.postDetailsGeneralView}>
            <View style={styles.postDetailsGeneralViewSubView1}>
              <View style={styles.subView2}>
                <View style={styles.subView3} />
              </View>
              <TouchableOpacity
                style={styles.profileBackStyle}
                onPress={setFalsePostDetails}>
                <FastImage
                  source={profileBack}
                  style={styles.imageProfileBackStyle}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.secondView}>
              <View style={styles.postDetailsListView}>
                <View style={styles.postDetailsleftColumn}>
                  <Text>Seen by</Text>
                </View>
                <View style={styles.postDetailsRightColumn}>
                  <Text style={styles.textRightColumn}>
                    {activeUploadsArray[activeMoreIndex].totalvotes}
                  </Text>
                </View>
              </View>
              <View style={styles.postDetailsListView}>
                <View style={styles.postDetailsleftColumn}>
                  <Text>Social media</Text>
                </View>
                <View style={styles.mediaView}>
                  {activeUploadsArray[activeMoreIndex].targetSocialMedia
                    .length === 1 &&
                  activeUploadsArray[activeMoreIndex].targetSocialMedia[0] ===
                    'empty' ? (
                    <Text style={styles.textRightColumn}>-</Text>
                  ) : (
                    activeUploadsArray[activeMoreIndex].targetSocialMedia.map(
                      (media, index) => {
                        return (
                          <View key={index} style={styles.inView}>
                            <View>
                              <SocialMediaIcon
                                dark={true}
                                socialMedia={media}
                                style={styles.socialMediaIconStyle}
                              />
                            </View>
                          </View>
                        );
                      },
                    )
                  )}
                </View>
              </View>
              <View style={styles.postDetailsListView}>
                <View style={styles.postDetailsleftColumn}>
                  <Text>Creation date</Text>
                </View>
                <View style={styles.postDetailsRightColumn}>
                  <Text style={styles.textRightColumn}>
                    {stateDateTime.date +
                      ' ' +
                      stateDateTime.month +
                      ' ' +
                      stateDateTime.year}
                  </Text>
                </View>
              </View>
              <View style={styles.postDetailsListView}>
                <View style={styles.postDetailsleftColumn}>
                  <Text>Creation time</Text>
                </View>
                <View style={styles.postDetailsRightColumn}>
                  <Text style={styles.textRightColumn}>
                    {stateDateTime.time}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.safeArea} />
          </View>
        )}
      </Modal>

      <Modal
        isVisible={activeModalDeletePost}
        style={styles.modal2Style}
        backdropOpacity={0.5}
        onBackButtonPress={closeModalDelete}
        onBackdropPress={closeModalDelete}
        animationInTiming={200}
        animationOutTiming={200}
        useNativeDriverForBackdrop={true}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}>
        <View style={styles.modal2GenView}>
          <View style={styles.modal2SubView}>
            <View style={styles.modal2View1}>
              <Text numberOfLines={1} style={styles.modal2DeletePost}>
                Delete poll?
              </Text>
              <Text numberOfLines={3} style={styles.modal2Text}>
                If you choose to delete this poll, you will no longer see it in
                your profile.
              </Text>
            </View>
            <View style={styles.modal2Line} />
            <View style={styles.viewKap}>
              {activeDeleteLoadingIndicator ? (
                <View style={styles.modal2Touchable}>
                  <ActivityIndicator color="black" size="small" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={deleteUpload}>
                  <Text style={styles.modal2Delete}>Delete</Text>
                </TouchableOpacity>
              )}
              <View style={styles.modal2Line} />
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={closeModalDelete}>
                <Text style={styles.modal2DontDelete}>Don't delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  genModalView: {
    width: wp(100),
    height: hp(19.5),
    backgroundColor: config.WHITE,
    alignItems: 'center',
    borderTopLeftRadius: wp(4.6),
    borderTopRightRadius: wp(4.6),
  },
  modal1Style: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  modal2Style: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  genModalViewSub1: {
    flex: 0.35,
    marginTop: '2%',
  },
  mediaView: {
    backgroundColor: 'transparent',
    marginRight: wp(6.15),
    flexDirection: 'row',
  },
  headerView: {
    backgroundColor: '#E3E3E3',
    width: wp(12),
    borderRadius: 3,
    height: 6,
  },
  bodyView: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(100),
  },
  socialMediaIconStyle: {
    width: wp(4),
    height: wp(4),
  },
  postDetailsButton: {
    width: '100%',
    height: '40%',
    backgroundColor: 'transparent',
    paddingLeft: wp(8),
    justifyContent: 'center',
  },
  postDetailsText: {
    fontSize: wp(4.6),
  },
  deleteButton: {
    width: '100%',
    height: '40%',
    backgroundColor: 'transparent',
    paddingLeft: wp(8),
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: wp(4.6),
    color: config.DELETE_BUTTON,
  },
  postDetailsListView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDetailsleftColumn: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
    marginLeft: wp(6.15),
  },
  postDetailsRightColumn: {
    flex: 2,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    marginRight: wp(6.15),
  },
  inView: {
    marginLeft: wp(2),
  },
  textRightColumn: {
    fontSize: 14,
    color: '#01161E',
    fontWeight: '600',
  },
  profileBackStyle: {
    width: '10%',
    alignItems: 'flex-start',
    marginTop: '2%',
    marginLeft: wp(6.15),
  },
  imageProfileBackStyle: {
    width: 8,
    height: 14,
  },
  secondView: {
    flex: 3.2,
  },
  postDetailsGeneralView: {
    width: wp(100),
    height: hp(25),
    backgroundColor: config.WHITE,
    borderTopLeftRadius: wp(4.6),
    borderTopRightRadius: wp(4.6),
  },
  postDetailsGeneralViewSubView1: {
    flex: 1,
    marginTop: '2%',
  },
  subView2: {
    alignItems: 'center',
  },
  subView3: {
    backgroundColor: '#E3E3E3',
    width: wp(12),
    borderRadius: 3,
    height: 6,
  },
  modal2Touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2Delete: {
    fontSize: wp(4.35),
    color: '#FF453A',
    fontWeight: '600',
  },
  modal2DontDelete: {
    fontSize: wp(4.35),
    color: '#007AFF',
  },
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2GenView: {
    width: wp(69.2),
    height: wp(50),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
  },
  modal2SubView: {
    flex: 1,
  },
  modal2View1: {
    alignItems: 'center',
    justifyContent: 'center',
    //flexGrow:1,
    flex: 2,
    // backgroundColor:'red',
    // paddingVertical:wp(0)
  },
  modal2DeletePost: {
    color: config.BLACK,
    fontSize: wp(4.35),
    fontWeight: '600',
  },
  modal2Text: {
    textAlign: 'center',
    marginHorizontal: wp(5.92),
    fontSize: wp(3.33),
    marginTop: '1.03%',
  },
  viewKap: {
    flex: 1.6,
  },
  safeArea: {
    flex: 1,
  },
});

export default ModalMore;
