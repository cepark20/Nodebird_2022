
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

import Head from "next/head";
import {useDispatch, useSelector} from "react-redux";
import React, {useCallback, useEffect, useState} from "react";
import Router from "next/router";
import useSWR, { useSWRPages } from 'swr';  // 리덕스 액션 대신 사용해보자
import {LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST} from "../reducers/user";
import axios from "axios";

const fetcher = (url) =>
    axios.get(url, { withCredentials: true}).then((result) => result.data);

const Profile = () => {

    // 더미 데이터
   // const follwerList = [{ nickname: '제로초1'}, { nickname: '제로초2'}, { nickname: '제로초3'}];
    //const follwingList = [{ nickname: '제로초1'}, { nickname: '제로초2'}, { nickname: '제로초3'}];

    const dispatch = useDispatch();
    const { me } = useSelector((state) => state.user);
    const [followersLimit, setFollowersLimit] = useState(3);
    const [followingsLimit, setFollowingsLimit] = useState(3);

    // fetcher: 주소를 어떻게 가져올 것인가
    const { data: followersData, error: followerError } =
        useSWR(`http://localhost:3065/user/followers?limit=${followersLimit}`, fetcher);
    const { data: followingsData, error: followingError } =
        useSWR(`http://localhost:3065/user/followings?limit=${followingsLimit}`, fetcher);

    // 데이터 불러오는 낭비를 줄이려면 useEffect에서 followersData의 id로 비교헤서
    // 기존 state에 concat 하기
    // swrinfinite 써보기



    // 팔로잉 팔로우 목록 불러오기
    /*
    useEffect(() => {
        dispatch({
            type: LOAD_FOLLOWERS_REQUEST,
        });
        dispatch({
            type: LOAD_FOLLOWINGS_REQUEST,
        });

    }, []);

     */

    // 프로필 페이지에서 로그아웃하는 경우 홈 화면으로 리다이렉트 해주기
    useEffect(() => {
        if (!(me && me.id)) {
            Router.push('/');
        }
    }, [me && me.id]);

    const loadMoreFollowings = useCallback(() => {
        setFollowingsLimit((prev) => prev + 3);
    }, []);

    const loadMoreFollowers = useCallback(() => {
        setFollowersLimit((prev) => prev + 3);
    }, []);

    // 로그인하지 않았을 때는 프로필 페이지가 보이지 않도록
    if(!me) {
        // me를 로딩하는 동안 보여줄 화면을 넣어줘도 된다
        return '내 정보 로딩중';
    }

    if (followerError || followingError) {
        console.error(followerError || followingError);
        return <div>팔로잉/팔로워 로딩 중 에러가 발생합니다.'</div>
    }

    return (
        <>
            <Head>
                <title> My Profile | NodeBird </title>
            </Head>
            <AppLayout>
                <NicknameEditForm />
                <FollowList header="Following List"
                            loading={!followingsData && !followingError}
                            data={followingsData}
                            onClickMore={loadMoreFollowings} />
                <FollowList header="Follower List"
                            loading={!followersData && !followerError}
                            data={followersData}
                            onClickMore={loadMoreFollowers} />
            </AppLayout>
        </>
    );
};

export default Profile;
