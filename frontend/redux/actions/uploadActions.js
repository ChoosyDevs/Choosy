const SET_PHOTOS = 'SET_PHOTOS';
const SET_POST_DURATION = 'SET_POST_DURATION';
const SET_MEDIA = 'SET_MEDIA';
const SET_PREFER_TOGGLE = 'SET_PREFER_TOGGLE';
const DISCARD_UPLOAD = 'DISCARD_UPLOAD';
const SET_MODAL_VISIBLE = 'SET_MODAL_VISIBLE';
const SET_ARRAY_OF_DELETED_PHOTOS = 'SET_ARRAY_OF_DELETED_PHOTOS';
const SET_POST_DURATION_MINUTES = 'SET_POST_DURATION_MINUTES';
const SET_POST_DURATION_HOURS = 'SET_POST_DURATION_HOURS';
const SET_POST_DURATION_DAYS = 'SET_POST_DURATION_DAYS';
const SET_SCREEN_NAME = 'SET_SCREEN_NAME';


export const setPhotos = (photos) => ({
  type: SET_PHOTOS,
  payload: photos
});

export const setPostDuration = (duration) => ({
  type: SET_POST_DURATION,
  payload: duration
})

export const setPostDurationMinutes = (duration) => ({
  type: SET_POST_DURATION_MINUTES,
  payload: duration
})

export const setPostDurationHours = (duration) => ({
  type: SET_POST_DURATION_HOURS,
  payload: duration
})

export const setPostDurationDays = (duration) => ({
  type: SET_POST_DURATION_DAYS,
  payload: duration
})



export const setMedia = (media) => ({
  type: SET_MEDIA,
  payload: media
});

export const setPreferToggle = () => ({
  type: SET_PREFER_TOGGLE,
});

export const discardUpload = () => ({
  type: DISCARD_UPLOAD,
});

export const setModalVisible = (state) => ({
  type: SET_MODAL_VISIBLE,
  payload: state
});

export const setArrayOfDeletedPhotos = (photos) => ({
  type: SET_ARRAY_OF_DELETED_PHOTOS,
  payload: photos
});

export const setScreenName = (name) => ({
  type: SET_SCREEN_NAME,
  payload: name
});

