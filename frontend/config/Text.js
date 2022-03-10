import React from 'react';
import {Text, StyleSheet, Platform} from 'react-native';

// App Text is declared to avoid font size getting to big in android phones with Font Size bigger than normal
// and to set desired font size
function AppText(props) {
  return (
    <Text
      maxFontSizeMultiplier={1.1}
      ellipsizeMode="tail"
      numberOfLines={props.oneLine ? 1 : null}
      suppressHighlighting={true}
      onPress={props.onPress}
      style={[styles.text, props.style]}
      {...props}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'SF-Pro',
  },
});

export default AppText;
