
import { useSelector } from 'react-redux';
import Head from 'next/head';
import { END } from 'redux-saga';

import { Avatar, Card } from 'antd';
import AppLayout from '../components/AppLayout';
import wrapper from '../store/configureStore';
import { LOAD_USER_REQUEST } from '../reducers/user';

const Profile = () => {
    const { userInfo } = useSelector((state) => state.user);

    return (
        <AppLayout>
            <Head>
                <title>JanePark | NodeBird</title>
            </Head>
            {userInfo
                ? (
                    <Card
                        actions={[
                            <div key="twit">
                                짹짹
                                <br />
                                {userInfo.Posts}
                            </div>,
                            <div key="following">
                                팔로잉
                                <br />
                                {userInfo.Followings}
                            </div>,
                            <div key="follower">
                                팔로워
                                <br />
                                {userInfo.Followers}
                            </div>,
                        ]}
                    >
                        <Card.Meta
                            avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
                            title={userInfo.nickname}
                            description="주니어 프론트엔드 개발자"
                        />
                    </Card>
                )
                : null}
        </AppLayout>
    );
};

export const getStaticProps = wrapper.getStaticProps((store) => async ({ req }) => {
    console.log('getStaticProps');
    store.dispatch({
        type: LOAD_USER_REQUEST,
        data: 1,
    });
    store.dispatch(END);
    await store.sagaTask.toPromise();
});

export default Profile;

