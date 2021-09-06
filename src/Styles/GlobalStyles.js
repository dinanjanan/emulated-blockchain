import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        background-color: #f9f9fb;
        color: rgba(0, 0, 0, 0.65);
        font-family: 'IBM Plex Sans', sans-serif;
        padding: 20px 30px 50px;
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
