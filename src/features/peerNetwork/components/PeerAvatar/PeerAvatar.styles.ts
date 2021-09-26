import styled from 'styled-components';

type PeerAvatarContainerProps = {
  isSelected: boolean;
  color: string;
};

type PeerOptionProps = {
  hoverColor: string;
  show: boolean;
};

export const PeerAvatarContainer = styled.div<PeerAvatarContainerProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${props => (props.isSelected ? props.color : null)};
  font-weight: ${props => (props.isSelected ? '500' : '400')};
  cursor: pointer;
  padding: 10px 15px;

  & + * {
    margin-left: 52px;
  }

  .circle-avatar__container {
    position: relative;
  }

  .circle-avatar__cross {
    position: absolute;
    right: -30px;
    bottom: 10px;
    font-size: 25px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
  }
`;

export const PeerOptions = styled.div`
  margin-top: 10px;
  display: flex;
`;

export const PeerOption = styled.div<PeerOptionProps>`
  border-radius: 50%;
  height: 21px;
  width: 21px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: rgba(0, 0, 0, 0.07) 0 0 10px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.show ? '1.0' : '0.0')};
  transition: all 300ms ease-out;

  &:hover {
    color: ${props => props.hoverColor};
    border-color: ${props => props.hoverColor};
  }

  & + & {
    margin-left: 10px;
  }
`;
