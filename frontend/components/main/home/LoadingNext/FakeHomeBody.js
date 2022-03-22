import React from 'react';
import {
  View,
  StyleSheet,
  Image
} from 'react-native';
import config from 'config/BasicConfig.json'
import Text from 'config/Text.js';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';
import more from 'assets/more.png'


const FakeHomeBody = (props) => {


    const upload = props.upload;
    const photos = props.upload.photos;
    const photosCount = photos.length;

    // Calculate photo dimensions
    const calcPhotoWidthAndHeight = (photo) => {
        var ratio = photo.height/photo.width;
        var width = 0;
        var height = 0;
        
        width = wp(87);
        height = ratio*wp(87);
      
        return {width: wp(87), height: ratio < 1 ? height : '88%' }
   }

    return (
        <View style={[StyleSheet.absoluteFill, { alignItems:'center', justifyContent:"center", backgroundColor:'white', paddingBottom:wp(18), flexDirection:'row'}]}>
            <View style={ [StyleSheet.absoluteFill,{bottom:'14%', alignItems:"center", justifyContent:"center"}]}>
            <View  style={{width:wp(88),  height:'7%',  flexDirection:'row' }} >
                <View style={styles.profileImage}/>
                <View style={styles.nameTimeContainer} >
                    <Text style={styles.name}>{upload.ownerName}</Text>
                    <Text style={styles.time}>23 hours ago</Text>
                </View>
                <View  style={styles.more}>
                    <Image source={more} style={styles.moreImage} />
                </View>
            </ View>  
            <View style={{width:wp(100), height:'93%', marginBottom:'5%', alignItems:'center', justifyContent:"center" }}>
                {
                    props.photoIndex > 0
                    ?
                    <FastImage
                    // ref="fastImage"
                    source={{
                        uri: photos[props.photoIndex-1].uri,
                        priority: FastImage.priority.normal,
                    }}

                    style={[calcPhotoWidthAndHeight(photos[props.photoIndex-1]), {position:'absolute',left:-(calcPhotoWidthAndHeight(photos[props.photoIndex-1]).width)+wp(4), borderRadius:wp(6.1)}]}
                    resizeMode={FastImage.resizeMode.cover}
                />
                    :
                        null
                }
                <FastImage
                    // ref="fastImage"
                    source={{
                        uri: photos[props.photoIndex].uri,
                        priority: FastImage.priority.normal,
                    }}

                    style={[calcPhotoWidthAndHeight(photos[props.photoIndex]), {position:'absolute', borderRadius:wp(6.1)}]}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {
                    props.photoIndex < photos.length-1
                    ?
                        <FastImage
                            // ref="fastImage"
                            source={{
                                uri: photos[props.photoIndex+1].uri,
                                priority: FastImage.priority.normal,
                            }}

                            style={[calcPhotoWidthAndHeight(photos[props.photoIndex+1]), {position:'absolute',right:-(calcPhotoWidthAndHeight(photos[props.photoIndex+1]).width)+wp(4), borderRadius:wp(6.1)}]}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    :
                        null
                }
            </View>
            </View>
            <View style={{height:'14%', width:wp(88), position:'absolute', bottom:0}} >
                <View style={styles.chooseButton} />
            </View>  
        </View>  
    )
}

export default FakeHomeBody;

const styles = StyleSheet.create({
    profileImage: {
        width:wp(8),
        height:wp(8),
        borderRadius:100,  
        aspectRatio:1,
        backgroundColor:"gray",
        position:'absolute',
        left:0,
        bottom:0
      },
      nameTimeContainer: {
          position: 'absolute',
          bottom: 0, 
          left: wp(10),
          textAlign:'left'
      },
      name: {
          color: config.BLACK,
          fontWeight: "600",
          fontSize: wp(3.5)
      },
      time: {
        color: "#696D7D",
        fontWeight: "400",
        fontSize: wp(2.8)
      },
      more: {
        width:3*wp(4),
        height:4*wp(2),
        position:'absolute',
        right:-wp(4),
        bottom: '6.5%',
        alignItems:'center',
        justifyContent:'center',
      },
      moreImage: {
          width:'33.3333%',
          height:'25%',
          resizeMode:'contain'
      },
      chooseButton: {
        width:wp(53),
        height:'56%',
        position:'absolute',
        bottom:'33%',
        backgroundColor:config.BLACK,
        borderRadius: wp(4),
        opacity:0.7
      },
})