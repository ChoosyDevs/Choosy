const INITIAL_STATE = {
  refreshingProfile:false,
  tappedPhoto:0,
  indexOfPressActiveUploads:1,
  wonPhotosArray:[],
  activeUploadsArray:[],
  activeMorePressed:false,
  activeMoreIndex:0,
  activePressedPhoto:false, 
  isReady:false,
  activePostDetails:false,
  activeModalDeletePost:false,
  activeModalMorePressedPhoto:false,
  activeDeleteLoadingIndicator:false,
  activeDeleteLoadingIndicatorModalMore:false,
  modalInactiveUploads:false,
  modalMoreInactiveUploads:false,
  modalFinishedPoll: false,
  finishedPollArray: [],
  pollLink:'',
  shareModal:false,
  instagramLoginModal:false,
  instagramLogin:false
  };
   
  const profileReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_REFRESHING_PROFILE':
        return {...state, refreshingProfile:action.payload };
      case 'SET_TAPPED_PHOTO_SELECTED_PHOTOS':
        return {...state, tappedPhoto:action.payload };
      case 'SET_ACTIVE_AND_INACTIVE_UPLOADS_ARRAY':
        return {...state, activeUploadsArray:action.payload.activeArray, wonPhotosArray:action.payload.wonPhotos, isReady:true };        
      case 'SET_INDEX_OF_PRESS_ACTIVE_UPLOADS':
        return {...state, indexOfPressActiveUploads:action.payload };
      case 'SET_ACTIVE_MORE_PRESSED':
        return {...state, activeMorePressed:action.payload };
      case 'SET_ACTIVE_MORE_INDEX':
        return {...state, activeMoreIndex:action.payload };
      case 'SET_ACTIVE_PRESSED_PHOTO':
        return {...state, activePressedPhoto:action.payload }; 
      case 'SET_IS_READY':
        return {...state, isReady:action.payload };
      case 'SET_ACTIVE_POST_DETAILS':
        return {...state, activePostDetails:action.payload };
      case 'SET_ACTIVE_MODAL_DELETE_POST':
        return {...state, activeModalDeletePost:action.payload };
      case 'SET_DELETE_LOADING_INDICATOR':
        return {...state, activeDeleteLoadingIndicator:action.payload };
      case 'SET_MODAL_INACTIVE_UPLOADS':
        return {...state, modalInactiveUploads:action.payload };  
      case 'SET_MODAL_MORE_INACTIVE_UPLOADS':
        return {...state, modalMoreInactiveUploads:action.payload };    
      case 'SET_DELETE_LOADING_INDICATOR_MODAL_MORE':
        return {...state, activeDeleteLoadingIndicatorModalMore:action.payload };    
      case 'SET_ACTIVE_PRESSED_PHOTO_MODAL_MORE':
        return {...state, activeModalMorePressedPhoto:action.payload }; 
      case 'SET_MODAL_FINISHED_POLL':
        return {...state, modalFinishedPoll:action.payload }; 
      case 'SET_FINISHED_POLL_ARRAY':
        let array = state.finishedPollArray;
        let idx = array.indexOf(action.payload);
        if(idx === -1) array.push(action.payload);
        return {...state, finishedPollArray:array }; 
      case 'REMOVE_FINISHED_POLL_ARRAY':
        let arr = state.finishedPollArray;
        let indx = arr.indexOf(action.payload);
        arr = arr.filter ((item, index) => index !== indx)
        return {...state, finishedPollArray:arr };   
      case 'SET_POLL_LINK':
          return {...state, pollLink: action.payload };   
      case 'SET_SHARE_MODAL':
        return {...state, shareModal: action.payload };   
      case 'SET_INSTAGRAM_LOGIN_MODAL':
        return {...state, instagramLoginModal: action.payload };
      case 'SET_INSTAGRAM_LOGIN':
        return {...state, instagramLogin: action.payload };  
      case 'SET_INITIAL_STATE_PROFILE':
        return INITIAL_STATE;
      default:
        return state; 
    }
  };

export default profileReducer;