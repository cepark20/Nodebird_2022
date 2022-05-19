
import React from "react";
import {Button, Card, List} from "antd";
import PropTypes from 'prop-types';
import {StopOutlined} from "@ant-design/icons";
import {useDispatch} from "react-redux";
import {UNFOLLOW_REQUEST,REMOVE_FOLLOWER_REQUEST} from "../reducers/user";

const FollowList = ({ header, data, onClickMore, loading }) => {

    const dispatch = useDispatch();
    const onCancel = (id) => () => {

        // 팔로잉 목록에서 팔로잉 취소
        if (header === '팔로잉') {
            dispatch({
                type: UNFOLLOW_REQUEST,
                data: id
            });
        }

        // 내 팔로우 목록에서 팔로우 차단하기
        dispatch({
            type: REMOVE_FOLLOWER_REQUEST,
            data: id
        });
    };

    return (
        <List
            style={{ marginBottom: 20 }}
            grid={{ gutter: 4, xs: 2, md: 3 }}
            size="small"
            header={<div>{header}</div>}
            loadMore={
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                    <Button onClick={onClickMore} loading={loading}>Load More</Button>
                </div>}
            bordered
            dataSource={data}
            renderItem={(item) => (
                <List.Item style={{ marginTop: 20 }}>
                    <Card
                        actions={[<StopOutlined key="stop" onClick={onCancel(item.id)}/>]}>
                        <Card.Meta description={item.nickname} />
                    </Card>
                </List.Item>
            )}
            />
    )
};

FollowList.propTypes = {
    header: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    onClickMore: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

export default FollowList;