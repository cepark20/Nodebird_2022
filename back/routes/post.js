
// 라우터 분리하기

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Comment, Image, User, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');  // 로그인 여부판별하는 미들웨어

const router = express.Router();

try {
    fs.accessSync('uploads');  // uploads 폴더 유무 검사
} catch (err) {
    console.log('uploads 폴더 생성')
    fs.mkdirSync('uploads');
}

const upload = multer({
    // 어디에 저장할 것인가? 컴퓨터의 하드디스크
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads');   // uploads라는 폴더에 저장해라
        },
        filename(req, file, done) {
            // 파일명 중복을 막기 위해 파일명 뒤에 업로드 시간 붙여주기
            // .확장자 추출
            const ext = path.extname(file.originalname);

            // 파일 이름 추출
            const basename = path.basename(file.originalname, ext);

            // 파일명에 시간 합치기
            done(null, basename + '_' + new Date().getTime() + ext);
        },
    }),

    // 이미지 파일 용량 설정 20mb 이하
    limits: { fileSize: 20 * 1024 * 1024 },
});


//  POST /post
// 게시글 작성하기
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
    // res.json({ id: 1, content: 'hi'});
    try {
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        const post = await Post.create({
            content: req.body.content,
            UserId: req.user.id,
        });

        // 게시글에 해시태그가 존재할 경우
        // 디비에 등록된 해시태그가 있는 경우 등록하지 않고 가져오고 없으면 등록: findOrCreate
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map((tag) =>
                    Hashtag.findOrCreate(
                        { where: { name: tag.slice(1).toLowerCase() }})));

            // result의 형태: [[node, true], [react, false]]
            await post.addHashtags(result.map((v) => v[0]));
        }


        // req.body.image에 이미지 경로가 들어있다
        if (req.body.image) {
            if (Array.isArray(req.body.image)) {
                // 이미지를 여러개 올린경우 image: [제로.png, 부기.png]
                // db는 파일 주소만 가지고 있다 
                const images =
                    await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
                await post.addImages(images);
            } else {
                // 이미지를 한 개만 올린 경우 image: 제로.png
                const image = await Image.create({ src: req.body.image });
                await post.addImages(image);
            }
        }

        // 게시글 정보로만은 부족하기 때문에
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [{
                model: Image  // 게시글의 이미지 정보
            }, {
                model: Comment,  // 게시글의 댓글 정보
                include: [{
                    model: User,
                    attributes: ['id', 'nickname']
                }]
            }, {
                model: User,   // 게시글 작성자 정보
                attributes: ['id', 'nickname']
            }, {
                model: User,   // 좋아요 누른 사람 정보
                as: 'Likers',  // 이게 있어야 post.Likers 가능
                attributes: ['id']
            }]
        });

        // 생성된 post 객체를 프론트로 돌려주기
        res.status(201).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }

});

// 이미지 업로드용 라우터
// upload.array는 이미지를 여러 개 올릴 수도 있으므로 array
// 이미지 한 장이면 upload.single 쓰기
// text만 있으면 upload.none()


// 브라우저 -> 백엔드
// 멀티파트 폼 전송 시 이미지만 먼저 서버에 업로드해두고
// 이미지 파일명을 return 받아서
// 리사이징, 미리보기등을 하고
// 컨텐츠를 작성한다(요청 2번)

router.post('/images', isLoggedIn, upload.array('image'), async (req, res, next) => {
    console.log(req.files);   // req.files에 이미지 파일에 관한 정보가 들어있다
    res.json(req.files.map((v) => v.filename));
});

// 게시글 공유를 위한 1개 게시글 가져오기
router.get('/:postId', async (req, res, next) => {
    try {
        console.log('게시글 공유 1개 가져오기 ');

        // 실제로 그 게시글이 존재하는가 확인해보기
        const post = await Post.findOne({
            where: { id: req.params.postId },  //req.params.postId인 것은 주소에 :postId라고 되어있기 때문
        });

        if (!post) {
            console.log('존재하지 않는 게시글입니다.');
            return res.status(404).send('존재하지 않는 게시글입니다.');
        }

        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [{
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image,
            }, {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                    order: [['createdAt', 'DESC']],
                }],
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id']
            }],
        });
        res.status(200).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 리트윗
router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => {
    try {

        // 실제로 그 게시글이 존재하는가 확인해보기
        const post = await Post.findOne({
            where: { id: req.params.postId },  //req.params.postId인 것은 주소에 :postId라고 되어있기 때문
            include: [{
                model: Post,
                as: 'Retweet'
            }],
        });

        if (!post) {
            console.log('존재하지 않는 게시글입니다.');
            return res.status(403).send('존재하지 않는 게시글입니다.');
        }

        // req.user.id === post.UserId : 내가 내 게시글 리트윗하는 것
        //post.Retweet && post.Retweet.UserId === req.user.id : 자신의 게시글을 리트윗한 게시글을 내가 다시 리트윗하는 것
        if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
            return res.status(403).send("자신의 글을 리트윗할 수 없습니다");
        }

        // post.RetweetId가 있는 것은 해당 게시글이 다른 게시글의 리트윗 게시글이라는 것
        const retweetTargetId = post.RetweetId || post.id;

        const exPost = await Post.findOne({
            where: {
                UserId: req.user.id,
                RetweetId: retweetTargetId,
            }
        });

        // 이미 리트윗한 게시글을 다시 리트윗하는 것을 막아주는 것
        if (exPost) {
            return res.status(403).send('이미 리트윗한 게시글입니다.');
        }

        const retweet = await Post.create({
            UserId: req.user.id,
            RetweetId: retweetTargetId,
            content: 'retweet',  //content 값은 db model에서 allowNull false로 해놔서 꼭 필수
        });

        // 리트윗 게시글의 원본 게시글 정보도 가져오기
        const retweetWithPrevPost = await Post.findOne({
            where: { id: retweet.id },
            include: [{
                model: Post,
                as: 'Retweet',
                include: [{
                    model: User,
                    attributes: ['id', 'nickname'],
                }, {
                    model: Image
                }]
            }, {
                model: User,
                attributes: ['id', 'nickname'],
            }, {
                model: Image
            }, {
                model: Comment,
                include: [{
                    model: User
                }]
            }, {
                model: User,
                as: 'Likers',
                attributes: ['id']
            }],
        })

        res.status(201).json(retweetWithPrevPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
});



// 댓글 작성하기
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
    // res.json({ id: 1, content: 'hi'});
    try {

        // 실제로 그 게시글이 존재하는가 확인해보기
        const post = await Post.findOne({
            where: { id: req.params.postId },  //req.params.postId인 것은 주소에 :postId라고 되어있기 때문
        });

        // 만약 존재하지 않는 게시글의 댓글을 작성하려고 했다면
        if (!post) {
            console.log('존재하지 않는 게시글입니다.');
            return res.status(403).send('존재하지 않는 게시글입니다.');
        }

        const comment = await Comment.create({
            content: req.body.content,
            //req.params는 문자열이기 때문에 숫자로 바꿔주기
            PostId: parseInt(req.params.postId),
            UserId: req.user.id,   // 디시리얼라이즈로 생성된 req.user
        });

        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['id', 'nickname']
            }]
        });

        res.status(201).json(fullComment);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// db 조작할 떄 항상 await 붙여주기
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId }});
        if (!post) {
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }

        // 게시글이 존재하는 경우
        // 게시글 테이블과 사용자 테이블 관계 이용하기
        await post.addLikers(req.user.id);
        res.json({ PostId: post.id, UserId: req.user.id });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 좋아요 취소
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId }});
        if (!post) {
            return res.status(403).send('게시글이 존재하지 않습니다.');
        }
        await post.removeLikers(req.user.id);
        res.json({ PostId: post.id, UserId: req.user.id });

    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 게시글 삭제
router.delete('/:postId', isLoggedIn, async (req, res, next) => {
    try {
        // 시퀄라이즈에서 제거할 때 destroy를 쓴다
        await Post.destroy({
            where: { id: req.params.postId },
            UserId: req.user.id,
        });

        // 문자열이 프론트로 보내지므로 숫자로 바꿔주기
        res.json({ PostId: parseInt(req.params.postId, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// /post가 공통이므로 post를 지우고 app.use에 /post 추가
router.delete('/', (req, res) => {
    res.json({ id: 1 });
});

module.exports = router;