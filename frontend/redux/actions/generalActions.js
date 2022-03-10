const SET_ROUTE = 'SET_ROUTE';
const SET_UPLOAD_LOADING = 'SET_UPLOAD_LOADING';
const SET_UPLOAD_ENDED = 'SET_UPLOAD_ENDED';
const SET_UPLOAD_SUCCESSFUL = 'SET_UPLOAD_SUCCESSFUL'
const SET_UPLOAD_BAR_OPEN = 'SET_UPLOAD_BAR_OPEN';
const SET_SETTINGS_STATE = 'SET_SETTINGS_STATE';
const SET_INITIAL_STATE_GENERAL = 'SET_INITIAL_STATE_GENERAL';
const SET_INTERNET_CONNECTION = 'SET_INTERNET_CONNECTION';
const SET_INTERNET_CONNECTION_IN_THE_APP = 'SET_INTERNET_CONNECTION_IN_THE_APP';
const SET_UPLOAD_ID_FROM_LINK = 'SET_UPLOAD_ID_FROM_LINK'

export const setRoute = (route) => ({
  type: SET_ROUTE,
  payload: route
});

export const setUploadLoading = () => ({
  type: SET_UPLOAD_LOADING,
});

export const setUploadEnded = () => ({
  type: SET_UPLOAD_ENDED,
});

export const setUploadSuccessful = (success) => ({
  type: SET_UPLOAD_SUCCESSFUL,
  payload: success
});

export const setUploadBarOpen = (state) => ({
  type: SET_UPLOAD_BAR_OPEN,
  payload: state
});

export const setSettingsState = (stateSettings) => ({
  type: SET_SETTINGS_STATE,
  payload: stateSettings
});

export const setInitialStateGeneral = () => ({
  type: SET_INITIAL_STATE_GENERAL,
});

export const setInternetConnection = (state) => ({
  type: SET_INTERNET_CONNECTION,
  payload: state
});

export const setInternetConnectionInTheApp = (state) => ({
  type: SET_INTERNET_CONNECTION_IN_THE_APP,
  payload: state
});

export const setUploadIdFromLink = (state) => ({
  type: SET_UPLOAD_ID_FROM_LINK,
  payload: state
});


