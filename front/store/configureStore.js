import { createWrapper } from "next-redux-wrapper";
import {applyMiddleware, createStore ,compose} from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from "../reducers";
import rootSaga from "../sagas";

import createSagaMiddleware from 'redux-saga';
// store 설정 (next-wrapper)



// Redux(MobX, Apollo): 중앙 데이터 저장소
// Context API도 동일한 역할을 한다
// 앱의 안정성이 좋다 다만 코드량이 많음

// 중앙 저장소는 주로 서버에서 데이터를 많이 가져오는데
// 서버에서 데이터를 가져오는 것은 주로 비동기
// 비동기는 보통 데이터 요청, 성공, 실패 3단계로 나뉘는데
// context api는 직접 모두 구현해야 하며 컴포넌트에서 데이터 처리까지 적어줘야 하므로 비추천
// 화면을 데이터 로직과 분리해야 하므로 중앙 데이터 저장소를 쓰는 것이 좋다
// 중앙 저장소도 너무 커지지 않도록 적절히 쪼갤 수 있음

// 데이터 저장소에 저장된 데이터를 바꾸려면 액션을 디스패치해서 바꿀 수 있다
// 리듀서: 액션에 따라 데이터를 어떻게 바꿀 것인지 전부 기술해놓음
// 액션을 만드는 이유는 history가 남기 때문
// 불변성을 위해 return { ...state, name: action.data }
// {} ==={}  -> false
// 새로 만든 객체는 항상 false
// 대입한 객체는 true
// return { }   -> 내가 바꾸고 싶은 것만 바꿔서 새로운 객체로 리턴하기 때문에
// 객체를 새로 만들어야 변경 내역이 추적된다
// const prev = { name: jj } const next = { name: gsg }
// 이전 기록도 남아 있고 다음 기록도 남아있음
// 그런데 만약 새로운 객체를 만들지 않고
// const next = prev; next.name = 'book';
// 이렇게 참조 관계로 바꾸면 next를 바꾸면 prev도 바뀌어버린다
// 리덕스를 쓰는 이유도 history를 관리하기 위함인데
// 참조 관계로 쓰면 이전 거를 관리할 수 없음
// ...을 쓰는 이유는 유지해도 될 애들은 참조 관계로 써서 메모리를 많이 안잡아먹도록
// 개발 모드에서는 history를 다 가지고 있는데 배포모드에서는 histoyry를 계속 지운다
// 배포 모드에서는 메모리 걱정 ㄴㄴ


// store: state와 reducer를 가지고 있음

const configureStore = () => {

    const sagaMiddleware = createSagaMiddleware();

    const middlewares = [sagaMiddleware];

    // 미들웨어 설정(리덕스 기능 확장 enhancer)
    // 개발 모드일때는 브라우저의 devtool과 연동시키고
    // 배포 모드일 때는 보안 위협으로 연동하지 않는다
    const enhancer =
        process.env.NODE_ENV === 'production'
            ? compose(applyMiddleware(...middlewares))
            : composeWithDevTools(applyMiddleware(...middlewares))

    const store = createStore(rootReducer, enhancer);
    store.sagaTask = sagaMiddleware.run(rootSaga);
    return store;
};

const wrapper = createWrapper(configureStore,
               // 옵션 객체 (debug 설정)
    { debug: process.env.NODE_ENV === 'development'});

export default wrapper;