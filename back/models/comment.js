module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // UserId, PostId(belongsto)
    }, {
        // 댓글에는 이모티콘 정보가 들어갈 수도 있으므로
        // mb4도 같이 적어주기
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    });

    Comment.associate = (db) => {
        // 하나의 댓글 작성자는 하나의 user에게만 속해있다
        db.Comment.belongsTo(db.User);

        // 하나의 댓글은 하나의 게시글에만 속해있다.
        db.Comment.belongsTo(db.Post);

        // belongsto 는 PostId, UserId 컬럼을 만들어준다
    };
    return Comment;
};