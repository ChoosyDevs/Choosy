import { createStore, combineReducers } from 'redux'

import  userReducer  from '../reducers/userReducer.js'
import  homeReducer  from '../reducers/homeReducer.js'
import  uploadReducer  from '../reducers/uploadReducer.js'
import  generalReducer  from '../reducers/generalReducer.js'
import  welcomeReducer  from '../reducers/welcomeReducer.js'
import  profileReducer  from '../reducers/profileReducer.js'


export const store = createStore(combineReducers({ user: userReducer, home: homeReducer, upload: uploadReducer, general: generalReducer, welcome:welcomeReducer , profile:profileReducer }))  