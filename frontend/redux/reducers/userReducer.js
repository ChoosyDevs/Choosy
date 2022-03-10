 const INITIAL_STATE = {
  username:'',
  thumbnail:'',
  level:0,
  publications:0,
  email:'',
  settingsVisible:false,
  forgotYourPassword: false,
  forgotPasswordRoute:'email',
  successToast:false,
  targetAges: [13, 10000],
  instagramName:'',
  userVerified:false,
  instagramIntroSeen:true,
  instagramIntro:false

};
 
const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'SET_EMAIL':
      return {...state, email:action.payload};
    case 'SET_USERNAME':
      return {...state, username:action.payload};
    case 'SET_AGES':
      return {...state, targetAges: action.payload};    
    case 'SET_THUMBNAIL':
      return {...state, thumbnail:action.payload};   
    case 'SET_LEVEL':
      return {...state, level:action.payload}; 
    case 'SET_PUBLICATIONS':
      return {...state, publications:action.payload};
    case 'SET_LEVEL_INCREASE':
      return {...state, level:state.level + 1}; 
    case 'SET_PUBLICATIONS_INCREASE':
      return {...state, publications:state.publications + 1};       
    case 'SET_SETTINGS_VISIBLE':
      return {...state, settingsVisible: action.payload };
    case 'SET_FORGOT_YOUR_PASSWORD':
      return {...state, forgotYourPassword: action.payload };
    case 'SET_FORGOT_PASSWORD_ROUTE':
      return {...state, forgotPasswordRoute: action.payload };
    case 'SET_SUCCESS_TOAST':
      return {...state, successToast: action.payload };
    case 'SET_INSTAGRAM_NAME':
      return {...state, instagramName: action.payload };  
    case 'SET_USER_VERIFIED':
      return {...state, userVerified: action.payload };      
    case 'SET_INSTAGRAM_INTRO_SEEN':
      return {...state, instagramIntroSeen: action.payload };
    case 'SET_INSTAGRAM_INTRO':
      return {...state, instagramIntro: action.payload };        
    case 'SET_INITIAL_STATE_USER':
      return INITIAL_STATE;        
    default:
      return state; 
  }
};
 
export default userReducer;