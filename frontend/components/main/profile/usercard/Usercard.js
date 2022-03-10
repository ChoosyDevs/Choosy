import React , {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Text from 'config/Text.js'
import config from 'config/BasicConfig.json';
import Shape from 'assets/Shape.png'
import instagramAcc from 'assets/instagramAcc.png'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import PlusButton from "./PlusButton.js";
import { setThumbnail } from 'actions/userActions.js'
import { useDispatch } from "react-redux";
import ImagePicker from 'react-native-image-crop-picker'
import * as Keychain from 'react-native-keychain';
import { useSelector } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import {request, PERMISSIONS  ,openSettings ,check ,RESULTS} from 'react-native-permissions';
import { setInitialStateGeneral} from 'actions/generalActions.js'
import { setInitialStateHome } from 'actions/homeActions.js'
import { setInitialStateWelcome } from 'actions/welcomeActions.js'
import { setInitialStateProfile, setInstagramLoginModal, setInstagramLogin } from 'actions/profileActions.js'
import { discardUpload } from 'actions/uploadActions.js'
import { setInitialStateUser, setInstagramName} from 'actions/userActions.js'
import Analytics from 'analytics/Analytics.js'
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';


const Usercard = React.memo(props => {
  const dispatch = useDispatch();
  const [loading,setLoading] = useState(false)
  var thumbnail = useSelector(state => {return state.user.thumbnail});

  // Check for device permissions
  const checkPermissionsFunctionUsercard = () => { 
       check(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
            .then((result) => {
              switch (result) {
                case RESULTS.UNAVAILABLE:
                  Alert.alert(
                    Platform.OS === 'ios' ? "This feature is not available on this device." : "",
                    Platform.OS === 'ios' ? "" : "This feature is not available on this device.",
                    [
                      { text: "OK"}
                    ],
                    { cancelable: false }
                  );
                  break;
                case RESULTS.DENIED:
                  request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then((result) => { 
                     if(result === 'granted' || result === 'limited') {
                        openPickerFunction()
                      }
                      else if(result === 'blocked') {
                         Alert.alert(
                          "Enable photo library access",
                          "Enable access to all photos so you can upload polls with them.",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            { text: "OK", onPress: () => openSettings()}
                          ],
                          { cancelable: false }
                        );
                      }
                      else {
                        
                      }
                  })
                  break;
                case RESULTS.LIMITED:
                    openPickerFunction()
                  break;
                case RESULTS.GRANTED:
                    openPickerFunction()
                  break;
                case RESULTS.BLOCKED:
                  Alert.alert(
                      "Enable photo library access",
                      "Enable access to all photos so you can upload polls with them.",
                      [
                        {
                          text: "Cancel",
                          style: "cancel"
                        },
                        { text: "OK", onPress: () => openSettings()}
                      ],
                      { cancelable: false }
                    );
                  break;
              }
            })
          }


  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthUsercard =  ( func, image) => {
    Keychain.getGenericPassword().then(creds => creds.password).then(refreshToken => {    
      fetch(global.url_auth + 'token', {
           method: 'POST',
           headers: {
            Accept: 'application/json',
           'Content-Type': 'application/json',
            Authorization: "Bearer " + refreshToken
            } 
          })
           .then(res => {
             if(res.status === 412) {
                  throw new Error('banned');
                }
                else if(res.status === 201){
                  return res.json()
                }
                else {
                   throw new Error('gen');
                }
              }
            )
          .then( async response => {
                try {
                   await Keychain.setGenericPassword(response.token, response.refreshToken);                           
                  } 
                   catch (e) {
                     //null
               }            
            })
            .then(data => {
              if(func == "uploadImage"){
                uploadAvatar(image)
              }else if(func == "instaUnlink"){
                changeInstagramName('')
              }
              
            })
           .catch((err) => {
              if(err == "Error: banned") {
                 Alert.alert(
                      Platform.OS === 'ios' ? "Your account is no longer active due to inappropriate posts." : "",
                      Platform.OS === 'ios' ? "" : "Your account is no longer active due to inappropriate posts.",
                      [
                         { text: "OK", onPress: () => {
                          dispatch(setInitialStateGeneral())
                          dispatch(setInitialStateHome())
                          dispatch(setInitialStateUser())
                          dispatch(setInitialStateWelcome())
                          dispatch(discardUpload())
                          dispatch(setInitialStateProfile())
                        }}
                      ],
                      { cancelable: false }
                    );
                }
             })
        })   
    }

    // Open image picker from device
   const openPickerFunction = () => {
      ImagePicker.openPicker({
          multiple: false,
          waitAnimationEnd:false,
          mediaType:'photo',  
          compressImageMaxWidth:1024,
          compressImageQuality:0.7,
          forceJpg:true,
         })
         .then(image => {
            setLoading(true)
            uploadAvatar(image)
          })
        .catch(e => {
            {}
          })
     }

     
     // Upload new Profile picture
    const uploadAvatar = (image) => {
       NetInfo.fetch().then(state => {
          if(state.isConnected === true) {   
            const formData = new FormData();
              formData.append('avatar', {
                uri:  image.path,
                type: image.mime,
                name: image.path
              })
            Keychain.getGenericPassword().then(creds => creds.username).then(token => {
              fetch(global.url + 'uploads/profileAvatar' , {
                method: 'POST',
                headers: {
                  Authorization: "Bearer " + token
                }, 
                body: formData
              })
              .then(response => {
                 if(response.status === 201) { 
                   //send profile_photo_change event to analytics
                  Analytics.onProfilePhotoChange();
                  setLoading(false)
                  dispatch(setThumbnail(image.path))       

                 } 
                 else if (response.status === 411){
                   throw new Error('token')
                 }
                 else {
                   throw new Error('gen')
                 }
              })
              .catch((err) => {
                if(err != 'Error: token'){
                  setLoading(false)
                  Alert.alert(
                    Platform.OS === 'ios' ? "Oops! Check your internet connection." : "",
                    Platform.OS === 'ios' ? "" : "Oops! Check your internet connection.",
                    [
                      { text: "OK"}
                    ],
                    { cancelable: false }
                  );
                 }
                else {
                  refreshAuthUsercard( "uploadImage", image)
                }
              })
            })
          }
          else {
            setLoading(false)
            Alert.alert(
              Platform.OS === 'ios' ? "Oops! Check your internet connection." : "",
              Platform.OS === 'ios' ? "" : "Oops! Check your internet connection.",
              [
                { text: "OK"}
              ],
              { cancelable: false }
            );
          }
        })
      }

    return (
    <View style={styles.container}>
      <View style={[styles.profileImageContainer, (/*instagramName ? */ {width:wp(30), height:wp(30)} /* : {height:'55%', position:'absolute', top:'15%'}*/ ) ]} >
       {loading 
        ?
          <View style={styles.indicatorStyle}>
            <ActivityIndicator color={config.PRIMARY_COLOUR} size="large"/>
          </View>
        : null
       }
       {thumbnail === '' 
        ? <Image  style={styles.profileImageThumbnail} source={Shape}/> 
        : <FastImage style={styles.profileImage} source={{ uri: thumbnail, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover} />
       }
        
        <TouchableOpacity style={styles.addButton} onPress={checkPermissionsFunctionUsercard} activeOpacity={.5} > 
          <PlusButton />
        </TouchableOpacity>
      </View>  

    </View>
    )
})

const styles = StyleSheet.create({
  container: {
    flex: 2.3,
    justifyContent:'center',
    alignItems:'center',
  },
  profileImageContainer: {
    
    bottom:wp(1),
    aspectRatio:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#29CCBB1A',
    borderRadius: wp(4.6)
  },
  profileImage: {
    width:'100%',
    height:'100%',
    resizeMode:'cover',
    borderRadius: wp(4.6)
  }, 
  addButton: {
    width:2*wp(5.6),
    height:2*wp(5.6),
    position:'absolute',
    right:-wp(2.8), 
    bottom:-wp(2.8) - 4,
    alignItems:'center',
    justifyContent:'center',
  },  
      indicatorStyle:{
      position:'absolute',
      zIndex:1,
      },
  profileImageThumbnail: {
    width:'60%',
    height:'80%',
    resizeMode:'contain',
  },

});

export default Usercard;