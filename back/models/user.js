

// 시퀄라이즈에서 테이블을 모델이라고 부른다
module.exports = (sequelize, DataTypes) => {
    //DATATYPE: INTEGER, FLOAT, DATETIME, TEXT...
    const User = sequelize.define('User', { // mysql에서 users 테이블
        // id가 기본적으로 들어 있다
        email: {
            type: DataTypes.STRING(30),  // 긴 글은 TEXT
            allowNull: false,   //필수
            unique: true   // 고유한 값
        },
        nickname: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),  // 비밀번호 암호화
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',  // 한글 저장
    });

    User.associate = (db) => {
        // User가 여러개의 Post를 가질 수 있다.
        // 사용자가 여러 개의 게시글을 작성할 수 있다
        db.User.hasMany(db.Post);

        // 사용자가 여러 개의 댓글을 가질 수 있다
       db.User.hasMany(db.Comment);

       // 좋아요 : 사용자가 게시글에 좋아요를 여러 개 누를 수 있고
       // 게시글도 여러 명의 사용자로부터 좋아요를 받을 수 있다.
       // 좋아요도 다대다 관계

        // Post 대신 Liked로
        // Liked 테이블은 UserId와 PostId를 갖는다
       db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' });

       //사용자 간 팔로우 관계(다대다 관계)
       // UserId 대신 FollowingId, FollowerId로 !
       // through : 테이블 이름을 바꿔주고
       // foreignKey: 컬럼명을 바꿔준다.
       db.User.belongsToMany(db.User,
           { through: 'Follow', as: 'Followers', foreignKey: 'FollowingId' });
       db.User.belongsToMany(db.User,
           { through: 'Follow', as: 'Followings', foreignKey: 'FollowerId' });

       // 참고: 나의 팔로잉을 찾으려면 나를 먼저 찾아야 한다 즉 팔로워 id(나)를 먼저 찾고 그 다음 팔로잉을 찾는다


    };
    return User;
};   // --> 자동으로 users 테이블 생성