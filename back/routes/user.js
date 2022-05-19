
// 라우터 분리하기

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {Op} = require("sequelize");

const { User, Post, Comment, Image } = require('../models');  //db.User
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 매번 새로고침할 때마다 로그인이 풀리기 때문에
// 새로고침하면 브라우저의 쿠키 정보를 서버로 넘겨서 로그인 유지해주기

// 내 정보 불러오기
router.get('/', async (req, res, next) => {
    try {

        // req.headers 안에 쿠키가 들어있다.
        console.log(req.headers);
        // 로그인하지 않은 상태에서는 새로고침해도 유저 정보가 없어 에러가 날 수 있으므로
        if (req.user) {
            const fullUserWithoutPassword = await User.findOne({
                where: { id: req.user.id },
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model: Post,
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followers',
                    attributes: ['id'],
                }]
            });
            res.status(200).json(fullUserWithoutPassword);
        } else {
            res.status(200).json(null);
        }

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

// 팔로우 목록 불러오기
router.get('/followers', isLoggedIn, async (req, res, next) => {
    try {

        // 내 정보 찾기
        const user = await User.findOne({
            where: { id: req.user.id }
        });
        if (!user) {
            res.status(403).send('존재하지 않는 유저입니다.');
        }

        const followers = await user.getFollowers({
            limit: parseInt(req.query.limit, 10),
        });
        res.status(200).json(followers);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 팔로잉 목록 불러오기
router.get('/followings', isLoggedIn, async (req, res, next) => {
    try {
        // 내 정보 찾기
        const user = await User.findOne({
            where: { id: req.user.id }
        });

        if (!user) {
            res.status(403).send('존재하지 않는 유저입니다.');
        }

        const followings = await user.getFollowings({
            limit: parseInt(req.query.limit, 10),
        });
        res.status(200).json(followings);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 특정 사용자 정보 불러오기
router.get('/:userId', async (req, res, next) => { // GET /user/3
    try {
        const fullUserWithoutPassword = await User.findOne({
            where: { id: req.params.userId },
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Post,
                attributes: ['id'],
            }, {
                model: User,
                as: 'Followings',
                attributes: ['id'],
            }, {
                model: User,
                as: 'Followers',
                attributes: ['id'],
            }]
        })
        if (fullUserWithoutPassword) {
            const data = fullUserWithoutPassword.toJSON();
            data.Posts = data.Posts.length;
            data.Followings = data.Followings.length;
            data.Followers = data.Followers.length;
            res.status(200).json(data);
        } else {
            res.status(404).json('존재하지 않는 사용자입니다.');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// 특정 사용자의 게시글들 가져오기
router.get('/:userId/posts', async (req, res, next) => {
    try {
        // where: 게시글을 가져오는 조건
        const where = { UserId: req.params.userId };

        // 쿼리스트링이라서 req.query에 들어있다
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 경우(스크롤 내려서 더 불러오는 상황) lastId보다 작은 10개 게시글 불러오기
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        }

        const posts = await Post.findAll({
            where,
            limit: 10,

            // 게시글 정렬, 댓글 정렬
            order: [
                ['createdAt', 'DESC'],
                [Comment, 'createdAt', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['id', 'nickname']
            }, {
                model: Image,
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname']
                }]
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id']
            }, {
                model: Post,
                as: 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }, {
                    model: Image
                }]
            }],
        });
        console.log(posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// POST /user/login
// 로그인 전략 실행

// 원래 next를 사용할 수 없는데 미들웨어를 확장해서 사용하도록 하자
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        // (서버 에러, 성공, 클라이언트 에러 )
        // done에서 보내온 정보들이 options에 담긴다

        // 서버측 에러가 있을 경우
        if (err) {
            console.error(err);
            return next(err);
        }

        // 클라이언트 에러가 있을 경우
        if (info) {
            //  { reason: '존재하지 않는..' } 이런게 info
            //401: 로그인이 잘못됨
            return res.status(401).send(info.reason);
        }

        // 성공 시 passport를 통해 로그인 진행
        return req.login(user, async (loginErr) => {
            // passport 로그인시 에러가 발생하면
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }

            const fullUserWithoutPassword = await User.findOne({
                where: { id: user.id },
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model: Post,
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followings',
                    attributes: ['id'],
                }, {
                    model: User,
                    as: 'Followers',
                    attributes: ['id'],
                }]
            });

            // 사용자 정보 프론트로 넘겨주기 (쿠키와 사용자 id 프론트로!)
            // me가 여기서 넘겨준 user
            return res.status(200).json(fullUserWithoutPassword);
        });

    })(req, res, next);
});
/*
router.post('/login', async (req, res, next) => {

});

 */

//  POST /user
router.post('/', isNotLoggedIn, async (req, res, next) => {
    try {

        // 이메일 중복 체크
        const exUser = await User.findOne({
            // where: 조건
            where: {
                email: req.body.email,
            }
        });  // --> 없으면 null

        if (exUser) { // 응답을 보내서 라우터 종료시키기

            // 상태 전송
            // 상태도 헤더의 일종
            // 브라우저에서 잘못된 데이터를 보냈으므로 상태 400번대
            return res.status(403).send('가입된 아이디입니다.');
        }

        // 비밀번호 암호화
        // 두번째 인자로 넣어주는 숫자는 10-13정도를 자주 넣어주는데
        // 이 숫자는 높을수록 보안이 센 것 (해쉬화)
        // 서버가 느리다면 너무 높은 것은 비추천
        const hashedPassword =
            await bcrypt.hash(req.body.password, 10);

        // 테이블에 데이터 넣기
        await User.create({
            email: req.body.email,
            nickname: req.body.nickname,
            password: hashedPassword,
        });
        // 200: 성공  300: 리다이렉트  400: 클라이언트 에러  500: 서버 에러
        // 201: 성공적으로 생성됨

        // 1. CORS 해결방식 : 헤더 추가하기
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3060');
        // 2. npm i cors



        res.status(201).send('sign up ok');
    }catch (error) {
        console.error(error);

        // status 500번대
        next(error); // 에러가 발생하면 익스프레스가 넥스트로 자동으로 에러를 알려줘서 에러 처리
    }
});

router.post('/logout', isLoggedIn, (req, res) => {
    // 로그인한 후부터 req.user에 정보가 들어있다.
    // 라우터 실행되기 전에 passport 디시리얼라이즈가 진행되므로 항상 req.user에 ㅈ
    // 사용자 정보가 있다
    req.logout();
    req.session.destroy();  // 세션에 저장된 아이디, 쿠키 제거
    res.send('logout ok');
});

// 닉네임 변경
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
    try {
        await User.update({
            nickname: req.body.nickname,  // req.body.nickname: 프론트에서 작성한 닉네임
        }, {
            where: { id: req.user.id },
        });
        res.status(200).json({ nickname: req.body.nickname });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 팔로우
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.userId }
        });
        if (!user) {
            res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
        }
        await user.addFollowers(req.user.id);
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 팔로우 취소
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.userId }
        });
        if (!user) {
            res.status(403).send('없는 사람을 언팔로우하려고 하시네요?');
        }
        await user.removeFollowers(req.user.id);
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 팔로우 차단하기(팔로잉 취소)
// 내가 그 사람을 차단하는 것이 아니라 그 사람이 나를 팔로우를 끊도록!
// 그 사람의 팔로잉 목록에서 나를 없애자
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
    try {

        // 팔로우 차단하려는 사람 찾기
        const user = await User.findOne({
            where: { id: req.params.userId }
        });
        if (!user) {
            res.status(403).send('없는 사람을 팔로우 차단시키려고 하시네요?');
        }

        await user.removeFollowings(req.user.id);
        res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;