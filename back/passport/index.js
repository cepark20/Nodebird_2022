
// passport 설정 파일

const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {

    // req.login 시 실행 user가 req.login(user)
   passport.serializeUser((user, done) => {
       // 쿠키와 매칭해줄 사용자 아이디만 저장
       // 세션에 모든 사용자 정보를 다 들고 있기 무겁기 때문에
       // 사용자 아이디만 저장
        done(null, user.id);
    });

    // 로그인 성공 후 다음 요청부터 매번 실행됨
    passport.deserializeUser(async (id, done) => {
        try {
            // 세션에 저장해놓은 아이디를 통해 유저 정보 복원
            const user = await User.findOne({ where: { id }});
            done(null, user);  // 정보를 복구해서 req.user에 데이터 담기
        } catch (error) {
            console.error(error);
            done(error);
        }
    });

    local();
}