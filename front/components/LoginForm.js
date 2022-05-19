




import {Button, Form, Input} from 'antd';
import {useCallback, useState, useMemo, useEffect} from "react";
import PropTypes from 'prop-types';
import Link from "next/link";
import styled from "styled-components";
import useInput from "../hooks/useInput";
import {useDispatch, useSelector} from "react-redux";
import {loginRequestAction} from "../reducers/user";

//ButtonWrapper : 스타일이 적용된 div 컴포넌트
// 성능에 크게 영향이 없으면 인라인 스타일 써도 됨
// <div style={{ marginTop: 10 }}>
const ButtonWrapper = styled.div`
    margin-top: 10px;
`;

const FormWrapper = styled(Form)`
    padding: 10px;
`;

const LoginForm = () => {

    // store.dispatch와 동일
    const dispatch = useDispatch();
    const { logInLoading, logInError } = useSelector((state) => state.user);


    /*
    // 수작업 대신 react-form 라이브러리 사용 추천
    const [id, setId] = useState('');
    // 컴포넌트에 props로 넘기는 함수는 반드시 useCallback으로 감싸주자 (최적화를 위해)
    const onChangeId = useCallback((e) => {
        setId(e.target.value);
    }, []);

    const [password, setPassword] = useState('');
    const onChangePw = useCallback((e) => {
        setPassword(e.target.value);
    }, []);
     */

    // 커스텀 훅 사용
    const [email, onChangeEmail] = useInput('');
    const [password, onChangePassword] = useInput('');

    useEffect(() => {
        if (logInError) {
            alert(logInError);
        }
    }, [logInError]);

    /* styled-component 대신 useMemo 사용 가능
    const style = useMemo(() => ({ marginTop: 10 }), []);
    <div style={{style}}>   </div>
     */

    // 참고!! 함수형 컴포넌트에서 리렌더링이 될 때 함수 전체가 재실행되는 것은 맞다
    // 그렇다고 리렌더링이 될 때마다 return 부분을 다시 그리는 것은 아니고
    // 바뀌는 부분만 화면에 다시 그린다


    // antd에서는 버튼에서 submit 하면 onFinish가 자동으로 호출되는데
    // 여기는 e.prventDefault()가 자동으로 적용됨

    // 로그인 버튼을 클릭하면 로그인 리퀘스트 액션이 실행된다
    const onSubmitForm = useCallback(() => {
        // console.log(id, password);
        // setIsLoggedIn(true);
        dispatch(loginRequestAction({ email, password }));
    }, [email, password]);


    return (
        <FormWrapper onFinish={onSubmitForm}>
            <div>
                <label htmlFor="user-email">E-Mail: </label>
                <br />
                <Input
                    name="user-email"
                    type="email"
                    value={email}
                    onChange={onChangeEmail}
                    required
                />
            </div>
            <div>
                <label htmlFor="user-password">PW: </label>
                <br />
                <Input
                    name="user-password"
                    type="password"
                    value={password}
                    onChange={onChangePassword}
                    required
                />
            </div>
            <ButtonWrapper>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={logInLoading}>
                    Log In
                </Button>

                <Link href="/signup">
                    <a><Button>Sign Up</Button></a>
                </Link>
            </ButtonWrapper>
        </FormWrapper>
    );
};

/*LoginForm.propTypes = {
    setIsLoggedIn: PropTypes.func.isRequired
};*/

export default LoginForm;





















