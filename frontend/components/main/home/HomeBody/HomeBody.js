import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Text from 'config/Text.js';
import config from 'config/BasicConfig.json';
import Modal from 'react-native-modal';
import HomeBodyHeader from './HomeBodyHeader.js';
import HomeCarousel from './HomeCarousel.js';
import {useSelector, useDispatch} from 'react-redux';
import FastImage from 'react-native-fast-image';
import arrowRight from 'assets/arrowRight.png';
import {
  setMoreModalVisible,
  setTappedButtonModalMore,
  setReportPressed,
  setHideThisUserPressed,
  setLoadingReports,
} from 'actions/homeActions.js';

const HomeBody = React.memo((props) => {
  const dispatch = useDispatch();

  const currentIndex = useSelector((state) => state.home.currentIndex);
  const loadingReports = useSelector((state) => state.home.loadingReports);
  const moreModalVisible = useSelector((state) => state.home.moreModalVisible);
  const tappedButtonModalMore = useSelector(
    (state) => state.home.tappedButtonModalMore,
  );
  const reportPressed = useSelector((state) => state.home.reportPressed);
  const hideThisUserPressed = useSelector(
    (state) => state.home.hideThisUserPressed,
  );

  const openMoreModal = () => {
    dispatch(setMoreModalVisible(true));
  };

  const closeMoreModal = () => {
    dispatch(setMoreModalVisible(false));
  };

  // Close dialogue modal and perform the report/hide action
  const closeSecondModal = () => {
    setTimeout(() => {
      if (reportPressed) {
        dispatch(setReportPressed(false));
      }
      if (hideThisUserPressed) {
        dispatch(setHideThisUserPressed(false));
      }
    }, 250);
    dispatch(setTappedButtonModalMore(false));
  };

  // Report poll
  const reportSubmition = () => {
    dispatch(setLoadingReports(true));
    props.onReport(currentIndex);
  };

  // Never show polls from this user again
  const hideThisUserSubmittion = () => {
    dispatch(setLoadingReports(true));
    props.onHatedUsers(currentIndex);
  };

  // Actions when "Report" is pressed
  const onPressReport = () => {
    dispatch(setMoreModalVisible(false));
    dispatch(setReportPressed(true));
    setTimeout(() => {
      dispatch(setTappedButtonModalMore(true));
    }, 250);
  };

  // Actions when "Hide this user" is pressed
  const onPressHideThisUser = () => {
    dispatch(setMoreModalVisible(false));
    dispatch(setHideThisUserPressed(true));
    setTimeout(() => {
      dispatch(setTappedButtonModalMore(true));
    }, 250);
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={moreModalVisible}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        onBackButtonPress={closeMoreModal}
        onBackdropPress={closeMoreModal}
        animationInTiming={200}
        animationOutTiming={200}
        onSwipeComplete={closeMoreModal}
        swipeDirection="down"
        useNativeDriverForBackdrop={true}>
        <View style={styles.genModalView}>
          <View style={styles.modalHeader}>
            <View style={styles.headerView} />
          </View>
          <View style={styles.bodyView}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={onPressReport}
              activeOpacity={0.5}>
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.hideUserButton}
              onPress={onPressHideThisUser}
              activeOpacity={0.5}>
              <Text style={styles.hideUserButtonText}>Hide this user</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSafeAreaFake} />
        </View>
      </Modal>
      <Modal
        isVisible={tappedButtonModalMore}
        style={styles.secondModal}
        onBackButtonPress={closeSecondModal}
        backdropOpacity={0.5}
        animationInTiming={200}
        animationOutTiming={200}
        useNativeDriverForBackdrop={true}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}>
        {loadingReports ? (
          <View style={styles.indicatorStyle}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : hideThisUserPressed ? (
          <View style={styles.containerModal}>
            <View style={styles.modal2SubView}>
              <View style={styles.modal2View1}>
                <Text style={styles.modal2DeletePost}>Hide this user?</Text>
                <Text style={styles.modal2Text}>
                  Hiding this user means that you will no longer see his posts.
                </Text>
              </View>
              <View style={styles.modal2Line} />
              <View style={styles.viewKap}>
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={hideThisUserSubmittion}>
                  <Text style={styles.modal2Delete}>Hide</Text>
                </TouchableOpacity>
                <View style={styles.modal2Line} />
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={closeSecondModal}>
                  <Text style={styles.modal2DontDelete}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.containerModalReport}>
            <View style={styles.modal2SubView}>
              <View style={styles.modal2View1Report}>
                <Text style={styles.modal2DeletePost}>Report?</Text>
                <Text style={styles.modal2Text}>
                  By pressing report you declare that the content of the current
                  poll is against our Terms of Service and should be reviewed by
                  our moderators.
                </Text>
              </View>
              <View style={styles.modal2Line} />
              <View style={styles.viewKap}>
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={reportSubmition}>
                  <Text style={styles.modal2Delete}>Report</Text>
                </TouchableOpacity>
                <View style={styles.modal2Line} />
                <TouchableOpacity
                  style={styles.modal2Touchable}
                  onPress={closeSecondModal}>
                  <Text style={styles.modal2DontDelete}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      <HomeBodyHeader openMoreModal={openMoreModal} />
      <HomeCarousel
        firstTouch={props.firstTouch}
        counterKap={props.counterKap}
        onVote={props.onVote}
        photoIndex={props.photoIndex}
        seenAllPhotos={props.seenAllPhotos}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 8,
  },
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  genModalView: {
    width: wp(100),
    height: hp(19),
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopLeftRadius: wp(4.6),
    borderTopRightRadius: wp(4.6),
  },
  modalHeader: {
    flex: 0.35,
    marginTop: '2%',
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
  indicatorStyle: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(4.6),
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    width: '100%',
    height: '40%',
    paddingLeft: wp(8),
    justifyContent: 'center',
  },
  secondModal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportText: {
    fontSize: wp(4.6),
    color: config.BLACK,
    fontWeight: '400',
  },
  hideUserButton: {
    width: '100%',
    height: '40%',
    paddingLeft: wp(8),
    justifyContent: 'center',
  },
  hideUserButtonText: {
    fontSize: wp(4.6),
    fontWeight: '400',
    color: config.BLACK,
  },
  bottomSafeAreaFake: {
    flex: 1,
  },
  containerModal: {
    width: wp(69.2),
    height: hp(23.7),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
  },
  containerModalReport: {
    width: wp(69.2),
    height: hp(30.7),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
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
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2SubView: {
    flex: 1,
  },
  modal2View1: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2View1Report: {
    flex: 2.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2DeletePost: {
    color: config.BLACK,
    fontSize: wp(4.35),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    textAlign: 'center',
    marginHorizontal: wp(5.92),
  },
  viewKap: {
    flex: 2,
  },
  containerModal: {
    width: wp(69.2),
    height: hp(23.7),
    backgroundColor: config.WHITE,
    marginHorizontal: wp(15.3),
    borderRadius: wp(4.6),
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

export default HomeBody;
