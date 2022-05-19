import { HYDRATE } from "next-redux-wrapper";
import { combineReducers } from 'redux';

// 리덕스의 combineReducers를 통해 가져온 리듀서를 합쳐줘야 함
import user from './user';   // user 리듀서 가져오기
import post from "./post";   // post 리듀서 가져오기

// 원래 index.js에 작성한 initialState를
// user 리듀서, post 리듀서로 쪼개고
// 각각의 initialState를 index.js에서 합쳐준다
/*
const initialState = {

    user: {
        isLoggedIn: false,
        user: null,
        signUpData: {},
        loginData: {}
    },
    post: {
        mainPosts: []
    }


}; */

/*
// 동적 액션 생성기(액션 생성 함수)
export const loginAction = (data) => {
    return {
        type: 'LOG_IN',
        data
    }
};

export const logoutAction = () => {
    return {
        type: 'LOG_OUT'
    }
};
 */

// (이전 상태, 액션) => 다음 상태를 만들어내는 함수

// user + post 리듀서 합치기
// 리덕스 서버사이드 렌더링을 위해 HYDRATE 필요
// 이를 위해 인덱스 리듀서 추가

const rootReducer = (state, action) => {
        switch (action.type) {
            case HYDRATE:
                console.log('HYDRATE', action);
                return action.payload;
            default: {
                const combinedReducer = combineReducers({
                    user,
                    post
                });
                return combinedReducer(state, action);
            }
        }
};

// 컴바인 리듀서가 user와 post 각각의 intitialState를 합쳐준다  state.user state.post
// 구조 바꾸기 이전
/*
const rootReducer = combineReducers({
    index: (state = {}, action) => {
        switch (action.type) {
            case HYDRATE:
                return {...state, ...action.payload};
            // 디폴트 구문이 없을 경우 리듀서 초기화 시 디폴트값이 없으면
            // undefined가 됨
            default:
                return state;
        }
    },
    user,
    post
});

 */



export default rootReducer;