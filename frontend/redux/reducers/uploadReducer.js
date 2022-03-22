const INITIAL_STATE = {
    photos: [],
    postDuration:{
      minutes: 0,
      hours: 0,
      days:1
    },
    targetSocialMedia: [],
    preferToggle:false ,
    modalVisible: false,
    arrayOfDeletedPhotos: [],
    screenName:'PostDurationScreen'
  };
   
  const uploadReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_PHOTOS':
        return {...state, photos: action.payload};
      case 'SET_POST_DURATION':
        return {...state, postDuration: action.payload}  
      case 'SET_MEDIA':
        return {...state, targetSocialMedia: action.payload};  
      case 'SET_PREFER_TOGGLE':
        return {...state, preferToggle: !state.preferToggle};
      case 'SET_MODAL_VISIBLE':
        return {...state, modalVisible: action.payload};
      case 'SET_ARRAY_OF_DELETED_PHOTOS':
        return {...state, arrayOfDeletedPhotos: action.payload};  
      case 'SET_POST_DURATION_MINUTES':
        return {...state, postDuration: { minutes: action.payload, hours: state.postDuration.hours, days: state.postDuration.days }};  
      case 'SET_POST_DURATION_HOURS':
        return {...state, postDuration: { minutes: state.postDuration.minutes, hours: action.payload, days: state.postDuration.days }};  
      case 'SET_POST_DURATION_DAYS':
        return {...state, postDuration: { minutes: state.postDuration.minutes, hours: state.postDuration.hours, days: action.payload }};        
      case 'SET_SCREEN_NAME':
        return {...state, screenName: action.payload};  
      case 'DISCARD_UPLOAD':
        return INITIAL_STATE;        
      default:
        return state; 
    }
    
  };
   
  export default uploadReducer;