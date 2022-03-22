const SET_USERNAME = 'SET_USERNAME';
const SET_THUMBNAIL = 'SET_THUMBNAIL';
const SET_LEVEL = 'SET_LEVEL';
const SET_LEVEL_INCREASE = 'SET_LEVEL_INCREASE';
const SET_PUBLICATIONS = 'SET_PUBLICATIONS';
const SET_PUBLICATIONS_INCREASE = 'SET_PUBLICATIONS_INCREASE';
const SET_EMAIL = 'SET_EMAIL';
const SET_SETTINGS_VISIBLE = 'SET_SETTINGS_VISIBLE';
const SET_INITIAL_STATE_USER = 'SET_INITIAL_STATE_USER';
const SET_FORGOT_YOUR_PASSWORD = 'SET_FORGOT_YOUR_PASSWORD';
const SET_FORGOT_PASSWORD_ROUTE = 'SET_FORGOT_PASSWORD_ROUTE';
const SET_SUCCESS_TOAST = 'SET_SUCCESS_TOAST';
const SET_AGES = 'SET_AGES';
const SET_INSTAGRAM_NAME = 'SET_INSTAGRAM_NAME';
const SET_USER_VERIFIED = 'SET_USER_VERIFIED';
const SET_INSTAGRAM_INTRO_SEEN = 'SET_INSTAGRAM_INTRO_SEEN';
const SET_INSTAGRAM_INTRO = 'SET_INSTAGRAM_INTRO';


export const setUsername = (username) => ({
  type: SET_USERNAME,
  payload:username
});

export const setEmail = (email) => ({
  type: SET_EMAIL,
  payload:email
});

export const setThumbnail = (thumbnail) => ({
  type: SET_THUMBNAIL,
  payload:thumbnail
});

export const setLevel = (level) => ({
  type: SET_LEVEL,
  payload:level
});

export const setPublications = (publications) => ({
  type: SET_PUBLICATIONS,
  payload:publications
});

export const setPublicationsIncrease = () => ({
  type: SET_PUBLICATIONS_INCREASE,
});

export const setLevelIncrease = () => ({
  type: SET_LEVEL_INCREASE,
});

export const setSettingsVisible = (state) => ({
  type: SET_SETTINGS_VISIBLE,
  payload:state
});

export const setInitialStateUser = () => ({
  type: SET_INITIAL_STATE_USER,
});

export const setForgotYourPassword = (state) => ({
  type: SET_FORGOT_YOUR_PASSWORD,
  payload:state
});

export const setForgotPasswordRoute = (state) => ({
  type: SET_FORGOT_PASSWORD_ROUTE,
  payload:state
});

export const setSuccessToast = (state) => ({
  type: SET_SUCCESS_TOAST,
  payload:state
});

export const setAges = (ages) => ({
  type: SET_AGES,
  payload: ages
});

export const setInstagramName = (state) => ({
  type: SET_INSTAGRAM_NAME,
  payload:state
});

export const setUserVerified = (state) => ({
  type: SET_USER_VERIFIED,
  payload:state
});


export const setInstagramIntroSeen = (state) => ({
  type: SET_INSTAGRAM_INTRO_SEEN,
  payload:state
});

export const setInstagramIntro = (state) => ({
  type: SET_INSTAGRAM_INTRO,
  payload:state
});





