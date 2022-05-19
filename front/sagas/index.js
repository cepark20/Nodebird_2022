



import { all, fork, call, take, put, takeEvery, takeLatest, throttle,delay } from 'redux-saga/effects';
import axios from 'axios';

import postSaga from "./post";
import userSaga from "./user";

// saga에서 보내는 모든 요청에 기본적으로 적용됨
axios.defaults.baseURL = 'http://localhost:3065';
axios.defaults.withCredentials = true;

  // call과 fork의 차이 : call은 동기함수 호출 fork는 비동기함수 호출

 //saga 이펙트 앞에 yield를 붙여주는 이유는 프로그램 테스트에 좋다


 // function* : 제너레이터
 // 제너레이터도 함수의 일종으로 제너레이터를 실행하려면
 // 제너레이터().next() 로 실행 가능
 // 제너레이터는 yield라는게 나온다
 // 함수 전체가 실행되는 게 아니라 yeild가 나오면 멈춰버린다
 // 그리고 일드 뒤에 숫자를 써주면 그 값이 value로 리턴된다
 // 제너레이터를 쓰다가 next로 호출하다가 중간에 멈춰버릴 수도 있다
 // 또한 사가에서는 절대 멈추지 않는 제너레이터로 while(true)문을 쓸 수 있다
 // 예를 들어

 /*
 let i = 0;
 const gen = function*() {
    while(true) {
        yield i++;
    }
 }

  */
 // 이런 식으로 쓰면 const g = gen();
 // g.next()를 한번 호출하면 0, 한번더 호출하면 1, 한번더 호출하면 2 이렇게
 // 무한으로 값을 더해줄수있다.
 // 사가는 제너레이터로 이벤트 리스너 역할을 수행한다
 // 무한의 이벤트 리스너!!


// rootSaga에서 쪼개진 saga들을 합쳐준다
export default function* rootSaga() {
    // all : 사가 이펙트로 배열을 받아서 배열 안에 있는 것들을 한번에 실행해준다
    // fork : fork 내부의 함수들을 실행해준다
    yield all([
        fork(postSaga),
        fork(userSaga),
    ]);
}