import React from 'react';
import { Image, StyleSheet } from 'react-native';
import instagram from 'assets/instagram.png'
import instagramBlack from 'assets/instagramBlack.png'
import twitter from 'assets/twitter.png'
import twitterBlack from 'assets/twitterBlack.png'
import facebook from 'assets/facebook.png'
import facebookBlack from 'assets/facebookBlack.png'
import pinterest from 'assets/pinterest.png'
import pinterestBlack from 'assets/pinterestBlack.png'
import snapchat from 'assets/snapchat.png'
import snapchatBlack from 'assets/snapchatBlack.png'
import linkedin from 'assets/linkedin.png'
import linkedinBlack from 'assets/linkedinBlack.png'
import tinder from 'assets/tinder.png'
import tinderBlack from 'assets/tinderBlack.png'


import FastImage from 'react-native-fast-image';


// Function that takes social media name and returns its icon in dark or light mode
function SocialMediaIcon(props) {
    let source;
    if(props.dark){
        switch(props.socialMedia){
            case "Twitter":
                source = twitterBlack;
                break;
            case "Instagram":
                source = instagramBlack;
                break;
            case "Tinder":
                source = tinderBlack;
                break;
            case "Facebook":
                source = facebookBlack;
                break;    
            case "Pinterest":
                source = pinterestBlack;
                break;
            case "Snapchat":
                source = snapchatBlack;
                break;   
            case "LinkedIn":
                source = linkedinBlack;
                break;     
            default:
                source = null;
                break;        
        }
    }
    else {
        switch(props.socialMedia){
            case "Twitter":
                source = twitter;
                break;
            case "Instagram":
                source = instagram;
                break;
            case "Tinder":
                source = tinder;
                break;
            case "Facebook":
                source = facebook;
                break;    
            case "Pinterest":
                source = pinterest;
                break;
            case "Snapchat":
                source = snapchat;
                break;   
            case "LinkedIn":
                source = linkedin;
                break;     
            default:
                source = null;
                break;        
        }
    
    }

    return (
        <FastImage source={source} style={[styles.icon, props.style]} resizeMode="contain" />          
    )
}

const styles = StyleSheet.create({
    icon: {
      resizeMode:'contain'
    },
  });
  

export default SocialMediaIcon;