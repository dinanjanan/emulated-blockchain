import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    scrollbar-color: #d2eafb;
    scrollbar-track-color: red;
    scrollbar-width: 5px;
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    background: #f9f9fb;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.65);
    border-radius: 10px;
  }

  body {
    background-color: #f9f9fb;
    color: rgba(0, 0, 0, 0.65);
    font-family: 'IBM Plex Sans', sans-serif;
    padding: 20px 60px 50px;
    /* overflow: hidden; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  input {
    border: none;
    outline: none;
  }

  li {
    list-style: none;
  }

  a {
    text-decoration: none;
  }

`;
