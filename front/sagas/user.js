import {all, call, delay, fork, put, takeLatest} from "redux-saga/effects";
import axios from "axios";

import {
    CHANGE_NICKNAME_FAILURE,
    CHANGE_NICKNAME_REQUEST,
    CHANGE_NICKNAME_SUCCESS,
    FOLLOW_FAILURE,
    FOLLOW_REQUEST,
    FOLLOW_SUCCESS,
    LOAD_FOLLOWERS_FAILURE,
    LOAD_FOLLOWERS_REQUEST,
    LOAD_FOLLOWERS_SUCCESS,
    LOAD_FOLLOWINGS_FAILURE,
    LOAD_FOLLOWINGS_REQUEST,
    LOAD_FOLLOWINGS_SUCCESS,
    LOAD_MY_INFO_FAILURE,
    LOAD_MY_INFO_REQUEST,
    LOAD_MY_INFO_SUCCESS, LOAD_USER_FAILURE, LOAD_USER_REQUEST, LOAD_USER_SUCCESS,
    LOG_IN_FAILURE,
    LOG_IN_REQUEST,
    LOG_IN_SUCCESS,
    LOG_OUT_FAILURE,
    LOG_OUT_REQUEST,
    LOG_OUT_SUCCESS, REMOVE_FOLLOWER_FAILURE, REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS,
    SIGN_UP_FAILURE,
    SIGN_UP_REQUEST,
    SIGN_UP_SUCCESS,
    UNFOLLOW_FAILURE,
    UNFOLLOW_REQUEST,
    UNFOLLOW_SUCCESS,
} from '../reducers/user';


function signUpAPI(data) {
    // 브라우저에서 백엔드 서버로 요청 보내기
    return axios.post('/user', data);
}

function* signUp(action) {
    try {
        // yield delay(1000);
        const result = yield call(signUpAPI, action.data);
        console.log(result);
        yield put({
            type: SIGN_UP_SUCCESS,
            data: action.data
        });
    } catch (err) {
        yield put({
            type: SIGN_UP_FAILURE,
            error: err.response.data
        });
    }
}

function logOutAPI() {
    return axios.post('/user/logout')
}

function* logOut() {
    try {
        yield call(logOutAPI);
        yield put({
            type: LOG_OUT_SUCCESS
        });
    } catch (err) {
        yield put({
            type: LOG_OUT_FAILURE,
            error: err.response.data
        });
    }
}

function logInAPI(data) {
    // 서버로 로그인 요청 보내기
    return axios.post('/user/login', data)
}

function* logIn(action) {
    // 매개변수로 로그인 액션이 전달된다
    // action.type : LOG_IN_REQUEST
    // action.data : login 데이터 data : { email, password }
    // login 데이터를 loginAPI로 전달해서 서버에 로그인 데이터와 함께 요청을 보낸다



    // 로그인 실패를 대비하며 try-catch 사용
    // 성공 결과 : result.data
    // 실패 결과 : err.response.data
    try {

        // logIn 제너레이터 함수를 실행한 결과값을 result로 담는다
        // call을 쓰면 loginAPI를 실행한 결과를 result로 받아올 때까지 기다리는 반면
        // fork를 쓰면 요청을 보내고 결과를 기다리지 않고 바로 다음 문장을 실행해버린다
        const result = yield call(logInAPI, action.data); // logInAPI(action.data)와 동일

        // setTimeout과 같은 역할
        // yield delay(1000);
        // put은 dispatch와 비슷하다 액션을 디스패치!!!
        yield put({
            type: LOG_IN_SUCCESS,
            data: result.data   // login request로부터 받은 데이터
        });
    } catch (err) {
        yield put({
            type: LOG_IN_FAILURE,
            error: err.response.data
        });
    }
}

function unFollowAPI(data) {
    return axios.delete(`/user/${data}/follow`);
}

function* unFollow(action) {
    try {
        const result = yield call(unFollowAPI, action.data);
        yield put({
            type: UNFOLLOW_SUCCESS,
            data: result.data
        });
    } catch (err) {
        yield put({
            type: UNFOLLOW_FAILURE,
            error: err.response.data
        });
    }
}

function followAPI(data) {
    return axios.patch(`/user/${data}/follow`);
}

function* follow(action) {
    try {
        const result = yield call(followAPI, action.data);
        yield put({
            type: FOLLOW_SUCCESS,
            data: result.data
        });
    } catch (err) {
        yield put({
            type: FOLLOW_FAILURE,
            error: err.response.data
        });
    }
}

function loadMyInfoAPI() {
    // withCredentials 설정은 앞에서 해줬으므로 생략 가능
    return axios.get('/user');
}

function* loadMyInfo(action) {
    try {
        const result = yield call(loadMyInfoAPI, action.data);
        yield put({
            type: LOAD_MY_INFO_SUCCESS,
            data: result.data
        });
    } catch (err) {
        yield put({
            type: LOAD_MY_INFO_FAILURE,
            error: err.response.data
        });
    }
}

// 다른 사용자 정보 가져오기
function loadUserAPI(data) {
    return axios.get(`/user/${data}`);
}

function* loadUser(action) {
    try {
        const result = yield call(loadUserAPI, action.data);
        yield put({
            type: LOAD_USER_SUCCESS,
            data: result.data
        });
    } catch (err) {
        yield put({
            type: LOAD_USER_FAILURE,
            error: err.response.data
        });
    }
}

function changeNicknameAPI(data) {
    return axios.patch('/user/nickname', { nickname: data });
}

function* changeNickname(action) {
    try {
        const result = yield call(changeNicknameAPI, action.data);
        yield put({
            type: CHANGE_NICKNAME_SUCCESS,
            data: result.data
        });
    } catch (err) {
        yield put({
            type: CHANGE_NICKNAME_FAILURE,
            error: err.response.data
        });
    }
}

function loadFollowersAPI(data) {
    return axios.get('/user/followers', data);
}

function* loadFollowers(action) {
    try {
        const result = yield call(loadFollowersAPI, action.data);
        yield put({
            type: LOAD_FOLLOWERS_SUCCESS,
            data: result.data,
        });
    } catch (err) {
        console.error(err);
        yield put({
            type: LOAD_FOLLOWERS_FAILURE,
            error: err.response.data,
        });
    }
}

function loadFollowingsAPI(data) {
    return axios.get('/user/followings', data);
}

function* loadFollowings(action) {
    try {
        const result = yield call(loadFollowingsAPI, action.data);
        yield put({
            type: LOAD_FOLLOWINGS_SUCCESS,
            data: result.data,
        });
    } catch (err) {
        console.error(err);
        yield put({
            type: LOAD_FOLLOWINGS_FAILURE,
            error: err.response.data,
        });
    }
}

function removeFollowerAPI(data) {
    return axios.delete(`/user/follower/${data}`);
}

function* removeFollower(action) {
    try {
        const result = yield call(removeFollowerAPI, action.data);
        yield put({
            type: REMOVE_FOLLOWER_SUCCESS,
            data: result.data,
        });
    } catch (err) {
        console.error(err);
        yield put({
            type: REMOVE_FOLLOWER_FAILURE,
            error: err.response.data,
        });
    }
}

// 로그인 버튼이 클릭되서 loginActionRequest가 들어오면 실행됨
// 로그인 액션이 실행되면 logIn 제너레이터 함수를 실행한다 (이벤트 리스너같은 느낌)
function* watchLogIn() {
    // 로그인 액션이 실행되면 logIn을 실행한다

    // while take는 동기적으로 동작하고 takeEvery는 비동기적으로 동작
    // take만 쓰면 일회성으로 동작하기 때문에 문제가 생긴다
    // 지속적으로 로그인/로그아웃 등 액션을 무한하게 가능하게 하도록 하기 위해서
    // take 대신 takeEvery를 사용한다
    // takeLatest: 가장 마지막 요청만 실행 (도스 공격에 대비 가능)
    // 동시에 로딩 중인 것들이 있으면 마지막만!!!
    // 문제는 요청과 응답 중에 응답만 취소하는 것이기 때문에
    // 서버에는 요청이 여러번 그대로 들어간다
    // 그렇기 때문에 서버에서 반드시 검사할 필요가 있다
    // 또는 throttle을 써서 몇초동안 요청을 한번만 보낼 수 있다던지 그렇게 해줘야 함
    // throttle(ADD_POST_REQUEST, addPost, 2000)
    // 처음 요청만 보내려면 takeLeading
    yield takeLatest(LOG_IN_REQUEST, logIn);
}

function* watchLogOut() {
    yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchSignUp() {
    yield takeLatest(SIGN_UP_REQUEST, signUp);
}

function* watchFollow() {
    yield takeLatest(FOLLOW_REQUEST, follow);
}

function* watchUnFollow() {
    yield takeLatest(UNFOLLOW_REQUEST, unFollow);
}

function* watchLoadUser() {
    yield takeLatest(LOAD_USER_REQUEST, loadUser);
}

function* watchLoadMyInfo() {
    yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

function* watchChangeNickname() {
    yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

function* watchLoadFollowers() {
    yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function* watchLoadFollowings() {
    yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

function* watchRemoveFollower() {
    yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

export default function* userSaga(){
    yield all([
        fork(watchRemoveFollower),
        fork(watchLoadFollowers),
        fork(watchLoadFollowings),
        fork(watchChangeNickname),
        fork(watchLoadMyInfo),
        fork(watchLoadUser),
        fork(watchFollow),
        fork(watchUnFollow),
        fork(watchLogIn),
        fork(watchLogOut),
        fork(watchSignUp)
    ]);
}