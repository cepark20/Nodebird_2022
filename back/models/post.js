module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // RetweetId 생성
    }, {
        // 게시글에는 이모티콘 정보가 들어갈 수도 있으므로
        // mb4도 같이 적어주기
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    });

    Post.associate = (db) => {

        // 시퀄라이즈에서 테이블 관계를 쉽게 쓸 수 있도록
        // add, get, set, remove를 제공한다

        // 게시글은 어떤 작성자에게 속해있다.
        // 게시글의 작성자 정보
        db.Post.belongsTo(db.User); //post.addUser, getUser, setUser 가능

        // 게시글은 여러 개의 댓글을 가질 수 있다.
        db.Post.hasMany(db.Comment); //addImages, getImages 가능

        // 게시글 하나에는 여러 개의 이미지를 가질 수 있다
        // post.addImages(hasMany이므로 복수)
        db.Post.hasMany(db.Image);


        // 시퀄라이즈를 통해서 쉽게 관계 작성 가능
        // belongsto는 단수, Many 붙은건 복수

        // 게시글은 여러 개의 해시태그를 가질 수 있고,
        // 해시태그 하나로 여러 게시글 정보를 조회할 수 있다
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' }); //다대다 관계

        // 좋아요 관계
        // 게시글에 좋아요를 누른 사람 정보 User 대신 Likers로
        // 중간 테이블 이름 설정해주기 { through: 'Like' }

        // post.addLikers가 생긴다 (게시글에 좋아요한 사람 추가)
        // post.removeLikers도 생긴다 (게시글에 좋아요한 사람 삭제)
        db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers'});

        // 어떤 게시글은 다른 게시글을 리트윗한 게시글일 수도 있다
        // 한 게시글을 여러 개의 게시글로 리트윗할 수는 있지만,
        // 리트윗한 게시글은 단 하나뿐이므로(원본 게시글) 일대다 관계
        // 원본 게시글은 하나! 여러 게시글이 리트윗!
        // post.addRetweet
        db.Post.belongsTo(db.Post, { as: 'Retweet' });

    };
    return Post;
};

// as에 따라서 post.getLikers로 게시글 좋아요 누른 사람을 가져오게 된다.