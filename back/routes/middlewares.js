




// 로그인했는 지 검사하는 미들웨어 만들기







exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();  // 다음 미들웨어로 넘어간다
    } else {
        res.status(401).send('로그인이 필요합니다');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();  // 다음 미들웨어로 넘어간다
    } else {
        res.status(401).send('로그인하지 않은 사용자만 접근 가능합니다.');
    }
};