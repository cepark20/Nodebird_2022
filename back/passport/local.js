
// 로컬 로그인 전략 설정 파일

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = () => {
    passport.use(new LocalStrategy({
        //req.body에 대한 설정
        usernameField: 'email',   //req.body.email
        passwordField: 'password' //req.body.password
    }, async (email, password, done) => {
        // 비동기 요청시 항상 서버에러가 발생할 수 있기 때문에 try-catch 사용해주기
        try {
            // 데이터베이스에 유저 이메일이 존재하는지 확인
            // user에 email, password, nickname 등 모든 정보가 다 들어있다
            const user = await User.findOne({
                where: { email }
            });
            // 이메일 비교
            if (!user) {
                // passport에서는 응답을 보내주지 않는다
                // done(서버 에러, 성공 여부, 클라이언트 에러)
                return done(null, false, { reason : '존재하지 않는 사용자입니다.' });
            }

            // 비밀번호 비교(사용자가 입력한 비밀번호와 데이터베이스에 저장된 비밀번호 비교)
            const isPasswordSame = await bcrypt.compare(password, user.password);
            if (isPasswordSame) {
                // 로그인 성공 시 user 정보를 담아서 넘겨준다
                return done(null, user);
            }

            // 비밀번호 불일치시
            return done(null, false, { reason: '비밀번호가 일치하지 않습니다' });
        } catch (error) {
            console.error(error);
            return done(error);
        }

    }));
}


