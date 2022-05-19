
import PropTypes from 'prop-types';
import Link from "next/link";
import React from "react";

// 해시태그 보여주기
const PostCardContent = ({ postData }) => {
    return (
        <div>
            {postData.split(/(#[^\s#]+)/g).map((v, i) => {
                // 해시태그가 일치하는지
                if (v.match(/(#[^\s#]+)/g)) {
                    // slice(1)은 #제거
                    return <Link href={`/hashtag/${v.slice(1)}`} key={i}><a>{v}</a></Link>
                }
                return v;
            })}
        </div>
    )
};

PostCardContent.propTypes = {
    postData: PropTypes.string.isRequired
};

export default PostCardContent;
