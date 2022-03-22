import analytics, { firebase } from '@react-native-firebase/analytics';

// Firebase Analytics setup
 class Analytics {
      static init() {
        if (firebase.app().utils().isRunningInTestLab) {
          analytics().setAnalyticsCollectionEnabled(false);
        } else {
          analytics().setAnalyticsCollectionEnabled(true);
        }
      }
    
      // SignIn event
      static onSignIn = async userObject => {
         let {   createdAt, level, publications } = userObject;
        const id = userObject._id
        await Promise.all([
          analytics().setUserId(id), //this has to be same as the id in the mongodb database          
          analytics().setUserProperty('created_at', createdAt.toString()),
          analytics().setUserProperty('numberOfVotes', level.toString()),
          analytics().setUserProperty('numberOfUploads', publications.toString()),
          this.logEvent("sign_in")
        ]);
      };

      // SignUp event
     static onSignUp = async userObject => {
            const {  name, createdAt, gender,  level, publications } = userObject;
            const id = userObject._id
            await Promise.all([
              analytics().setUserId(id), //this has to be same as the id in the mongodb database          
              //analytics().setUserProperty('gender', gender.toString()),
              analytics().setUserProperty('created_at', createdAt.toString()),
              //analytics().setUserProperty('instagramName', '0'),
              analytics().setUserProperty('numberOfVotes', level.toString()),
              analytics().setUserProperty('numberOfUploads', publications.toString()),
              this.logEvent("sign_up")
            ]);
          };
    
      
      static setNumberOfVotes = async number  => {
        await analytics().setUserProperty('numberOfVotes', number.toString())
      };

       static setNumberOfUploads = async number  => {
        await analytics().setUserProperty('numberOfUploads', number.toString())
      };

      static setCurrentScreen = async screenName => {
        await analytics().setCurrentScreen(screenName, screenName);
      };
    
      static logEvent = async (eventName, propertyObject = {}) => {
        await analytics().logEvent(eventName, propertyObject);
      }
    
      static onSignOut = async () => {
        await analytics().resetAnalyticsData();
      };


       static onUpload = async (upload) => {

        const { photosCount,  targetSocialMedia } = upload;
        const uploadProperties = {
          upload_photos_count: photosCount.toString(),
          target_social_media: targetSocialMedia.toString(),
        }
        await Promise.all([
            this.logEvent("upload", uploadProperties)
        ]);
      };

      static onVote = () => {
            this.logEvent("vote")
      };

      static onShareLink = () => {
        this.logEvent("shareLink")
      };


      static onSkip = async () => {
              this.logEvent("skip")
      };

      static onProfilePhotoChange = ( profilePhoto = {} ) => {
            this.logEvent("profile_photo_change", profilePhoto)
      };

      static onReport = () => {
          this.logEvent("report")
      };

       static onHatedUsers = () => {
          this.logEvent("hated_users")
      };


    }
    
    export default Analytics;