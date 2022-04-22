import React from 'react';
import './App.css';
import Navbar from './Navbar';

class Content extends React.Component {
  render() {
    return (
      <div class="content">
        <h1>test</h1>
      </div>
    )
  }
}

function App() {
  return (
    <div id="root">
      <div class="wrapper">
        <Navbar />
        <Content />
      </div>
    </div>
  );
}

export default App;
