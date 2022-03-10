const SET_REFRESHING_PROFILE = 'SET_REFRESHING_PROFILE'; 
const SET_TAPPED_PHOTO_SELECTED_PHOTOS = 'SET_TAPPED_PHOTO_SELECTED_PHOTOS'; 
const SET_INDEX_OF_PRESS_ACTIVE_UPLOADS = 'SET_INDEX_OF_PRESS_ACTIVE_UPLOADS'; 
const SET_WON_PHOTOS_ARRAY = 'SET_WON_PHOTOS_ARRAY'; 
const SET_ACTIVE_UPLOADS_ARRAY = 'SET_ACTIVE_UPLOADS_ARRAY'; 
const SET_ACTIVE_MORE_PRESSED = 'SET_ACTIVE_MORE_PRESSED'; 
const SET_ACTIVE_MORE_INDEX = 'SET_ACTIVE_MORE_INDEX'; 
const SET_ACTIVE_PRESSED_PHOTO = 'SET_ACTIVE_PRESSED_PHOTO'; 
const SET_IS_READY = 'SET_IS_READY'; 
const SET_ACTIVE_POST_DETAILS = 'SET_ACTIVE_POST_DETAILS'; 
const SET_ACTIVE_MODAL_DELETE_POST = 'SET_ACTIVE_MODAL_DELETE_POST'; 
const SET_ACTIVE_PRESSED_PHOTO_MODAL_MORE = 'SET_ACTIVE_PRESSED_PHOTO_MODAL_MORE'; 
const SET_DELETE_LOADING_INDICATOR = 'SET_DELETE_LOADING_INDICATOR'; 
const SET_DELETE_LOADING_INDICATOR_MODAL_MORE = 'SET_DELETE_LOADING_INDICATOR_MODAL_MORE'; 
const SET_INITIAL_STATE_PROFILE = 'SET_INITIAL_STATE_PROFILE'; 
const SET_MODAL_INACTIVE_UPLOADS = 'SET_MODAL_INACTIVE_UPLOADS'; 
const SET_MODAL_MORE_INACTIVE_UPLOADS = 'SET_MODAL_MORE_INACTIVE_UPLOADS'; 
const SET_ACTIVE_AND_INACTIVE_UPLOADS_ARRAY = 'SET_ACTIVE_AND_INACTIVE_UPLOADS_ARRAY';
const SET_MODAL_FINISHED_POLL = 'SET_MODAL_FINISHED_POLL';
const SET_FINISHED_POLL_ARRAY = 'SET_FINISHED_POLL_ARRAY';
const REMOVE_FINISHED_POLL_ARRAY = 'REMOVE_FINISHED_POLL_ARRAY';
const SET_POLL_LINK = 'SET_POLL_LINK';
const SET_SHARE_MODAL = 'SET_SHARE_MODAL';
const SET_INSTAGRAM_LOGIN_MODAL = 'SET_INSTAGRAM_LOGIN_MODAL';
const SET_INSTAGRAM_LOGIN = 'SET_INSTAGRAM_LOGIN';


export const setRefreshingProfile = (state) => ({
  type: SET_REFRESHING_PROFILE,
  payload:state
});

export const setTappedPhotoSelectedPhotos = (index) => ({
  type: SET_TAPPED_PHOTO_SELECTED_PHOTOS,
  payload:index
});

export const setIndexOfPressActiveUploads = (index) => ({
  type: SET_INDEX_OF_PRESS_ACTIVE_UPLOADS,
  payload:index
});

export const setActiveAndInactivePhotosArray = (array) => ({
  type: SET_ACTIVE_AND_INACTIVE_UPLOADS_ARRAY,
  payload:array
});


export const setActiveMorePressed = (flag) => ({
  type: SET_ACTIVE_MORE_PRESSED,
  payload:flag
});

export const setActiveMoreIndex = (index) => ({
  type: SET_ACTIVE_MORE_INDEX,
  payload:index
});

export const setActivePressedPhoto = (flag) => ({
  type: SET_ACTIVE_PRESSED_PHOTO,
  payload:flag
});

export const setIsReady = (flag) => ({
  type: SET_IS_READY,
  payload:flag
});

export const setActivePostDetails = (flag) => ({
  type: SET_ACTIVE_POST_DETAILS,
  payload:flag
});

export const setActiveModalDeletePost = (flag) => ({
  type: SET_ACTIVE_MODAL_DELETE_POST,
  payload:flag
});

export const setActivePressedPhotoModalMore = (flag) => ({
  type: SET_ACTIVE_PRESSED_PHOTO_MODAL_MORE,
  payload:flag
});

export const setDeleteLoadingIndicator = (flag) => ({
  type: SET_DELETE_LOADING_INDICATOR,
  payload:flag
});

export const setInitialStateProfile = () => ({
  type: SET_INITIAL_STATE_PROFILE,
});

export const setDeleteLoadingIndicatorModalMore = (flag) => ({
  type: SET_DELETE_LOADING_INDICATOR_MODAL_MORE,
  payload:flag
});

export const setModalInactiveUploads = (flag) => ({
  type: SET_MODAL_INACTIVE_UPLOADS,
  payload:flag
});

export const setModalMoreInactiveUploads = (flag) => ({
  type: SET_MODAL_MORE_INACTIVE_UPLOADS,
  payload:flag
});

export const setModalFinishedPoll = (flag) => ({
  type: SET_MODAL_FINISHED_POLL,
  payload:flag
});

export const setFinishedPollArray = (id) => ({
  type: SET_FINISHED_POLL_ARRAY,
  payload: id
});

export const removeFinishedPollArray = (id) => ({
  type: REMOVE_FINISHED_POLL_ARRAY,
  payload: id
});

export const setPollLink = (link) => ({
  type: SET_POLL_LINK,
  payload: link
});

export const setShareModal = (state) => ({
  type: SET_SHARE_MODAL,
  payload: state
});

export const setInstagramLoginModal = (state) => ({
  type: SET_INSTAGRAM_LOGIN_MODAL,
  payload: state
});

export const setInstagramLogin = (state) => ({
  type: SET_INSTAGRAM_LOGIN,
  payload: state
});





