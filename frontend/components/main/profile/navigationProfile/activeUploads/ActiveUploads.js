import React, { useCallback} from "react";
import { FlatList,  StyleSheet,TouchableOpacity, View, Platform,Alert,RefreshControl,ActivityIndicator} from "react-native";
import Text from 'config/Text.js'
import config from 'config/BasicConfig.json';
import CardActiveUploads from './CardActiveUploads.js'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import EmptyPostUploads from './EmptyPostUploads.js'
import ModalMore from './ModalMore.js'
import * as Keychain from 'react-native-keychain';
import NetInfo from "@react-native-community/netinfo"; 
import ModalPressPhoto from './ModalPressPhoto.js'
import { useSelector, useDispatch } from "react-redux";
import { setRefreshingProfile } from 'actions/profileActions.js'
import { setInternetConnectionInTheApp } from 'actions/generalActions.js'
import { setInitialStateGeneral} from 'actions/generalActions.js'
import { setInitialStateHome } from 'actions/homeActions.js'
import { setInitialStateWelcome } from 'actions/welcomeActions.js'
import { setInitialStateProfile } from 'actions/profileActions.js'
import { discardUpload } from 'actions/uploadActions.js'
import { setInitialStateUser} from 'actions/userActions.js'
import noInternet from 'assets/noInternet.json'
import PushNotification from "react-native-push-notification";

import LottieView from 'lottie-react-native';
import { setModalFinishedPoll, setFinishedPollArray, removeFinishedPollArray } from 'actions/profileActions.js'

const ActiveUploads = (props) => {
    
  const dispatch = useDispatch();    
  
  var activeUploadsArray = useSelector(state => {return state.profile.activeUploadsArray});
  var isReady = useSelector(state => {return state.profile.isReady});
  var refreshingProfile = useSelector(state => {return state.profile.refreshingProfile});
  var internetConnectionInTheApp = useSelector(state =>  state.general.internetConnectionInTheApp);

   // Function that formats the time the poll has been Active
   const  durationActive = (t0, t1) => {
    let d = (new Date(t0)) - (new Date(t1));
    let days         = Math.floor(d/1000/60/60/24);
    let hours        = Math.floor(d/1000/60/60                - days*24);
    let minutes      = Math.floor(d/1000/60                - days*24*60         - hours*60);

    if( (minutes === 0 && hours === 0 && days === 0) || minutes < 0 || hours < 0 || days < 0 ){
      return ['',"Moments left", '', '', ''];
    }
    if(minutes < 60 && hours <1 && days === 0){
      return [minutes,"m left", '', '', ''];
    }
    else if(hours === 1 && minutes === 0  && days === 0 ) {
      return [hours,"h left", '', '', '']
    }
    else if(hours === 1 && days === 0) {
      return [hours,"h", ' ', minutes, 'm left']
    }
    else if (hours >= 1 && hours < 24 && days < 1 && minutes === 0) {
      return [hours,"h left", '', '', ''];
    }
    else if (hours >= 1 && hours < 24 && days < 1) {
      return [hours,"h", ' ', minutes, 'm left'];
    }
    else if(days >= 1 && hours === 0) {
      return [days,"d left", '', '', ''];
    }
    else {
      return [days,"d", ' ', hours, 'h left'];
    }
}

  // All refresh auth functions are called when a fetch fails because of expired token
  // They create and store a new token and resend the failed fetch
  const refreshAuthActiveUploads =  (id) => {
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
              onChangeActiveMode(id)
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



    // Function called when user inactivates upload
   const onChangeActiveMode = useCallback(
    (id) => {
      NetInfo.fetch().then(state => {
        if(state.isConnected === true) {     
          Keychain.getGenericPassword().then(creds => creds.username).then(token => {    
            fetch(global.url + 'uploads/active', {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
              'Content-Type': 'application/json',
                Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                  id:  id
                }),
              })
              .then(response => {     
                if(response.status === 200) {
                  return response.json();          
                }
                else if(response.status === 411) {
                  throw new Error('token');
                }
                else {
                  throw new Error('gen');
                }
              })
              .then((res) => {
                dispatch(setModalFinishedPoll(true));
                dispatch(setFinishedPollArray(res));
                props.callLoadUploads(false) 
                PushNotification.cancelLocalNotifications({id: parseInt(id.substr(18), 16).toString() });
              })
              .catch((err) => {
                  if(err != "Error: token") {
                    Alert.alert(
                      Platform.OS === 'ios' ? "Please check your internet connection and try again." : "",
                      Platform.OS === 'ios' ? "" : "Please check your internet connection and try again.",
                      [
                        { text: "OK"}
                      ],
                      { cancelable: false }
                   );
                  }
                  else {
                    refreshAuthActiveUploads(id)
                  }
              })
            }) 
          }
        else {
          Alert.alert(
              Platform.OS === 'ios' ? "Please check your internet connection and try again." : "",
              Platform.OS === 'ios' ? "" : "Please check your internet connection and try again.",
              [
                { text: "OK"}
              ],
              { cancelable: false }
           );
        }
      }) 
    }
    ,[]
   )
      

    // Renders an Active Card component
  const renderItem = useCallback(
    ({ item ,index }) => {
      let timeSpec = null 
      timeSpec = durationActive(item.finalDate, new Date())
      return (
          <CardActiveUploads
            onChangeActiveMode={onChangeActiveMode}
            timeSpec={timeSpec}
            item={item}
            index={index}
          />
      )
    }
    ,[activeUploadsArray]
  )
    
  // Refreshes Actve uploads
 const onRefresh = () => {
  dispatch(setRefreshingProfile(true))
  props.callLoadUploads(true)
 }

 // Checks if there is internet connection
 const checkInternet = () => {
    NetInfo.fetch().then(state => {
    if(state.isConnected === true) {  
      dispatch(setInternetConnectionInTheApp(true))
      props.callLoadUploads(false)
    }
    else {
      //nothing
    }
  })
 }

  return (
      <View style={props.style} >
         {!internetConnectionInTheApp
          ? 
          <View style={styles.view1}>
            <View style={styles.lottieStyle}>
                <LottieView source={noInternet}   />
            </View>
            <Text style={styles.textOffline}>You are offline</Text>
           <TouchableOpacity onPress={checkInternet}  style={styles.touchable} activeOpacity={0.5}>
               <Text style={styles.retry}>RETRY</Text>
            </TouchableOpacity>
            <View style={styles.fakeView}/>
          </View>
          :
          ( isReady       
            ?  
              <View style={styles.container}>                 
                           
                    {activeUploadsArray.length === 0
                      ? <EmptyPostUploads/>
                      :
                      <View style={styles.viewStyle}>
                         <FlatList
                          initialNumToRender={3}
                          showsVerticalScrollIndicator ={false}
                          data={activeUploadsArray}
                          renderItem={renderItem}
                          contentContainerStyle={styles.contentContainer}
                          keyExtractor={(item, index) => item._id}
                          refreshControl={<RefreshControl
                            colors={["black"]}
                            progressBackgroundColor={'white'}
                            tintColor={config.BLACK}
                            onRefresh={onRefresh}
                            refreshing={refreshingProfile}
                            />
                          }
                        />
                         <ModalMore/>     
                         <ModalPressPhoto/>    
                      </View>
                    }
               </View>
            : (
              <View style={styles.isReadyFalse}>
               <ActivityIndicator size="large" color="black"/>
              </View>
              ) 
            )   
         }
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:config.WHITE,
  },
  contentContainer:{
    paddingBottom: wp(2)
  },
  viewStyle:{
    flex:1
  },
   touchable:{
    width:wp(35),
    height:hp(6),
    marginTop:hp(3.5),
    borderColor:config.PRIMARY_COLOUR,
    borderWidth:wp(0.5),
    backgroundColor:'black',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:wp(3.5)
  },
  retry:{
    color:'white',
    fontSize:wp(4),
    fontWeight:'bold'
  },
  view1:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  noInternetStyle:{
    width:60,
    height:60
  },
  fakeView:{
    marginTop:hp(5)
  },
  textOffline:{
    fontSize:wp(4)
  },
  isReadyFalse:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  lottieStyle:{
    width:wp(90),
    height:wp(20)
  }
});

export default ActiveUploads;
