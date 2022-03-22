import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toggle from '../PostDuration/Toggle.js';
import Tick from './Tick.js';
import {useDispatch, useSelector} from 'react-redux';
import {setMedia} from 'actions/uploadActions.js';
import {setPreferToggle, setScreenName} from 'actions/uploadActions.js';
import {useFocusEffect} from '@react-navigation/native';

const SocialMedia = [
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Tinder',
  'Pinterest',
  'Twitter',
  'Snapchat',
];

function TargetSocialMedia({navigation}) {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        dispatch(setScreenName('TargetGroupsScreen'));
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const dispatch = useDispatch();
  const reduxUploadState = useSelector((state) => state.upload);

  const preferToggle = reduxUploadState.preferToggle;
  const targetSocialMedia = reduxUploadState.targetSocialMedia;

  const toggleSwitch = () => {
    dispatch(setPreferToggle());
  };

  // Select targeted social media
  const FunctionAddInselectedMediaArray = (media) => {
    if (targetSocialMedia.includes(media)) {
      let array = targetSocialMedia.filter((item) => {
        return item !== media;
      });
      dispatch(setMedia(array));
    } else {
      var joined = targetSocialMedia.concat(media);
      dispatch(setMedia(joined));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textIntendedForStyle}>Intended for</Text>
      <View style={styles.viewToggle}>
        <Text style={styles.textPrefer}>Prefer not to say</Text>
        <View style={styles.toggle}>
          <Toggle isOn={preferToggle} onToggle={toggleSwitch} />
        </View>
      </View>
      {preferToggle ? null : (
        <ScrollView persistentScrollbar={true} style={styles.scrollview}>
          {SocialMedia.map((media, index) => {
            return (
              <View style={styles.itemContainer} key={index}>
                <View style={styles.item}>
                  <Text style={styles.text}>{media}</Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.button}
                    onPress={() => FunctionAddInselectedMediaArray(media)}>
                    {targetSocialMedia.includes(media) ? (
                      <Tick style={styles.box} />
                    ) : (
                      <View
                        style={[
                          styles.box,
                          {
                            borderWidth: 1,
                            borderRadius: wp(1),
                            borderColor: '#DCDCDC',
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {index !== SocialMedia.length - 1 ? (
                  <View style={styles.divider} />
                ) : (
                  <View
                    style={[styles.divider, {borderBottomColor: 'transparent'}]}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
      <View style={{flex: 0.1}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.WHITE,
  },
  textIntendedForStyle: {
    marginTop: hp(3.91),
    marginLeft: wp(6.15),
    fontSize: wp(4),
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: config.BLACK,
  },
  viewToggle: {
    marginHorizontal: wp(6.15),
    marginTop: hp(4.5),
    justifyContent: 'center',
  },
  textPrefer: {
    position: 'absolute',
    left: 0,
    fontWeight: '400',
    fontSize: wp(3.4),
  },
  toggle: {
    position: 'absolute',
    right: 0,
  },
  scrollview: {
    flex: 1,
    bottom: 0,
    marginTop: hp(4.3),
  },
  itemContainer: {
    marginTop: hp(2),
  },
  item: {
    marginHorizontal: wp(6.15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: wp(3.5),
    fontWeight: '400',
    width: wp(30),
  },
  divider: {
    marginHorizontal: wp(6.15),
    borderBottomColor: '#E8E8E8',
    borderBottomWidth: 1,
    marginTop: hp(2.59),
  },
  button: {
    width: 2 * wp(5.6),
    height: 2 * wp(5.6),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -wp(2.8),
  },
  box: {
    width: '50%',
    height: '50%',
  },
});

export default TargetSocialMedia;
