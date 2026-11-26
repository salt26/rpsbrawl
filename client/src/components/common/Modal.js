import React, { Component } from "react";
import styled from "styled-components";
import { Transition } from "react-transition-group";
import { TweenLite } from "gsap/TweenMax";

const duration = 200;

class Modal extends Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      TweenLite.to(this.myElement, 0.35, { y: 0, scale: 1 });
    }

    if (prevProps.isOpen && !this.props.isOpen) {
      TweenLite.to(this.myElement, 0.35, { y: -30, scale: 0.7 });
    }
  }

  closeModal = () => {
    this.props.closeModal();
  };

  render() {
    const { isOpen } = this.props;

    return (
      <Transition
        in={isOpen}
        timeout={{ enter: 0, exit: duration }}
        appear
        unmountOnExit
      >
        {(tstate) => (
          <Overlay tstate={tstate}>
            <ModalWrapper ref={(div) => (this.myElement = div)}>
              {this.props.children}
            </ModalWrapper>
          </Overlay>
        )}
      </Transition>
    );
  }
}

export default Modal;

const Overlay = styled.div`
  // 스크롤이나 주소창 높이 변화와 관계없이 보이는 화면 전체를 덮는다
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${(props) => (props.tstate === "entered" ? 1 : 0)};
  transition: opacity ${duration}ms ease-in-out;
  z-index: 2;
`;

const ModalWrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: 85vw;
  height: 85vh;
  background: linear-gradient(160deg, #f1eeff 0%, #e6f1fc 55%, #def5f2 100%);

  transform: scale(0.8);
  z-index: 3;
  display: flex;

  justify-content: center;
  align-items: center;
  border-radius: 20px;

  @media (max-width: 767px) {
    //모바일
    width: 90vw;
    height: 80vh;
    height: 80dvh;
  }

  @media (min-width: 1200px) {
    // 데스크탑 일반

    width: 70vw;
  }
`;
