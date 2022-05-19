



// 익스프레스로 라우팅하기
// node 대신 express로 서버 실행하기!
// get(정보 조회), post(정보 생성), put(전체 수정), delete, patch(부분 수정), options(찔러보기), head(헤더만 가져오기)
// 여러 종류의 요청이 들어오기 때문에 여러 종류의 라우터 만들어놓기

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');

// 분리한 라우터 불러오기
const postRouter = require('./routes/post'); // 게시글, 댓글 1개 다루는 라우터
const postsRouter = require('./routes/posts'); // 다수의 게시글 다루는 라우터
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');

const db = require('./models');
const passportConfig = require('./passport');
const path = require('path');

dotenv.config();
const app = express();
// 익스프레스에 시퀄라이즈 연결하기
db.sequelize.sync()
    .then(() => {
        console.log('db 연결 성공');
    })
    .catch(console.error);
passportConfig();

app.use(morgan('dev'));


// CORS 설정 : 모든 요청에 헤더를 붙여서 보낸다
app.use(cors({
    origin: true,
    credentials: true,   // 다른 도메인 간 쿠키 전달을 위해 필요
}));

// 프론트에서 uploads 폴더에 업로드한 이미지의 미리보기 기능을 구현하기 위해서
// 서버에서 프론트 측으로 uploads 폴더에 접근할 수 있도록 설정해줘야 한다
// express.static 미들웨어
// '/': localhost:3065/ 라는 뜻
app.use('/', express.static(path.join(__dirname, 'uploads')));

// 서버 측으로 들어온 데이터를 받기 위해 req.body를 쓰려면 아래 설정 필수
// 프론트에서 넘겨준 data를 req.body에 넣어주는 역할
// 프론트에서 서버를 보낼 때 데이터 형식은 json, urlencoded
app.use(express.json());  // axios로 데이터 보낼 때
app.use(express.urlencoded({ extended: true })); // 일반 form으로 보낼 때
// 이미지 등 multipart로 데이터를 보낼 때 설정

// 로그인 정보 저장을 위해 필요한 미들웨어 설정
app.use(cookieParser());
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());

// app.get(URL, 메소드)
app.get('/', (req, res) => {
    res.send('hello express'); // 문자열 응답
});

// 라우터라고 한다
/*
app.get('/posts', (req, res) => { // json으로 응답
    res.json([
        { id: 1, content: 'hi1'},
        { id: 2, content: 'hi2'},
        { id: 3, content: 'hi3'}
    ]);
});

 */

// 라우터 연결
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

// 에러 처리 미들웨어 위치
// 기본적으로 여기 존재
// 바꿔줄 수도 있음 

app.listen(3065, () => {
    console.log('서버 실행 중');
});

/*

// 노드에서 제공하는 http 모듈을 통해 서버 실행
// const http = require('http');


// 백엔드 서버 생성
// 서버는 반드시 요청을 받으면 응답을 보내야 한다
// 응답을 안보내면 특정 시간 후에 브라우저가 자동으로 응답 실패로 처리한다
const server = http.createServer((req, res) => {
    // req : 요청. 브라우저 또는 프론트 서버에서 온 요청에 관한 정보를 담고 있다
    // res: 응답
    console.log(req.url, req.method);
    res.write('Hello Node 1'); // res.write로 줄 구분
    res.write('Hello Node 2');
    // res.end는 제일 마지막
    // res.end를 두 번 사용하면 안된다
    res.end('Hello Nodebird Node');
});

server.listen(3065, () => {
    console.log('백엔드 서버 실행 중');
});   // 포트는 3065로

 */



// 노드버드에서는 프론트 서버, 백엔드 서버 두 개로 나눠서
// 프론트 요청이 많이 오면 프론트를 늘리고,
// 백 요청이 많이 오면 백을 늘려서
// 자원을 아낄 수 있도록
// 백엔드는 api 서버로 ssr은 프론트 담당,
// 백엔드는 데이터만 다루는!