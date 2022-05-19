
import React, {useCallback, useEffect, useState} from 'react';
import AppLayout from "../components/AppLayout";
import Head from "next/head";
import {Form, Input, Checkbox, Button} from "antd";
import useInput from "../hooks/useInput";
import {useDispatch, useSelector} from "react-redux";
import Router from "next/router";
import {SIGN_UP_REQUEST} from "../reducers/user";

const SignUp = () => {
    const [email, onChangeEmail] = useInput('');
    const [nickname, onChangeNickname] = useInput('');
    const [password, onChangePassword] = useInput('');
    const [passwordCheck, setPasswordCheck] = useState('');

    const dispatch = useDispatch();
    const { signUpLoading, signUpDone, signUpError, logInDone } =
        useSelector((state) => state.user);

    // 로그인 성공시 회원가입 페이지에서 메인 페이지로 이동
    useEffect(() => {
        if (logInDone) {
            // push는 이전 페이지로 되돌아갈 수 있으나
            // replace는 기록에서 사라져버리므로 불가능
            Router.replace('/');
        }
    }, [logInDone]);

    useEffect(() => {
        // 회원가입 완료시 메인 페이지로 이동
        if (signUpDone) {
            Router.replace('/');
        }
    }, [signUpDone]);

    useEffect(() => {
        if (signUpError) {
            alert(signUpError);
        }
    }, [signUpError]);

    // 비밀번호와 비밀번호체크가 일치하는지
    const [passwordError, setPasswordError] = useState(false);
    const onChangePasswordCheck = useCallback((e) => {
        setPasswordCheck(e.target.value);
        // 일치하지 않으면 passwordError가 true가 된다
        setPasswordError(e.target.value !== password);
    }, [password]);

    const [term, setTerm] = useState('');
    const [termError, setTermError] = useState(false);
    const onChangeTerm = useCallback((e) => {
        setTerm(e.target.checked);  // 체크박스 체크 상태
        setTermError(false);
    }, []);

    // 가입 버튼 클릭
    const onSubmitForm = useCallback(() => {
        // 비밀번호와 비밀번호체크가 불일치한다면
        if (password !== passwordCheck) {
            return setPasswordError(true);
        }
        // 약관 동의를 누르지 않은 경우
        if (!term) {
            return setTermError(true);
        }
        console.log(email, nickname, password);
        dispatch({
            type: SIGN_UP_REQUEST,
            data: { email, password, nickname }
        });
    }, [password, passwordCheck, term]);

    return (
        <AppLayout>
            <Head>
                <title> Sign Up | NodeBird </title>
            </Head>
            <Form onFinish={onSubmitForm}>
                <div>
                    <label htmlFor="user-email">E-Mail </label>
                    <br />
                    <Input
                        name="user-email"
                        type="email"
                        value={email}
                        onChange={onChangeEmail}
                        required />
                </div>
                <div>
                    <label htmlFor="user-nickname">NickName </label>
                    <br />
                    <Input
                        name="user-nickname"
                        value={nickname}
                        onChange={onChangeNickname}
                        required />
                </div>
                <div>
                    <label htmlFor="user-password">Password </label>
                    <br />
                    <Input
                        name="user-password"
                        type="password"
                        value={password}
                        onChange={onChangePassword}
                        required />
                </div>
                <div>
                    <label htmlFor="user-password-check">Password Check </label>
                    <br />
                    <Input
                        name="user-password-check"
                        type="password"
                        value={passwordCheck}
                        onChange={onChangePasswordCheck}
                        required />
                    {passwordError && <div style={{ color: 'red'}}>Password is not correct!!</div>}
                </div>
                <div>
                    <Checkbox
                        name="user-term"
                        checked={term}
                        onChange={onChangeTerm}
                    >
                        약관에 동의합니다.
                    </Checkbox>
                    {termError && <div style={{ color: 'red' }}>약관에 동의해주십시오.</div>}
                </div>
                <div style={{ marginTop: 10 }}>
                    <Button type="primary" htmlType="submit" loading={signUpLoading}>가입</Button>
                </div>
            </Form>
        </AppLayout>
    );
};

export default SignUp;
