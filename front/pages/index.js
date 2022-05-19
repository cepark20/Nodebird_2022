
// next가 pages 폴더 내부에 있는 파일들은
// 자동으로 개별적인 페이지 컴포넌트로 만들어주기 때문에
// 리액트 임포트는 굳이 필요없다
//import React from 'react';

// 브라우저-백엔드간 요청시 CORS 설정 필요
import AppLayout from "../components/AppLayout";
import PostForm from "../components/PostForm";
import {useDispatch, useSelector} from "react-redux";
import { END } from 'redux-saga';
import PostCard from "../components/PostCard";
import React, {useEffect} from "react";
import { useInView } from 'react-intersection-observer';
import {LOAD_POSTS_REQUEST} from "../reducers/post";
import {LOAD_MY_INFO_REQUEST} from "../reducers/user";
import wrapper from "../store/configureStore";
import axios from "axios";

const Home = () => {
    // AppLayout으로 감싸진 부분이 children

    const dispatch = useDispatch();
    const { me } = useSelector((state) => state.user);
    const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
    const [ref, inView] = useInView();

    // 화면이 로딩된 후에 사용자, 게시글 정보 가져오기
    // 화면이 처음 로딩될때는 정보가 없어서 데이터의 공백이 발생하므로
    // 화면을 처음 받아올 때부터 데이터를 가져올 수 있게 하려면?
    // 그럼 Home 컴포넌트보다 더 먼저 실행되야하는 것이 필요하다
    /*
    useEffect(() => {
        // 새로고침할 때마다 유저 정보 불러오기
        dispatch({
            type: LOAD_MY_INFO_REQUEST,
        });

        //홈 화면이 렌더링되면 포스트를 불러온다
        dispatch({
            type: LOAD_POSTS_REQUEST
        });
    }, []);

     */

    // 스크롤이 화면 끝까지 내려갔을 때
    // 더 로딩할 게시글들이 있는 경우
    // 실무에서는 완전 끝까지 내렸을 때가 아니라 밑에서 300px 위치쯤에서 요청한다
    useEffect(() => {
        // scrollY: 얼마나 내렸는지
        // clientHeight: 화면 길이
        // scrollHeight : 스크롤 총 길이
        if (inView && hasMorePosts && !loadPostsLoading) {
            // 마지막 게시글의 id
            const lastId = mainPosts[mainPosts.length - 1]?.id;
            dispatch({
                type: LOAD_POSTS_REQUEST,
                lastId,
            });
        }
    }, [inView, hasMorePosts, loadPostsLoading, mainPosts]);

    // 리트윗 에러 존재시 경고창 띄워주기
    useEffect(() => {
        if (retweetError) {
            alert(retweetError);
        }
    }, [retweetError]);

    return (
        <AppLayout>
            {me && <PostForm />}
            {mainPosts.map((post) =>
                <PostCard key={post.id} post={post}/>)}
            <div ref={hasMorePosts && !loadPostsLoading ? ref : undefined} style={{ height: 10 }} />
        </AppLayout>
    );
};

// getServersideProps가 서버측에서 Home 컴포넌트보다 먼저 실행된다
// 이렇게 해야 데이터가 채워진 상태로 화면이 렌더링된다.
// 프론트 서버에서 실행시킨다.
// 프론트 서버와 백엔드 서버와의 도메인이 다르기 때문에 쿠키 설정을 해줘야 한다
export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req }) => {
// 이 부분이 실행되면 HYDRATE부분으로 간다

    // 백엔드로 쿠키 전달하기
    // 쿠키 정보는 req.headers.cookie에 들어있다
    const cookie = req ? req.headers.cookie : '';
    axios.defaults.headers.Cookie = '';

    // 내가 쿠키를 써서 요청을 보낼 때만 쿠키를 넣고
    // 아닐 경우에는 쿠키 비워주기
    // 비워주지 않으면 쿠키 공유로 다른 유저가 나로 로그인될 수도 있음
    if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
    }

    // 서버 사이드 렌더링으로 내 정보, 게시글 정보 액션 디스패치
    store.dispatch({
        type: LOAD_MY_INFO_REQUEST,
    });
    store.dispatch({
        type: LOAD_POSTS_REQUEST,
    });

    // 요청이 성공이 되서 돌아올 때까지 기다린다
    store.dispatch(END);
    await store.sagaTask.toPromise();
});

export default Home;




























