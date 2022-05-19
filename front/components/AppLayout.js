import PropTypes from 'prop-types';
import Link from "next/link";
import { Input, Menu, Row, Col } from "antd";
import React, {useCallback, useState} from "react";
import LoginForm from "./LoginForm";
import UserProfile from "./UserProfile";
import styled from "styled-components";
import {useSelector} from "react-redux";
import useInput from "../hooks/useInput";
import Router from "next/router";


// antd 컴포넌트(Input.Search) 커스텀화 : styled(스타일 적용할 컴포넌트 이름)
const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;
// styled-component 사용하기 싫을 경우 useMemo 사용

// 특정 컴포넌트끼리 공통인 부분(일부!!)
// 특정 페이지에서 공통적으로 사용하는 레이아웃 컴포넌트
// props.children : 태그 사이의 내용을 보여줌 <div> Hi </div>  -> Hi


// 참고: xs: 576px 미만   md: 768px 이상
// Row gutter : 컬럼 사이 간격을 주기 위해 gutter(간격) 사용

const AppLayout = ({ children }) => {

    const [searchInput, onChangeSearchInput] = useInput('');

    // 리덕스를 사용하면서 useState 대신 상태값을 반환받기 위해 useSelector를 사용
    // const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

    // 구조 분해 할당 적용
    const { me } = useSelector((state) => state.user);
    const onSearch = useCallback(() => {
        Router.push(`hashtag/${searchInput}`);
    }, [searchInput]);

    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
        <div>
            <div>
                <Menu mode={"horizontal"}>
                    <Menu.Item>
                        <Link href="/"><a>NodeBird</a></Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link href="/profile"><a>Profile</a></Link>
                    </Menu.Item>
                    <Menu.Item>
                        <SearchInput
                            style={{ verticalAlign: 'middle' }}
                            enterButton
                            value={searchInput}
                            onChange={onChangeSearchInput}
                            onSearch={onSearch}
                        />
                    </Menu.Item>
                </Menu>
                <Row gutter={8}>
                    <Col xs={24} md={6}>
                        {me ? <UserProfile /> : <LoginForm />}
                    </Col>
                    <Col xs={24} md={12}>
                        {children}
                    </Col>
                    <Col xs={24} md={6}>
                        <a href="https://www.janep.com" target="_blank" rel="noreferrer noopenner">Made by JaneP</a>
                    </Col>
                </Row>
            </div>
        </div>
    );

};

AppLayout.propTypes = {
    // node 타입 : 화면에 그릴 수 있는 모든 것이 node 타입
    children: PropTypes.node.isRequired
}

export default AppLayout;