import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // можно оставить пустым, если нет стилей
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);