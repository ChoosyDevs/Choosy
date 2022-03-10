const SET_ROUTE_REGISTER = 'SET_ROUTE_REGISTER';
const SET_EMAIL_SIGNIN = 'SET_EMAIL_SIGNIN';
const SET_PASSWORD_SIGNIN = 'SET_PASSWORD_SIGNIN';
const SET_EMAIL_REGISTER = 'SET_EMAIL_REGISTER';
const SET_USERNAME_REGISTER = 'SET_USERNAME_REGISTER';
const SET_PASSWORD_REGISTER = 'SET_PASSWORD_REGISTER';
const SET_DATE_OF_BIRTH_REGISTER = 'SET_DATE_OF_BIRTH_REGISTER';
const SET_SIX_DIGIT_PASSWORD = 'SET_SIX_DIGIT_PASSWORD';
const SET_RESET_PASSWORD_EMAIL = 'SET_RESET_PASSWORD_EMAIL';
const SET_SUCCESS_TOAST = 'SET_SUCCESS_TOAST';
const SET_INITIAL_STATE_WELCOME = 'SET_INITIAL_STATE_WELCOME';


export const setRouteRegister = (uploads) => ({
  type: SET_ROUTE_REGISTER,
  payload: uploads
});

export const setEmailSignIn = (email) => ({
  type: SET_EMAIL_SIGNIN,
  payload: email
});

export const setPasswordSignIn = (password) => ({
  type: SET_PASSWORD_SIGNIN,
  payload: password
});

export const setEmailRegister = (email) => ({
  type: SET_EMAIL_REGISTER,
  payload: email
});

export const setUsernameRegister = (username) => ({
  type: SET_USERNAME_REGISTER,
  payload: username
});

export const setPasswordRegister = (password) => ({
  type: SET_PASSWORD_REGISTER,
  payload: password
});

export const setDateOfBirth = (date) => ({
  type: SET_DATE_OF_BIRTH_REGISTER,
  payload: date
});

export const setSixDigitPassword = (password) => ({
  type: SET_SIX_DIGIT_PASSWORD,
  payload: password
});

export const setResetPasswordEmail = (email) => ({
  type: SET_RESET_PASSWORD_EMAIL,
  payload: email
});

export const setSuccessToast = (state) => ({
  type: SET_SUCCESS_TOAST,
  payload: state
});

export const setInitialStateWelcome = () => ({
  type: SET_INITIAL_STATE_WELCOME
});
