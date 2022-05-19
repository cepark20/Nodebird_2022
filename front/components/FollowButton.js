
import PropTypes from 'prop-types';
import { Button } from "antd";
import React, {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import {FOLLOW_REQUEST, UNFOLLOW_REQUEST} from "../reducers/user";
import styled from "styled-components";

const ButtonWrapper = styled.div`

  #follow {
    background-color: #1890ff;
    color: white;
  }
  
  #unfollow {
    background-color: white;
    color: #1890ff;
  }
`

const FollowButton = ( { post }) => {
    const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    // 팔로잉 여부 확인하기
    // 게시글 작성자가 나의 팔로잉 목록에 있나없나 확인하기
    const isFollowing = me && me.Followings.find((v) => v.id === post.User.id);
    const onFollowBtn = useCallback(() => {
        // 팔로잉을 하고 있는데 팔로우 버튼을 누를 경우 언팔로우
        if (isFollowing) {
            dispatch({
                type: UNFOLLOW_REQUEST,
                data: post.User.id
            });
        } else {
            dispatch({
                type: FOLLOW_REQUEST,
                data: post.User.id
            });
        }
    }, [isFollowing]);


    // 훅스보다 아래에 return 구문이 있어야 한다
    // 게시글 작성자 id와 내 id가 같으면 팔로우 버튼은 보여주지 않도록 하자
    if (post.User.id === me.id) {
        return null;
    }

    return (
        <ButtonWrapper>
            <Button
                id={isFollowing ? 'unfollow' : 'follow'}
                type="primary"
                loading={followLoading || unfollowLoading}
                onClick={onFollowBtn}>
                {isFollowing ? '팔로잉' : '팔로우'}
            </Button>
        </ButtonWrapper>

    );
};

FollowButton.propTypes = {
    post: PropTypes.object.isRequired
};

export default FollowButton;