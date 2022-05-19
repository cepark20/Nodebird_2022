
// 다이나믹 라우팅용 페이지

import { useRouter } from 'next/router';
import wrapper from "../../store/configureStore";
import axios from "axios";
import {LOAD_MY_INFO_REQUEST} from "../../reducers/user";
import {END} from "redux-saga";
import {LOAD_POST_REQUEST} from "../../reducers/post";
import AppLayout from "../../components/AppLayout";
import PostCard from "../../components/PostCard";
import {useSelector} from "react-redux";
import Head from 'next/head';

// 게시글 1개씩 보여주기

const Post = () => {
    const router = useRouter();
    const { id } = router.query;
    const { singlePost } = useSelector((state) => state.post);

    if (!singlePost) {
        console.log('singlepsotisnull');
    }

    console.log('single post', singlePost);

    return (
        <AppLayout>
            <Head>
                <title>{singlePost.User.nickname}님의 글</title>
                <meta name="description" content={singlePost.content} />
                <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
                <meta property="og:description" content={singlePost.content} />
                <meta property="og:image" content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
                <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
            </Head>
            <PostCard post={singlePost} />
        </AppLayout>
    );

};

export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req, params }) => {
    const cookie = req ? req.headers.cookie : '';
    axios.defaults.headers.Cookie = '';

    if (req && cookie) {
        axios.defaults.headers.Cookie = cookie;
    }

    // 서버 사이드 렌더링으로 내 정보, 게시글 정보 액션 디스패치
    store.dispatch({
        type: LOAD_MY_INFO_REQUEST,
    });
    store.dispatch({
        type: LOAD_POST_REQUEST,
        data: params.id
    });

    // 요청이 성공이 되서 돌아올 때까지 기다린다
    store.dispatch(END);
    await store.sagaTask.toPromise();

});

export default Post;