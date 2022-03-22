import React, {useRef} from 'react';
import {View, StyleSheet, Animated, Platform} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';
import {useSelector, useDispatch} from 'react-redux';
import {setTappedPhotoSelectedPhotos} from 'actions/profileActions.js';
import {PanGestureHandler, FlatList} from 'react-native-gesture-handler';

const ModalInactiveScrollView = (props) => {
  const dispatch = useDispatch();
  const tappedPhoto = useSelector((state) => state.profile.tappedPhoto);

  let scrollX = useRef(new Animated.Value(tappedPhoto * wp(100))).current;
  let localIndex = useRef(tappedPhoto * wp(100));
  let flatlistRef = useRef();
  let scrollDownGesture = useRef();

  const onGestureEvent = (event) => {
    props.scrollDown.current.setValue(event.nativeEvent.translationY);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) {
      if (
        event.nativeEvent.translationY > 100 ||
        event.nativeEvent.velocityY > 1000
      ) {
        props.closeModalInactive();
      }
      props.scrollDown.current.setValue(0);
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <PanGestureHandler
        enabled={Platform.OS === 'ios'}
        ref={scrollDownGesture}
        failOffsetX={[-50, 50]}
        activeOffsetY={50}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        simultaneousHandlers={flatlistRef}>
        <View key={index} style={styles.viewMapImages}>
          <FastImage
            style={styles.imageStyle}
            source={{uri: item.uri}}
            resizeMode={'contain'}
          />
        </View>
      </PanGestureHandler>
    );
  };

  const getItemLayout = (data, index) => ({
    length: wp(100),
    offset: wp(100) * index,
    index,
  });

  return (
    <FlatList
      data={props.photos}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      initialScrollIndex={tappedPhoto}
      showsHorizontalScrollIndicator={false}
      horizontal
      pagingEnabled
      keyExtractor={(item, index) => item.uploadId}
      bounces={false}
      onScroll={Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
        useNativeDriver: false,
        listener: (event) => {
          if (
            localIndex.current !==
            Math.round(event.nativeEvent.contentOffset.x / wp(100))
          ) {
            localIndex.current = Math.round(
              event.nativeEvent.contentOffset.x / wp(100),
            );
            dispatch(
              setTappedPhotoSelectedPhotos(
                Math.round(event.nativeEvent.contentOffset.x / wp(100)),
              ),
            );
          }
        },
      })}
      scrollEventThrottle={16}
    />
  );
};

export default ModalInactiveScrollView;

const styles = StyleSheet.create({
  viewMapImages: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: wp(100),
    height: hp(100),
  },
});
