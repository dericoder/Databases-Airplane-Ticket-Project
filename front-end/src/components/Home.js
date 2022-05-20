import "../css/Home.css"
import React from 'react';
import Comp from './Comp'
import { withCookies } from "react-cookie";

class HomeClass extends Comp {

    render() {
        return (
        <></>
        );
    }
}

function Home() {
    const HomeCookies = withCookies(HomeClass);

    return <HomeCookies />;
}

export default Home;