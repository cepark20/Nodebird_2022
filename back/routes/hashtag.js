

const express = require('express');
const {Op} = require("sequelize");
const router = express.Router();

const { Post, Comment, Hashtag, User, Image } = require('../models');


router.get('/:hashtag', async (req, res, next) => {
    try {

        // where: 게시글을 가져오는 조건
        const where = {};

        // 쿼리스트링이라서 req.query에 들어있다
        if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 경우(스크롤 내려서 더 불러오는 상황) lastId보다 작은 10개 게시글 불러오기
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
        }

        // 먼저 게시글 10개만 가져오기 (스크롤 시 더 가져오도록)
        // 실무에서는 리밋오프셋 잘 안쓴다
        const posts = await Post.findAll({
            where,
            limit: 10,
            // 게시글 정렬, 댓글 정렬
            order: [
                ['createdAt', 'DESC'],
                [Comment, 'createdAt', 'DESC']
            ],
            include: [{
                model: Hashtag,
                where: { name: decodeURIComponent(req.params.hashtag) },
            }, {
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

module.exports = router;
