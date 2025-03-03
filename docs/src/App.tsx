// 2. 路由配置文件 src/App.tsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './views/HomePage.tsx'
import { LoadingSpin } from './componemts/LoadingSpin.tsx';
import { WeightPage } from './views/WeightPage.tsx';

function App() {
  return (
    <Suspense fallback={<LoadingSpin mode="fullscreen"/>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weight" element={<WeightPage/>} />
        <Route path="/blog" element={<HomePage />} />
        <Route path="/monitor" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;