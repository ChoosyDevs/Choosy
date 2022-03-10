const INITIAL_STATE = {
    route: 'welcome',
    uploadLoading:false,
    uploadEnded:false,
    uploadBarOpen:false,
    uploadSuccesful: false,
    refreshingProfile: false,
    settingsState:'settings',
    internetConnection:true,
    internetConnectionInTheApp:true,
    uploadIdFromLink:''
  };
   
   
  const homeReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'SET_ROUTE':
            return { ...state, route: action.payload }
        case 'SET_UPLOAD_LOADING':
            return { ...state, uploadLoading: !state.uploadLoading }   
        case 'SET_UPLOAD_ENDED':
            return { ...state, uploadEnded: !state.uploadEnded } 
        case 'SET_UPLOAD_SUCCESSFUL':
          return { ...state, uploadSuccesful: action.payload }       
        case 'SET_UPLOAD_BAR_OPEN':
          return { ...state, uploadBarOpen: action.payload }   
        case 'SET_SETTINGS_STATE':
          return { ...state, settingsState: action.payload }
        case 'SET_INTERNET_CONNECTION':
          return { ...state, internetConnection: action.payload }
        case 'SET_INTERNET_CONNECTION_IN_THE_APP':
          return { ...state, internetConnectionInTheApp: action.payload }
        case 'SET_UPLOAD_ID_FROM_LINK':
          return { ...state, uploadIdFromLink: action.payload }    
        case 'SET_INITIAL_STATE_GENERAL':
          return INITIAL_STATE;               
      default:
        return state; 
    }
  };
   
  export default homeReducer;