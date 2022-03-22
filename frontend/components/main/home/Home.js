import React, {useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import HomeBody from './HomeBody/HomeBody.js';
import HomeFooter from './HomeFooter/HomeFooter.js';
import HomeHeader from './HomeHeader/HomeHeader.js';
import LoadingNext from './LoadingNext/LoadingNext.js';
import Popover from './Popover/Popover.js';
import EmptyScreen from './EmptyScreen/EmptyScreen.js';
import * as Keychain from 'react-native-keychain';
import {useSelector, useDispatch} from 'react-redux';
import {
  setUploadsArray,
  incrementCurrentIndex,
  setTappedButtonModalMore,
  setReportPressed,
  setHideThisUserPressed,
} from 'actions/homeActions.js';
import {setLoadingVisible} from 'actions/homeActions.js';
import NetInfo from '@react-native-community/netinfo';
import {setLevelIncrease} from 'actions/userActions.js';
import {
  setInitialStateGeneral,
  setUploadIdFromLink,
} from 'actions/generalActions.js';
import {
  setInitialStateHome,
  setSeenAll,
  setLoadingReports,
  setSkippedUploadsModal,
} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {setInitialStateProfile} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import Analytics from 'analytics/Analytics.js';
import perf from '@react-native-firebase/perf';
import {setInstagramIntroSeen, setInstagramIntro} from 'actions/userActions.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import PushNotification from 'react-native-push-notification';

function Home() {
  const dispatch = useDispatch();
  const uploadsArray = useSelector((state) => state.home.uploadsArray);
  const isReady = useSelector((state) => state.home.isReady);
  const currentIndex = useSelector((state) => state.home.currentIndex);
  const voting = useSelector((state) => state.home.voting);
  const loadingVisible = useSelector((state) => state.home.loadingVisible);
  const popoverVisible = useSelector((state) => state.home.popoverVisible);
  const uploadIdFromLink = useSelector(
    (state) => state.general.uploadIdFromLink,
  );
  const skippedUploadsModal = useSelector(
    (state) => state.home.skippedUploadsModal,
  );

  let photoIndex = useRef(0);
  let seenAllPhotos = useRef(false);
  let counterKap = useRef(0);
  let firstTouch = useRef(false);

  useEffect(() => {
    onUploadChange();
  }, [uploadIdFromLink]);

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuth = async (
    func,
    savedCurrentIndexRefresh,
    votedPhotoIndex,
  ) => {
    Keychain.getGenericPassword()
      .then((creds) => creds.password)
      .then(async (refreshToken) => {
        const metric = await perf().newHttpMetric(
          'choosy-application.com/' + 'auth/token',
          'POST',
        );
        await metric.start();
        let fetchResponse = {};

        await fetch(global.url_auth + 'token', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + refreshToken,
          },
        })
          .then((res) => {
            fetchResponse = res;
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
              //nothing
            }
          })
          .then((data) => {
            switch (func) {
              case 'vote':
                onVote(false, savedCurrentIndexRefresh, votedPhotoIndex);
                break;
              case 'hatedUsers':
                onHatedUsers(savedCurrentIndexRefresh);
                break;
              case 'report':
                onReport(savedCurrentIndexRefresh);
                break;
              case 'skip':
                onSkip(false, savedCurrentIndexRefresh);
                break;
              case 'uploadChange':
                if (uploadIdFromLink != '') dispatch(setUploadIdFromLink(''));
                else onUploadChange();
                break;
              default:
            }
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
        metric.setHttpResponseCode(fetchResponse.status);
        metric.setResponseContentType(
          fetchResponse.headers.get('Content-Type'),
        );
        metric.setResponsePayloadSize(
          parseFloat(fetchResponse.headers.get('Content-Length')),
        );
        await metric.stop();
      });
  };

  // Function that gets called when you go from one poll to the next.
  // It shows next upload of current batch or brings a new batch if it was the last one of the current
  const onIndexChange = () => {
    photoIndex.current = 0;
    seenAllPhotos.current = false;
    counterKap.current = 0;
    firstTouch.current = false;
    dispatch(setSeenAll(false));

    if (currentIndex === uploadsArray.length - 1) {
      if (uploadIdFromLink != '') dispatch(setUploadIdFromLink(''));
      else onUploadChange();
    } else {
      if (uploadsArray[currentIndex + 1] === undefined) {
        if (uploadIdFromLink != '') dispatch(setUploadIdFromLink(''));
        else onUploadChange();
      } else {
        dispatch(incrementCurrentIndex());
      }
    }
  };

  // Converts votes count to percentages on every poll
  const calculatePercentages = (upload) => {
    let roundedPercentages = [];
    if (upload.totalvotes === 0) {
      let remainder = 100 % upload.photos.length;
      roundedPercentages = upload.photos.map((photo) =>
        Math.floor(100 / upload.photos.length),
      );
      while (remainder !== 0) {
        roundedPercentages[remainder--]++;
      }
    } else {
      const percentages = upload.photos.map(
        (photo) =>
          (photo.votes + 1) / (upload.totalvotes + upload.photos.length),
      );
      roundedPercentages = evenRoundHome(percentages);
    }
    return roundedPercentages;
  };

  // Function that fetches a number of uploads that the user has not seen yet
  const onUploadChange = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        Keychain.getGenericPassword()
          .then((creds) => creds.username)
          .then(async (token) => {
            const metric = await perf().newHttpMetric(
              'choosy-application.com/' + 'uploads/all',
              'GET',
            );
            await metric.start();
            let fetchResponse = {};

            await fetch(
              global.url + 'uploads/all?limit=10&uploadId=' + uploadIdFromLink,
              {
                method: 'GET',
                headers: {
                  Authorization: 'Bearer ' + token,
                },
              },
            )
              .then((response) => {
                fetchResponse = response;
                let linkError = response.headers.get('linkError');

                if (linkError) {
                  if (linkError === 'owned') {
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? "You can't choose on your polls."
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : "You can't choose on your polls.",
                      [
                        {
                          text: 'OK',
                          onPress: () => dispatch(setUploadIdFromLink('')),
                        },
                      ],
                      {cancelable: false},
                    );
                  } else if (linkError === 'alreadyVisited') {
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'You have already chosen on this poll.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'You have already chosen on this poll.',
                      [
                        {
                          text: 'OK',
                          onPress: () => dispatch(setUploadIdFromLink('')),
                        },
                      ],
                      {cancelable: false},
                    );
                  } else if (linkError === 'unavailable') {
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'This poll is no longer available.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'This poll is no longer available.',
                      [
                        {
                          text: 'OK',
                          onPress: () => dispatch(setUploadIdFromLink('')),
                        },
                      ],
                      {cancelable: false},
                    );
                  }
                }

                if (response.status === 411) {
                  throw new Error('token');
                } else if (response.status === 201 || response.status === 200) {
                  if (response.headers.get('skippedUploads'))
                    dispatch(setSkippedUploadsModal(true));
                  return response.json();
                } else {
                  throw new Error('gen');
                }
              })
              .then((uploadDetails) => {
                if (!Array.isArray(uploadDetails))
                  uploadDetails = [uploadDetails];

                uploadDetails.map((upload) => {
                  upload.percentages = calculatePercentages(upload);
                });
                dispatch(setUploadsArray(uploadDetails));
              })
              .catch((err) => {
                if (err == 'Error: token') {
                  refreshAuth('uploadChange', false, 0);
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
                  dispatch(setUploadIdFromLink(''));
                }
              });

            metric.setHttpResponseCode(fetchResponse.status);
            metric.setResponseContentType(
              fetchResponse.headers.get('Content-Type'),
            );
            await metric.stop();
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

  //Skip Function
  const onSkip = useCallback(
    async (flag, savedCurrentIndex) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          try {
            var uploadID = uploadsArray[savedCurrentIndex]._id;

            if (typeof uploadID === 'undefined') {
              throw new Error();
            } else {
              if (flag && savedCurrentIndex !== uploadsArray.length - 1) {
                onIndexChange();
              }

              Keychain.getGenericPassword()
                .then((creds) => creds.username)
                .then(async (token) => {
                  const metric = await perf().newHttpMetric(
                    'choosy-application.com/' + 'uploads/skip',
                    'PATCH',
                  );
                  await metric.start();
                  let fetchResponse = {};
                  await fetch(global.url + 'uploads/skip', {
                    method: 'PATCH',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                      id1: uploadID,
                    }),
                  })
                    .then((response) => {
                      fetchResponse = response;
                      if (response.status === 200) {
                        if (savedCurrentIndex === uploadsArray.length - 1) {
                          onIndexChange();
                        }
                        //send skip event to analytics
                        Analytics.onSkip();
                      } else if (response.status === 411) {
                        throw new Error('tokenaki');
                      } else {
                        throw new Error('gen');
                      }
                    })
                    .catch((err) => {
                      if (err != 'Error: tokenaki') {
                        onIndexChange();
                      } else {
                        refreshAuth('skip', savedCurrentIndex, 0);
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
            }
          } catch (e) {
            onIndexChange();
          }
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
    [currentIndex, uploadsArray.length],
  );

  // Vote Function
  const onVote = useCallback(
    async (flag, savedCurrentIndex, votedPhotoIndex) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          try {
            var uploadID = uploadsArray[savedCurrentIndex]._id;
            var photoID =
              uploadsArray[savedCurrentIndex].photos[votedPhotoIndex]._id;

            if (flag) {
              dispatch(setLoadingVisible(true));
            }

            if (
              typeof uploadID === 'undefined' ||
              typeof photoID === 'undefined'
            ) {
              throw new Error();
            } else {
              if (flag && savedCurrentIndex !== uploadsArray.length - 1) {
                setTimeout(() => onIndexChange(), 200);
              }

              Keychain.getGenericPassword()
                .then((creds) => creds.username)
                .then(async (token) => {
                  const metric = await perf().newHttpMetric(
                    'choosy-application.com/' + 'uploads/vote',
                    'PATCH',
                  );
                  await metric.start();
                  let fetchResponse = {};

                  await fetch(global.url + 'uploads/vote', {
                    method: 'PATCH',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                      id1: uploadID,
                      id2: photoID,
                    }),
                  })
                    .then((response) => {
                      fetchResponse = response;
                      if (response.status === 200) {
                        if (savedCurrentIndex === uploadsArray.length - 1) {
                          onIndexChange();
                        }
                        //send vote event to analytics
                        Analytics.onVote();
                        dispatch(setLevelIncrease());
                        return 1;
                      } else if (response.status === 411) {
                        throw new Error('tokenaki');
                      } else {
                        throw new Error('gen');
                      }
                    })
                    .catch((err) => {
                      if (err != 'Error: tokenaki') {
                        onIndexChange();
                      } else {
                        refreshAuth('vote', savedCurrentIndex, votedPhotoIndex);
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
            }
          } catch (e) {
            dispatch(setLoadingVisible(false));
            onIndexChange();
          }
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
          dispatch(setLoadingVisible(false));
        }
      });
    },
    [currentIndex, uploadsArray.length],
  );

  // Report function
  const onReport = useCallback(
    (savedCurrentIndex) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          try {
            var uploadID = uploadsArray[savedCurrentIndex]._id;
            if (typeof uploadID === undefined) {
              throw new Error();
            } else {
              Keychain.getGenericPassword()
                .then((creds) => creds.username)
                .then((token) => {
                  fetch(global.url + 'uploads/reported', {
                    method: 'PATCH',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                      id1: uploadID,
                    }),
                  })
                    .then((response) => {
                      if (response.status === 200) {
                        dispatch(setTappedButtonModalMore(false));
                        setTimeout(() => {
                          Alert.alert(
                            Platform.OS === 'ios'
                              ? 'Your report was successful.'
                              : '',
                            Platform.OS === 'ios'
                              ? ''
                              : 'Your report was successful.',
                            [{text: 'OK'}],
                            {cancelable: false},
                          );
                          dispatch(setLoadingReports(false));
                          dispatch(setReportPressed(false));
                        }, 500);
                        onIndexChange();
                        Analytics.onReport();
                      } else if (response.status === 411) {
                        throw new Error('tokenaki');
                      } else {
                        throw new Error('gen');
                      }
                    })
                    .catch((e) => {
                      if (e != 'Error: tokenaki') {
                        dispatch(setLoadingReports(false));
                        dispatch(setReportPressed(false));
                        dispatch(setTappedButtonModalMore(false));

                        onIndexChange();
                      } else {
                        refreshAuth('report', savedCurrentIndex, 0);
                      }
                    });
                });
            }
          } catch (e) {
            dispatch(setLoadingReports(false));
            dispatch(setReportPressed(false));
            dispatch(setTappedButtonModalMore(false));
            onIndexChange();
          }
        } else {
          dispatch(setLoadingReports(false));
          Alert.alert(
            Platform.OS === 'ios'
              ? 'Please check your internet connection and try again.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'Please check your internet connection and try again.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      });
    },
    [currentIndex, uploadsArray.length],
  );

  // Hide this user function
  const onHatedUsers = useCallback(
    (savedCurrentIndex) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected === true) {
          try {
            //id of the user I want to dont see again
            var uploadID = uploadsArray[savedCurrentIndex].owner;

            if (typeof uploadID === undefined) {
              throw new Error();
            }
            Keychain.getGenericPassword()
              .then((creds) => creds.username)
              .then((token) => {
                fetch(global.url + 'users/hatedUsers', {
                  method: 'PATCH',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                  },
                  body: JSON.stringify({
                    id: uploadID,
                  }),
                })
                  .then((response) => {
                    if (response.status === 200) {
                      dispatch(setTappedButtonModalMore(false));
                      setTimeout(() => {
                        Alert.alert(
                          Platform.OS === 'ios'
                            ? 'Your request was successful.'
                            : '',
                          Platform.OS === 'ios'
                            ? ''
                            : 'Your request was successful.',
                          [{text: 'OK'}],
                          {cancelable: false},
                        );
                        dispatch(setLoadingReports(false));
                        dispatch(setHideThisUserPressed(false));
                      }, 500);
                      photoIndex.current = 0;
                      seenAllPhotos.current = false;
                      counterKap.current = 0;
                      firstTouch.current = false;
                      dispatch(setSeenAll(false));

                      if (uploadIdFromLink != '')
                        dispatch(setUploadIdFromLink(''));
                      else onUploadChange();

                      Analytics.onHatedUsers();
                    } else if (response.status === 411) {
                      throw new Error('tokenaki');
                    } else {
                      throw new Error('gen');
                    }
                  })
                  .catch((e) => {
                    if (e != 'Error: tokenaki') {
                      dispatch(setLoadingReports(false));
                      dispatch(setHideThisUserPressed(false));
                      dispatch(setTappedButtonModalMore(false));
                      onIndexChange();
                    } else {
                      refreshAuth('hatedUsers', savedCurrentIndex, 0);
                    }
                  });
              });
          } catch (e) {
            dispatch(setLoadingReports(false));
            dispatch(setHideThisUserPressed(false));
            dispatch(setTappedButtonModalMore(false));
            onIndexChange();
          }
        } else {
          dispatch(setLoadingReports(false));
          Alert.alert(
            Platform.OS === 'ios'
              ? 'Please check your internet connection and try again.'
              : '',
            Platform.OS === 'ios'
              ? ''
              : 'Please check your internet connection and try again.',
            [{text: 'OK'}],
            {cancelable: false},
          );
        }
      });
    },
    [currentIndex, uploadsArray.length],
  );

  // Takes a set of percentages and rounds all of them so that they add to 100
  const evenRoundHome = (orig) => {
    let diff = 100;

    const final = orig.map((item) => {
      if (item * 100 >= 1) {
        diff -= Math.floor(item * 100);
        return Math.floor(item * 100);
      } else {
        diff += Math.floor(item * 100);
        return Math.ceil(item * 100);
      }
    });

    let smallestValuesArray = [];
    let smallestValuesIndex = [];
    for (let i = 0; i < diff; i++) {
      smallestValuesArray.push(100);
      smallestValuesIndex.push(0);
    }

    final.forEach((number, index) => {
      if (number < Math.max(...smallestValuesArray)) {
        const i = smallestValuesArray.indexOf(Math.max(...smallestValuesArray));
        smallestValuesArray[i] = number;
        smallestValuesIndex[i] = index;
      }
    });

    smallestValuesIndex.map((item) => {
      final[item]++;
    });

    return final;
  };

  return (
    <View style={styles.container}>
      <HomeHeader />
      {!isReady ? (
        <View style={styles.flex8}>
          <View style={styles.flex8More}>
            <ActivityIndicator size="large" color="black" />
          </View>
          <HomeFooter />
        </View>
      ) : uploadsArray.length !== 0 ? (
        <>
          <HomeBody
            firstTouch={firstTouch}
            counterKap={counterKap}
            photoIndex={photoIndex}
            seenAllPhotos={seenAllPhotos}
            onVote={onVote}
            onReport={onReport}
            onHatedUsers={onHatedUsers}
          />
          <HomeFooter
            photoIndex={photoIndex}
            seenAllPhotos={seenAllPhotos}
            onVote={onVote}
            onSkip={onSkip}
          />
        </>
      ) : (
        <EmptyScreen onUploadChange={onUploadChange} />
      )}

      {popoverVisible && !voting ? (
        <View style={styles.absolute}>
          <Popover />
        </View>
      ) : null}
      {loadingVisible ? (
        <View style={styles.loadingNextWrapper}>
          <LoadingNext
            seenAllPhotos={seenAllPhotos}
            uploadPercentages={
              uploadsArray.length === 0
                ? null
                : uploadsArray[currentIndex].percentages
            }
            photoIndex={photoIndex.current}
            upload={
              uploadsArray.length === 0 ? null : uploadsArray[currentIndex]
            }
          />
        </View>
      ) : null}

      <Modal
        isVisible={
          skippedUploadsModal && !loadingVisible && uploadIdFromLink == ''
        }
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={() => dispatch(setSkippedUploadsModal(false))}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationInTiming={200}
        animationOutTiming={200}
        useNativeDriverForBackdrop={true}>
        <View style={styles.containerModal}>
          <View style={styles.textContainer}>
            <Text style={styles.textStyle}>
              You have seen every poll. The following polls are those that you
              have skipped before.
            </Text>
          </View>
          <View style={styles.viewTouchable}>
            <TouchableOpacity
              style={styles.touchable}
              onPress={() => dispatch(setSkippedUploadsModal(false))}
              activeOpacity={0.5}>
              <Text style={styles.okStyle}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.WHITE,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingNextWrapper: {
    position: 'absolute',
    top: '8%',
    bottom: 0,
    left: 0,
    right: 0,
  },
  flex8: {
    flex: 8,
  },
  flex8More: {
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  containerModal: {
    width: wp(65.2),
    // height:hp(24),
    aspectRatio: 1.6,
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    marginHorizontal: wp(4.5),
    textAlign: 'center',
    fontSize: wp(4),
  },
  viewTouchable: {
    borderTopColor: '#DCDCDC',
    borderTopWidth: wp(0.15),
    flex: 1.2,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okStyle: {
    fontSize: wp(4.3),
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;
