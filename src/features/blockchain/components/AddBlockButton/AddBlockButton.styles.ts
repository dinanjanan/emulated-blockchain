import styled from 'styled-components';

export const AddBlockButtonContainer = styled.div`
  /* background: linear-gradient(75deg, #e00000, 70%, #f7c81b); */
  background: linear-gradient(75deg, #108ee9, 50%, #a758f4);
  padding: 18px 30px;
  border-radius: 50px;
  height: fit-content;
  width: fit-content;
  color: #ffffff;
  margin-top: 40px;

  &:hover {
    cursor: pointer;
  }

  span.plus--icon {
    margin-right: 7px;
    font-size: 20px;
  }
`;
