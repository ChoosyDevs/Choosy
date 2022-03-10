import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import config from 'config/BasicConfig.json';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';
import cross from 'assets/cross.png';
import tick from 'assets/tick.png';
import {useSelector, useDispatch} from 'react-redux';

const SelectedPhotos = React.memo((props) => {
  const [deleteMode, setDeleteMode] = useState(false);
  const photos = useSelector((state) => state.upload.photos);
  const arrayOfDeletedPhotos = useSelector(
    (state) => state.upload.arrayOfDeletedPhotos,
  );
  const deleteNumber = useSelector(
    (state) => state.upload.arrayOfDeletedPhotos.length,
  );

  const changeMode = (prop) => {
    props.functionAddInDeletedArray(prop);
    setDeleteMode(true);
  };

  const addImagesFunction = () => {
    props.addSelectedImages();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        bounces={false}
        scrollEventThrottle={16}
        style={styles.scrollStyle}>
        {!deleteMode || deleteNumber === 0
          ? photos.map((photo, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.touchableMapImages}
                  activeOpacity={0.9}
                  onLongPress={() => changeMode(photo.uri)}>
                  <FastImage
                    style={styles.imageStyle}
                    source={{uri: photo.uri}}
                    resizeMode={'cover'}
                  />
                </TouchableOpacity>
              );
            })
          : photos.map((photo, index) => {
              return (
                <View key={index} style={styles.touchableMapImages}>
                  <TouchableWithoutFeedback
                    activeOpacity={0.9}
                    onPress={() => props.functionAddInDeletedArray(photo.uri)}>
                    {!arrayOfDeletedPhotos.includes(photo.uri) ? (
                      <FastImage
                        style={styles.imageStyle}
                        source={{uri: photo.uri}}
                        resizeMode={'cover'}
                      />
                    ) : (
                      <View>
                        <FastImage
                          style={styles.imageStyle}
                          source={{uri: photo.uri}}
                          resizeMode={'cover'}
                        />
                        <View style={styles.viewTick}>
                          <FastImage
                            source={tick}
                            style={styles.imageTick}
                            resizeMode={'contain'}
                          />
                        </View>
                      </View>
                    )}
                  </TouchableWithoutFeedback>
                </View>
              );
            })}
        {photos.length < 5 ? (
          <View style={styles.viewAddPhotos}>
            <TouchableOpacity
              style={styles.touchableAddPhotos}
              activeOpacity={0.5}
              onPress={addImagesFunction}>
              <Image source={cross} style={styles.crossImageStyle} />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.viewAddPhotos,
              {width: wp(2 * 2.05) + wp(4.1)},
            ]}></View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 7.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollStyle: {
    paddingLeft: wp(2.05),
  },
  touchableMapImages: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(4.1),
  },
  imageStyle: {
    width: wp(76.15),
    height: hp(35.9),
    borderRadius: 8,
  },
  viewAddPhotos: {
    width: wp(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableAddPhotos: {
    width: wp(16.4),
    height: wp(16.4),
    borderColor: '#DCDCDC',
    borderWidth: 1,
    borderRadius: wp(16.4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossImageStyle: {
    width: wp(6.05),
    height: wp(6.05),
  },
  viewTick: {
    width: wp(5.12),
    height: wp(5.12),
    position: 'absolute',
    right: wp(4.1),
    top: wp(4.1),
    backgroundColor: config.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: config.PRIMARY_COLOUR,
  },
  imageTick: {
    width: wp(2.3),
    height: 8,
    zIndex: 1,
  },
});

export default SelectedPhotos;
