


// _app.js는 각 페이지 컴포넌트들을 불러와서 페이지 컴포넌트에서 공통인 부분을 처리한다
// 모든 페이지들의 공통되는 부분 처리
// Component : 페이지 컴포넌트

// _app.js에서 적용된 모든 노드들은 모든 페이지에 적용된다
// 그러나 AppLayout.js는 가져다 쓰는 곳에서만 적용된다 

import PropTypes from 'prop-types';
import Head from "next/head";
import 'antd/dist/antd.css';
import React from "react";
import wrapper from "../store/configureStore";

const App = ({ Component }) => {
    return (
        <>
            <Head>
                <meta charSet="utf-8"/>
                <title>NodeBird</title>
            </Head>
            <Component />
        </>

    );
};

App.propTypes = {
    Component: PropTypes.elementType.isRequired
};

export default wrapper.withRedux(App);