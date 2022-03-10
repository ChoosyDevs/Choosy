const INITIAL_STATE = {
    uploadsArray: [],
    currentIndex:0,
    delayedCurrentIndex:0,
    lastUploadBuffer: {},
    voting:false,
    popoverVisible:false, 
    successVisible:false,
    loadingVisible:false,
    isReady:false,
    skipsCounter:0,
    seenAll: false,
    loadingReports:false,
    moreModalVisible:false,
    tappedButtonModalMore:false,
    reportPressed:false,
    hideThisUserPressed:false,
    skippedUploadsModal:false,
  };
  

  const homeReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_UPLOADS_ARRAY':
        if(state.isReady) return {...state, uploadsArray: action.payload, currentIndex: 0};
        else return {...state, uploadsArray: action.payload, currentIndex: 0, isReady:true};
      case 'INCREMENT_CURRENT_INDEX':
        let { currentIndex, uploadsArray } = state;
        if(currentIndex === uploadsArray.length - 1) return {...state, currentIndex: 0};  
        else return {...state, currentIndex: currentIndex + 1};  
      case 'RESET_CURRENT_INDEX':
        return {...state, currentIndex: 0};   
      case 'SET_LAST_UPLOAD_BUFFER':
        return {...state, lastUploadBuffer: action.payload};    
      case 'SET_VOTING':
        return {...state, voting: action.payload};
      case 'SET_MORE_MODAL_VISIBLE':
        return {...state, moreModalVisible: action.payload}; 
      case 'SET_TAPPED_BUTTON_MODAL_MORE':
        return {...state, tappedButtonModalMore: action.payload};
      case 'SET_REPORT_PRESSED':
        return {...state, reportPressed: action.payload};
      case 'SET_HIDE_THIS_USER_PRESSED':
        return {...state, hideThisUserPressed: action.payload};        
      case 'SET_POPOVER_VISIBLE':
        return {...state, popoverVisible: action.payload} 
      case 'SET_SUCCESS_VISIBLE':
        return {...state, successVisible: action.payload}   
      case 'SET_LOADING_VISIBLE':
        return {...state, loadingVisible: action.payload, skipsCounter: 0} 
      case 'SET_INCREMENT_NUMBER_OF_SKIPS_COUNTER':
        let { skipsCounter } = state;
        return {...state, skipsCounter: skipsCounter + 1 } 
      case 'SET_RESET_SKIPS_NUMBER':
        return {...state, skipsCounter: 0 }    
      case 'SET_SEEN_ALL':
        return {...state, seenAll: action.payload }
      case 'SET_LOADING_REPORTS':
        return {...state, loadingReports: action.payload }    
      case 'SKIPPED_UPLOADS_MODAL':
        return {...state, skippedUploadsModal: action.payload }     
      case 'SET_INITIAL_STATE_HOME':
        return INITIAL_STATE;     
      default:
        return state; 
    }
  };
  
  export default homeReducer;