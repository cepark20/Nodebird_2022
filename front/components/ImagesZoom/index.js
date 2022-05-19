import PropTypes from 'prop-types';
import Slick from 'react-slick';
import {useState} from "react";
import {CloseBtn, Global, Header, ImgWrapper, Indicator, Overlay, SlickWrapper} from "./styles";

const ImagesZoom = ({ images, onClose }) => {

    // 현재 슬라이드
    // beforeChange={(slide, newSlide) => setCurrentSlide(newSlide)}
    const [currentSlide, setCurrentSlide] = useState(0);
    return (
        <Overlay>
            <Global />
            <Header>
                <h1>상세 이미지</h1>
                <CloseBtn onClick={onClose} />
            </Header>
            <SlickWrapper>
                <Slick
                    initialSlide={0}
                    afterChange={(slide) => setCurrentSlide(slide)}
                    infinite
                    arrows={false}
                    slidesToShow={1}
                    slidesToScroll={1}
                >
                    {images.map((v) => (
                        <ImgWrapper key={v.src}>
                            <img src={`http://localhost:3065/${v.src}`} alt={v.src} />
                        </ImgWrapper>
                    ))}
                </Slick>
                <Indicator>
                    <div>
                        {currentSlide + 1}
                        {' '}
                        /
                        {' '}
                        {images.length}
                    </div>
                </Indicator>
            </SlickWrapper>
        </Overlay>
    );
};

ImagesZoom.propTypes = {
    images: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired
};

export default ImagesZoom;