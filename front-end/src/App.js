import React from 'react';
import './App.css';
import Navbar from './Navbar';

class Content extends React.Component {
  render() {
    return (
      <div className="content">
        <h1>content</h1>
      </div>
    )
  }
}

function App() {
  return (
    <div id="root">
      <div className="wrapper">
        <Navbar />
        <Content />
      </div>
    </div>
  );
}

export default App;
