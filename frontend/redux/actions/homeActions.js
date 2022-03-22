const SET_UPLOADS_ARRAY = 'SET_UPLOADS_ARRAY';
const INCREMENT_CURRENT_INDEX = 'INCREMENT_CURRENT_INDEX';
const RESET_CURRENT_INDEX = 'RESET_CURRENT_INDEX';
const SET_LAST_UPLOAD_BUFFER = 'SET_LAST_UPLOAD_BUFFER';
const SET_VOTING = 'SET_VOTING';
const SET_POPOVER_VISIBLE = 'SET_POPOVER_VISIBLE';
const SET_SUCCESS_VISIBLE = 'SET_SUCCESS_VISIBLE';
const SET_LOADING_VISIBLE = 'SET_LOADING_VISIBLE';
const SET_INITIAL_STATE_HOME = 'SET_INITIAL_STATE_HOME';
const SET_INCREMENT_NUMBER_OF_SKIPS_COUNTER = 'SET_INCREMENT_NUMBER_OF_SKIPS_COUNTER';
const SET_RESET_SKIPS_NUMBER = 'SET_RESET_SKIPS_NUMBER';
const SET_SEEN_ALL = 'SET_SEEN_ALL';
const SET_LOADING_REPORTS = 'SET_LOADING_REPORTS';

const SET_MORE_MODAL_VISIBLE = 'SET_MORE_MODAL_VISIBLE';
const SET_TAPPED_BUTTON_MODAL_MORE = 'SET_TAPPED_BUTTON_MODAL_MORE';
const SET_REPORT_PRESSED = 'SET_REPORT_PRESSED';
const SET_HIDE_THIS_USER_PRESSED = 'SET_HIDE_THIS_USER_PRESSED';
const SKIPPED_UPLOADS_MODAL = 'SKIPPED_UPLOADS_MODAL';



export const setMoreModalVisible = (flag) => ({
  type: SET_MORE_MODAL_VISIBLE,
  payload: flag
});

export const setTappedButtonModalMore = (flag) => ({
  type: SET_TAPPED_BUTTON_MODAL_MORE,
  payload: flag
});

export const setReportPressed = (flag) => ({
  type: SET_REPORT_PRESSED,
  payload: flag
});

export const setHideThisUserPressed = (flag) => ({
  type: SET_HIDE_THIS_USER_PRESSED,
  payload: flag
});

export const setUploadsArray = (uploads) => ({
  type: SET_UPLOADS_ARRAY,
  payload: uploads
});

export const incrementCurrentIndex = () => ({
  type: INCREMENT_CURRENT_INDEX,
});

export const resetCurrentIndex = () => ({
  type: RESET_CURRENT_INDEX,
});

export const setLastUploadBuffer = (upload) => ({
  type: SET_LAST_UPLOAD_BUFFER,
  payload: upload
});

export const setVoting = (state) => ({
  type: SET_VOTING,
  payload: state
});

export const setPopoverVisible = (state) => ({
  type: SET_POPOVER_VISIBLE,
  payload: state
});

export const setSuccessVisible = (state) => ({
  type: SET_SUCCESS_VISIBLE,
  payload: state
});

export const setLoadingVisible = (state) => ({
  type: SET_LOADING_VISIBLE,
  payload: state
});

export const setInitialStateHome = () => ({
  type: SET_INITIAL_STATE_HOME,
});

export const setIncrementNumberOfSkipsCounter = () => ({
  type: SET_INCREMENT_NUMBER_OF_SKIPS_COUNTER,
});

export const setResetSkipsNumber = () => ({
  type: SET_RESET_SKIPS_NUMBER,
});

export const setSeenAll = (state) => ({
  type: SET_SEEN_ALL,
  payload: state
});

export const setLoadingReports = (state) => ({
  type: SET_LOADING_REPORTS,
  payload: state
});

export const setSkippedUploadsModal = (state) => ({
  type: SKIPPED_UPLOADS_MODAL,
  payload: state
});



