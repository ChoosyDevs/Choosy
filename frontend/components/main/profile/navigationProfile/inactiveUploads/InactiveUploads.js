import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Text from 'config/Text.js';
import FastImage from 'react-native-fast-image';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ModalInactive from './ModalInactive.js';
import {
  setTappedPhotoSelectedPhotos,
  setModalInactiveUploads,
} from 'actions/profileActions.js';
import {useSelector, useDispatch} from 'react-redux';
import {setInternetConnectionInTheApp} from 'actions/generalActions.js';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import noInternet from 'assets/noInternet.json';
import trophyGray from 'assets/trophyGray.png';
import {removeFinishedPollArray} from 'actions/profileActions.js';

const InactiveUploads = (props) => {
  var wonPhotosArray = useSelector((state) => state.profile.wonPhotosArray);
  var internetConnectionInTheApp = useSelector(
    (state) => state.general.internetConnectionInTheApp,
  );
  var isReady = useSelector((state) => state.profile.isReady);
  const finishedPollArray = useSelector(
    (state) => state.profile.finishedPollArray,
  );

  const dispatch = useDispatch();

  const modalTrue = (index) => {
    dispatch(setTappedPhotoSelectedPhotos(index));
    dispatch(setModalInactiveUploads(true));
  };

  const checkInternet = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        dispatch(setInternetConnectionInTheApp(true));
      } else {
        //nothing
      }
    });
  };

  // Calculate padding based on position
  const calcPadding = (index) => {
    switch (index % 3) {
      case 0:
        return {
          paddingRight: wp(0.15),
          paddingTop: wp(0.15),
          paddingBottom: wp(0.15),
        };
        break;
      case 1:
        return {padding: wp(0.15)};
        break;
      case 2:
        return {
          paddingLeft: wp(0.15),
          paddingTop: wp(0.15),
          paddingBottom: wp(0.15),
        };
        break;
    }
  };

  return (
    <View style={props.style}>
      {!internetConnectionInTheApp ? (
        <View style={styles.view1}>
          <View style={styles.lottieViewStyle}>
            <LottieView source={noInternet} />
          </View>
          <Text style={styles.textOffline}>You are offline</Text>
          <TouchableOpacity
            onPress={checkInternet}
            style={styles.touchable}
            activeOpacity={0.5}>
            <Text style={styles.retry}>RETRY</Text>
          </TouchableOpacity>
          <View style={styles.fakeView} />
        </View>
      ) : isReady ? (
        wonPhotosArray.length === 0 ? (
          <View style={styles.emptyInactive}>
            <Text style={styles.textEmptyInactive}>
              You don't have any chosen photos
            </Text>
            <Text style={styles.textEmptyInactiveSub}>
              The leading photo from every poll that expires will be displayed
              here.
            </Text>
          </View>
        ) : (
          <View style={styles.generalView}>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}>
              <View style={styles.container}>
                {wonPhotosArray.map((inactive, index) => {
                  return (
                    <TouchableOpacity
                      style={[styles.boxParent, calcPadding(index)]}
                      key={index}
                      onPress={() => {
                        modalTrue(index);
                        if (finishedPollArray.includes(inactive.uploadId))
                          setTimeout(
                            () =>
                              dispatch(
                                removeFinishedPollArray(inactive.uploadId),
                              ),
                            200,
                          );
                      }}
                      activeOpacity={0.9}>
                      {finishedPollArray.includes(inactive.uploadId) ? (
                        <View style={styles.viewFinishedPoll}>
                          <FastImage
                            style={styles.imageViewFinished}
                            source={trophyGray}
                          />
                        </View>
                      ) : null}
                      <FastImage
                        style={styles.box}
                        source={{uri: inactive.uri}}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <ModalInactive />
          </View>
        )
      ) : (
        <View style={styles.isReadyFalse}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  generalView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: config.WHITE,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  boxParent: {
    width: wp(100) / 3,
    height: wp(36.4),
  },
  box: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: config.WHITE,
  },
  textEmptyInactive: {
    fontSize: wp(3.8),
    color: config.SECONDARY_TEXT,
    marginHorizontal: wp(6),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textEmptyInactiveSub: {
    fontSize: wp(3.8),
    marginTop: wp(2),
    color: config.SECONDARY_TEXT,
    marginHorizontal: wp(8),
    textAlign: 'center',
  },
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fakeView: {
    marginTop: hp(5),
  },
  touchable: {
    width: wp(35),
    height: hp(6),
    marginTop: hp(3.5),
    borderWidth: wp(0.5),
    borderColor: config.PRIMARY_COLOUR,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3.5),
  },
  retry: {
    color: 'white',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  textOffline: {
    fontSize: wp(4),
  },
  isReadyFalse: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieViewStyle: {
    width: wp(90),
    height: wp(20),
  },
  viewFinishedPoll: {
    position: 'absolute',
    backgroundColor: '#000000CC',
    width: '100%',
    height: '100%',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewFinished: {
    height: '35%',
    width: '35%',
  },
});

export default InactiveUploads;
