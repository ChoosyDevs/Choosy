import React   from 'react';
import { StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import config from 'config/BasicConfig.json';
import Text from 'config/Text.js'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {  useDispatch } from "react-redux";
import Button from './Button.js'
import {  setRouteRegister, setLoading } from 'actions/welcomeActions.js'
import { setAges } from 'actions/userActions.js'

import DoubleSlider from "./DoubleSlider.js";

const AgeRangeScreen = ({navigation}) =>  {

  
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        // Prevent default behavior of leaving the screen
        //e.preventDefault();

        // Prompt the user before leaving the screen
        dispatch(setRouteRegister("UsernamePassword"))
        
      }),
    []
  );

  const dispatch = useDispatch();    

  // Save age range
  const setAgesRedux = (ages) => {
      dispatch(setAges(ages))
  }
  
  // Go to next register page
  const goNext = () => {
    dispatch(setRouteRegister('birthday'))
    navigation.navigate('Birthday')
  }

  // Go to previous register page
  const goBack = () => {
    dispatch(setRouteRegister('UsernamePassword'))
    navigation.navigate('UsernamePassword')
  }



    return (
      <View style={styles.container} activeOpacity={1} >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sign up</Text>
          </View>
          <View style={styles.titleSmallContainter}>
            <Text style={styles.titleSmall}>Target audience age range</Text>
          </View> 
          <View style={styles.textContainer}>
            <Text style={styles.text}>This is the age range of those users who will be able to see and choose photos from your polls. This information is only available to you.</Text>
          </View>   
          <DoubleSlider onChange={setAgesRedux} targetAgesBefore={[13, 10000]} />
          <Button text={'Next' } style={styles.button} transparent={false} onPress={goNext} />
          <TouchableOpacity style={styles.backStyle} onPress={goBack}>
              <Text style={styles.textBack}>Back</Text>
          </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex:1,
      justifyContent:'flex-start',
      backgroundColor: config.WHITE
    },
    logoContainer: {
      width:wp(39),
      height:wp(11),
      marginBottom:wp(4)
    },
    logo: {
      flex:1
    },
     backStyle:{
      width:wp(14),
      marginTop:wp(6),
      alignSelf:'center',
      alignItems:'center',
      justifyContent:'center'
    },
    textBack:{
      fontSize:wp(4),
      fontWeight:"600",
      color:config.BLACK
    },
    textInput: {
      width:wp(88),
      height:wp(12),
      alignSelf:'center',
      borderWidth:1,
      borderRadius:wp(2),
      marginTop:wp(4),
      fontSize:wp(3.58),
      paddingLeft:wp(6.15),
      paddingRight:wp(6.15),
      fontWeight:'400',
      color:'#01161E'
        },
    button: {
      marginTop:wp(8),
      alignSelf:'center'
    },
    titleContainer: {
      marginTop:wp(13),
      marginLeft:wp(6)
    },
    title: {
      fontWeight: Platform.OS === 'ios' ? "600" : "bold",
      fontSize:wp(7),
      color: config.PRIMARY_TEXT,
    },
    titleSmallContainter: {
      marginTop:wp(14.3),
      marginLeft:wp(6)
    },
    errorMessageContainer: {
      marginTop:wp(2),
      marginLeft:wp(6)
    },
    titleSmall: {
      fontWeight: Platform.OS === 'ios' ? "600" : "bold",
      fontSize:wp(4.1),
      color: "#01161E",
    },
    errorMessage: {
      fontWeight: Platform.OS === 'ios' ? "400" : "normal",
      fontSize:wp(3.5),
      color: "#D51010",
    },
    textContainer: {
        marginTop:wp(1),
        marginRight:wp(6),
        marginLeft:wp(6),
    },
    text: {
        fontWeight: Platform.OS === 'ios' ? "600" : "normal",
        fontSize:wp(3.5),
        color: config.SECONDARY_TEXT,
        textAlign:'justify'
      },

    

  })



  export default AgeRangeScreen;
