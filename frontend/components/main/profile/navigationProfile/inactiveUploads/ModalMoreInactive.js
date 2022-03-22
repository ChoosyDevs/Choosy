import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import * as Keychain from 'react-native-keychain';
import {setInitialStateGeneral} from 'actions/generalActions.js';
import {setInitialStateHome} from 'actions/homeActions.js';
import {setInitialStateWelcome} from 'actions/welcomeActions.js';
import {
  setInitialStateProfile,
  setModalMoreInactiveUploads,
  setTappedPhotoSelectedPhotos,
  setModalInactiveUploads,
} from 'actions/profileActions.js';
import {discardUpload} from 'actions/uploadActions.js';
import {setInitialStateUser} from 'actions/userActions.js';
import {useSelector, useDispatch} from 'react-redux';
import {setUploadEnded} from 'actions/generalActions.js';

const ModalMoreInactive = React.memo((props) => {
  const dispatch = useDispatch();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const modalMoreInactiveUploads = useSelector(
    (state) => state.profile.modalMoreInactiveUploads,
  );

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthModalMoreInactive = () => {
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

  // Delete the upload
  const deleteUpload = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        if (!deleteLoading) {
          setDeleteLoading(true);
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
                id: props.uploadId,
              }),
            })
              .then((response) => {
                if (response.status === 200) {
                  setDeleteLoading(false);
                  dispatch(setModalMoreInactiveUploads(false));
                  setTimeout(() => {
                    dispatch(setModalInactiveUploads(false));
                  }, 300);
                  setTimeout(() => {
                    Alert.alert(
                      Platform.OS === 'ios'
                        ? 'Photo was deleted successfully.'
                        : '',
                      Platform.OS === 'ios'
                        ? ''
                        : 'Photo was deleted successfully.',
                      [{text: 'OK'}],
                      {cancelable: false},
                    );
                    dispatch(setTappedPhotoSelectedPhotos(0));
                    dispatch(setUploadEnded());
                  }, 600);
                } else if (response.status === 411) {
                  throw new Error('token');
                } else {
                  throw new Error('gen');
                }
              })
              .catch((err) => {
                if (err != 'Error: token') {
                  setDeleteLoading(false);
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
                  refreshAuthModalMoreInactive();
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

  const onCancelModalMore = () => {
    dispatch(setModalMoreInactiveUploads(false));
  };

  return (
    <Modal
      isVisible={modalMoreInactiveUploads}
      style={styles.modalStyle}
      backdropOpacity={0.5}
      onBackButtonPress={onCancelModalMore}
      onBackdropPress={onCancelModalMore}
      animationInTiming={200}
      animationOutTiming={200}
      useNativeDriverForBackdrop={true}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}>
      <View style={styles.modal2GenView}>
        <View style={styles.modal2SubView}>
          <View style={styles.modal2View1}>
            <Text style={styles.modal2DeletePost}>Delete photo?</Text>
            <Text style={styles.modal2Text}>
              If you choose to delete this photo, you will no longer see it in
              your profile.
            </Text>
          </View>
          <View style={styles.modal2Line} />
          <View style={styles.viewKap}>
            {deleteLoading ? (
              <View style={styles.modal2Touchable}>
                <ActivityIndicator color="black" size="small" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.modal2Touchable}
                onPress={deleteUpload}
                activeOpacity={0.5}>
                <Text style={styles.modal2Delete}>Delete</Text>
              </TouchableOpacity>
            )}
            <View style={styles.modal2Line} />
            <TouchableOpacity
              style={styles.modal2Touchable}
              onPress={onCancelModalMore}
              activeOpacity={0.5}>
              <Text style={styles.modal2DontDelete}>Don't delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
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
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  modal2Line: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: wp(0.1),
  },
  modal2Touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal2DontDelete: {
    fontSize: wp(4.35),
    color: '#007AFF',
  },
  modal2Delete: {
    fontSize: wp(4.35),
    color: '#FF453A',
    fontWeight: '600',
  },
});

export default ModalMoreInactive;
