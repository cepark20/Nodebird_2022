
import PropTypes from 'prop-types';
import {Button, Form, Input} from "antd";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ADD_COMMENT_REQUEST} from "../reducers/post";

// CommentForm: 댓글 작성 폼

// 어떤 게시글의 댓글인지 정보가 필요하므로 post를 넘겨받는다
const CommentForm = ({ post }) => {

    // 내 아이디 정보 가져오기(리듀서에서!)
    const id = useSelector((state) => state.user.me?.id);
    const [commentText, setCommentText] = useState('');

    const dispatch = useDispatch();
    const { addCommentLoading, addCommentDone } = useSelector((state) => state.post);

    useEffect(() => {
        if (addCommentDone) {
           setCommentText('');
        }
    }, [addCommentDone]);

    const onChangeCommentText = useCallback((e) => {
        setCommentText(e.target.value);
    }, []);

    // 댓글 작성 버튼 클릭
    const onSubmitComment = useCallback(() => {
        console.log(post.id, commentText);
        dispatch({
            type: ADD_COMMENT_REQUEST,
            data: {
                // 댓글 내용, 게시글 ID, 댓글 작성자 ID
                content: commentText,
                postId: post.id,
                userId: id }
        })
    }, [commentText, id]);

    return (
        <Form onFinish={onSubmitComment}>
            <Form.Item style={{ position: 'relative', margin: 0 }}>
                <Input.TextArea value={commentText}
                                onChange={onChangeCommentText}
                                rows={4}/>
                <Button style={{ position: 'absolute', right: 0, bottom: -40, zIndex: 1 }}
                        type="primary"
                        loading={addCommentLoading}
                        htmlType="submit">Comment!</Button>
            </Form.Item>
        </Form>
    );
};

CommentForm.propTypes = {
    post: PropTypes.object.isRequired
};

export default CommentForm;

