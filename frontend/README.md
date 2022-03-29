<div id="top"></div>


<!-- ABOUT THE PROJECT -->
# Frontend

## Description

Our frontend is a native mobile application, operating on both Android and iOS platforms.


## Built With

This section includes the technologies, libraries and tools that we used for the development of the application. We selected the ones we consider that were critical and their absence would make our project more difficult.

### Main

-   [React Native](https://reactnative.dev/)   
We decided to work with React Native as it is a great way of creating multiplatform native applications. We were drawn to it partially due to the fact that there is a huge developer community that could support us whenever we needed, which is very important for a team creating its first production level application. Also, we found many great libraries that we thought could come in handy during the development of the app.

### Secondary

-   [Firebase SDK](https://firebase.google.com/)   
We utilised Firebase for a variety of tasks, such as Analytics (more details follow), performance monitoring and Deep Linking in our app. It provided us with solutions that were not available anywhere else, at a reasonable cost.

-   [React Navigation](https://reactnavigation.org/)   
We chose React Navigation as our main navigation solution as it is a widely used product, maintained by an active community of contributors and has excellent documentation for every usecase.

-   [Redux.js](https://redux.js.org/)
We used Redux for our state management and business logic. It is a widely used tool that we believe offers many advantages when compared to React Native's native state management.

-   [react-native-keychain](https://github.com/oblador/react-native-keychain)   
We used react-native-keychain as it is a reliable library that can securely store sensitive data on the users device, vital to our application's  operation.


### Analytics

-   [Firebase Analytics](https://firebase.google.com/docs/analytics)   
We used Firebase (Google) Analytics as it was easy to set up, cost effective, used by many projects similar to ours and is a product of a reliable company. We used several products of the Firebase SDK to track stats like audience, conversions, real time analytics and more technical details like performance reports and crashalytics.


### UI details 

-   [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image)   
We enhanced our image rendering and caching with react-native-fast-image, as it provides better performance compared to React Native's Image component when loading images from a remote source.

-   [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)   
Since our application needed custom Gesture Animations, we utilised the react-native-reanimated library as well as React Native's [Animated](https://reactnative.dev/docs/animated) library and [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler).

-   [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native)   
We spiced our UI up by using some animations from Lottie, which provided us with a huge variety of concepts to choose from.

-   [react-native-responsive-screen](https://www.npmjs.com/package/react-native-responsive-screen)
We utilized react-native-responsive-screen for our application's responsivenes. It is an basic tool that provides an easy way to make our app's UX consistent among various screen sizes.

<p align="right">(<a href="#top">back to top</a>)</p>

## Challenges
Some challenges that we faced and the ways we solved them:

---

:question: While uploading a poll, if the user exited the app the upload failed.

:heavy_check_mark: This had a different behaviour between the two platforms. While it worked as expected in Android (the upload did not fail), on iOS it was problematic. After thorough debugging and researching, we came to the conclusion that this happened because the operating system of Apple mobile devices had a more aggressive approach when removing applications from the foreground. We solved this by altering the application's permissions to remain on the foreground for a longer period, so that it could wrap up unfinished tasks like uploading images without draining the device's battery and resources.


---

:question: On Android, our app would take an average 8-12 seconds to move from the splash screen to the main application.

:heavy_check_mark: We used different approaches of tackling this problem. We considered the case that there was a mistake on our code, but we soon realised that this wasn't the case, since the problem was not present on iOS devices (average splash screen time was 1-2 seconds). We tried almost every possible performance optimisation such as minimizing bundle size, using the Hermes JavaScript engine and tried loading a smaller part of the application, but without success. After even more thorough debugging we found out that the problem occured due to **react-native-keychain** having a cold start period every time the app came to the foreground. We solved the issue by using a slightly older version of the tool, that did not use that approach.


---

:question: At the final stages of testing our app before releasing to production, we were concerned about whether all of our user would get a consistently good user experience and performance from our app.

:heavy_check_mark: Although we tested on different devices, it is impossible to have every single one covered. We set up Firebase Analytics on our app since it provides very decent analytic data, that we can use to monitor our application's performance. It also allows us to get detailed information on our audiences so that we could decide on new features for future updates.

---

:question: Even though our app was running smoothly on high end devices, we had significantly worse performance on lower end phones.

:heavy_check_mark: The solution to this problem was to go through the code base, refactor our code using newer and better practises so that we avoided unnecessary rerenders that hindered our performance. 


---

:question:  Custom Animated components not found in any library.

:heavy_check_mark: Instead of downgrading our design and settling for the components we found in libraries, we created our own reusable Animated Components, using react-native-reanimated, react-native-gesture-handler and React Native's Animated library.


<p align="right">(<a href="#top">back to top</a>)</p>
