import {Avatar, Button, Card, Comment, List, Popover} from "antd";
import {EllipsisOutlined, HeartOutlined, MessageOutlined, RetweetOutlined, HeartTwoTone} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import PostImages from './PostImages';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from "react";
import CommentForm from "./CommentForm";
import PostCardContent from "./PostCardContent";
import {LIKE_POST_REQUEST, REMOVE_POST_REQUEST, RETWEET_REQUEST, UNLIKE_POST_REQUEST} from "../reducers/post";
import FollowButton from "./FollowButton";
import Link from "next/link";
import moment from "moment";

moment.locale('ko');

// 게시글
const PostCard = ({ post }) => {

    // const { me } = useSelector((state) => state.user);
    // const id = me && me.id;
    // const id = me?.id;  // optional chaining 연산자

    const dispatch = useDispatch();
    const { removePostLoading } = useSelector((state) => state.post);
    const [commentFormOpened, setCommentFormOpened] = useState(false);
    // 내 id 정보 가져오기
    const id = useSelector((state) => state.user.me?.id);

    /*
    // 리트윗 에러 존재시 경고창 띄워주기
    useEffect(() => {
        if (retweetError) {
            alert(retweetError);
        }
    }, [retweetError]);

     */


    const onLike = useCallback(() => {
        if (!id) {
            return alert('로그인이 필요합니다');
        }

        dispatch({
            type: LIKE_POST_REQUEST,
            data: post.id,
        });
    }, [id]);

    const onUnlike = useCallback(() => {
        if (!id) {
            return alert('로그인이 필요합니다');
        }

        // 백엔드에서 req.user 안에 사용자 id가 들어있기에
        // 게시글 아이디만 넣어주기
        dispatch({
            type: UNLIKE_POST_REQUEST,
            data: post.id,
        });
    }, [id]);

    const onToggleComment = useCallback(() => {
        setCommentFormOpened((prev) => !prev);
    }, []);

    const onRemovePost = useCallback(() => {
        if (!id) {
            return alert('로그인이 필요합니다');
        }
        dispatch({
            type: REMOVE_POST_REQUEST,
            data: post.id   // 삭제하는 게시글 id
        });
    }, [id]);

    const onRetweet = useCallback(() => {
        if (!id) {
            return alert('로그인이 필요합니다');
        }
        return dispatch({
            type: RETWEET_REQUEST,
            data: post.id,
        });
    }, [id]);


    // 게시글 좋아요 누른 사람 중에 내가 있는지?
    const liked = post.Likers.find((v) => v.id === id);

    return (
        <div style={{ marginBottom: 10 }}>
            <Card
                cover={post.Images[0] && <PostImages images={post.Images} />}
                actions={[
                    <RetweetOutlined key="retweet" onClick={onRetweet}/>,
                    liked
                        ? <HeartTwoTone
                            twoToneColor="#eb2f96"
                            key="heart"
                            onClick={onUnlike} />
                        : <HeartOutlined
                            key="heart"
                            onClick={onLike} />,
                    <MessageOutlined key="comment" onClick={onToggleComment}/>,
                    <Popover key="more" content={(
                        <Button.Group>
                            {id && post.User.id === id ? (
                                <>
                                    <Button>수정</Button>
                                    <Button type="danger"
                                            onClick={onRemovePost}
                                            loading={removePostLoading}
                                    >삭제</Button>
                                </>
                            ) : <Button>신고</Button>}
                        </Button.Group>
                    )}>
                        <EllipsisOutlined/>
                    </Popover>
                ]}
                title={post.RetweetId ? `${post.User.nickname}` : null}
                extra={ id && <FollowButton post={post} />}
            >
                {post.RetweetId && post.Retweet
                ? (
                    <Card
                        cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}>
                        <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
                        <Card.Meta
                            avatar={
                                <Link href={`/user/${post.Retweet.User.id}`}>
                                    <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                                </Link>
                            }
                            title={post.Retweet.User.nickname}
                            description={<PostCardContent postData={post.Retweet.content} />}
                        />
                    </Card>
                    )
                : (
                    <>
                        <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
                        <Card.Meta
                            avatar={
                                <Link href={`/user/${post.User.id}`}>
                                    <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                                </Link>
                            }
                            title={post.User.nickname}
                            description={<PostCardContent postData={post.content} />}
                        />
                    </>

                    )
                }

            </Card>
            {commentFormOpened && (
                <div style={{ marginTop: 10 }}>
                    <CommentForm post={post}/>
                    <List header={`${post.Comments.length}개의 댓글`}
                          itemLayout="horizontal"
                          dataSource={post.Comments}
                          renderItem={(item) => (
                              <li>
                                  <Comment
                                      author={item.User.nickname}
                                      avatar={
                                          <Link href={`/user/${item.User.id}`}>
                                              <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                                          </Link>
                                      }
                                      content={item.content}
                                  />
                              </li>
                          )}
                    />
                </div>
            )}
        </div>
    );
};

PostCard.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.number,
        User: PropTypes.object,
        content: PropTypes.string,
        createdAt: PropTypes.object,
        Comments: PropTypes.arrayOf(PropTypes.object),
        Images: PropTypes.arrayOf(PropTypes.object),
        Likers: PropTypes.arrayOf(PropTypes.object),
        RetweetId: PropTypes.number,
        Retweet: PropTypes.objectOf(PropTypes.any),
    }).isRequired
};

export default PostCard;
