  const INITIAL_STATE = {
    routeRegister: 'login',
    signInEmail:'',
    signInPassword:'',
    registerEmail:'',
    registerUsername:'',
    registerPassword:'',
    registerDateOfBirth:'',
    resetPasswordEmail:'',
    sixDigitPassword:'',
    successToast:false
  };
   
  const welcomeReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_ROUTE_REGISTER':
        return {...state, routeRegister:action.payload};
      case 'SET_EMAIL_SIGNIN':
        return {...state, signInEmail:action.payload};
      case 'SET_PASSWORD_SIGNIN':
        return {...state, signInPassword:action.payload};
      case 'SET_EMAIL_REGISTER':
        return {...state, registerEmail:action.payload};
      case 'SET_USERNAME_REGISTER':
        return {...state, registerUsername:action.payload};
      case 'SET_PASSWORD_REGISTER':
        return {...state, registerPassword:action.payload};
      case 'SET_DATE_OF_BIRTH_REGISTER':
        return {...state, registerDateOfBirth:action.payload}; 
      case 'SET_SIX_DIGIT_PASSWORD':
        return {...state, sixDigitPassword:action.payload};   
      case 'SET_RESET_PASSWORD_EMAIL':
        return {...state, resetPasswordEmail:action.payload};    
      case 'SET_SUCCESS_TOAST':
        return {...state, successToast:action.payload};
      case 'SET_INITIAL_STATE_WELCOME':
        return INITIAL_STATE;                               
      default:
        return state; 
    }
  };
   
  export default welcomeReducer;