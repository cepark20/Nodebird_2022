import {Button, Form, Input} from "antd";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {addPost, UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE, ADD_POST_REQUEST} from "../reducers/post";

// 게시글 작성 폼
const PostForm = () => {

    const { me } = useSelector((state) => state.user);
    const { imagePaths, addPostDone, addPostLoading } = useSelector((state) => state.post);
    const dispatch = useDispatch();
    const imageInput = useRef();
    const [text, setText] = useState('');

    useEffect(() => {
        if (addPostDone) {
            setText('');
        }
    }, [addPostDone]);

    const onChangeText = useCallback((e) => {
        setText(e.target.value);
    }, []);

    // 게시글 작성 버튼을 누르면 addPost액션을 디스패치한다
    // 게시글 작성 시 이미지 경로까지 같이 업로드 해주기
    const onSubmitForm = useCallback(() => {
        if (!text || !text.trim())
            return alert('게시글을 작성해주세요.');

        // 참고로 이미지가 없는 경우는 굳이 formData로 만들지 말고
        // data: { imagePaths, content: text, } 이런 json으로 보내는 게 더 좋다

        const formData = new FormData();
        // 이미지 경로 추가하기
        imagePaths.forEach((p) => {
            // key가 image이므로 서버측에서는 req.body.image
            formData.append('image', p);
        });

        // 게시글 내용 추가하기
        formData.append('content', text);
       //  dispatch(addPost(text));

        return dispatch({
            type: ADD_POST_REQUEST,
            data: formData,
        });
    }, [text, imagePaths]);

    // 사진 업로드 버튼 클릭시 ref를 사용해서 사진 업로드 창 띄우기
    const onClickImageUpload = useCallback(() => {
        imageInput.current.click();
    }, [imageInput.current]);

    const onChangeImages = useCallback((e) => {
        // e.target.files에 선택한 이미지에 대한 정보가 들어있다
        console.log('images', e.target.files);

        //멀티파트 형식으로 데이터 바꾸기
        const imageFormData = new FormData();
        [].forEach.call(e.target.files, (f) => {

            // image는 키 값으로 upload.array(키값)같아야 한다
            imageFormData.append('image', f);
        });
        dispatch({
            type: UPLOAD_IMAGES_REQUEST,
            data: imageFormData,
        });
    }, []);

    const onRemoveImage = useCallback((index) => () => {
        dispatch({
            type: REMOVE_IMAGE,
            data: index,
        });
    }, []);

    return (
        <Form
            style={{ margin: '10px 0 20px' }}
            encType="multipart/form-data"
            onFinish={onSubmitForm}>

            <Input.TextArea
                value={text}
                onChange={onChangeText}
                maxLength={140}
                placeholder="오늘의 행복한 사건은?"/>

            <div>
                <input type="file"
                       name="image"
                       multiple
                       hidden
                       ref={imageInput}
                       onChange={onChangeImages}
                />
                <Button onClick={onClickImageUpload}>Upload Images</Button>
                <Button type="primary"
                        loading={addPostLoading}
                        style={{ float: 'right' }}
                        htmlType="submit">
                    Twits!
                </Button>
            </div>
            <div>
                {  // 이미지 업로드 시 이미지 미리보기
                    // map 안에 콜백함수에서 데이터를 넣으려면 고차함수로 써주기
                    imagePaths.map((v, i) => (
                    <div key={v} style={{ display: 'inline-block' }}>
                        <img src={`http://localhost:3065/${v}`} style={{ width: '200px' }} alt={v}/>
                        <div>
                            <Button onClick={onRemoveImage(i)}>제거</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Form>
    )
};

export default PostForm;