import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Import router provider
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;