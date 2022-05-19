


// 폼에 주로 사용되는 커스텀 훅 생성

import { useState, useCallback } from 'react';

export default (initialValue = null) => {

    const [value, setValue] = useState(initialValue);

    // onChange 역할 : 클릭시 value 변경
    const handler = useCallback((e) => {
        setValue(e.target.value);
    }, []);

    return [value, handler];
};

