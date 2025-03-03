// pages/HomePage.tsx
import { Layout } from 'antd';

import { AppHeader } from '../componemts/AppHeader';
import { NotificationBanner } from '../componemts/NotificationBanner';
import { HealthCardGrid } from '../componemts/HealthCardGrid';
import { RecommendationSection } from '../componemts/RecommendationSection';
import { QuickActions } from '../componemts/QuickActions';

const { Content } = Layout;

const cards = [
  { title: '健康饮食指南', content: '科学搭配每日营养摄入', path: '/nutrition' },
  { title: '运动计划推荐', content: '定制你的专属健身方案', path: '/exercise' },
  { title: '体重管理技巧', content: '有效维持健康体重的10个方法', path: '/weight-tips' },
];

const recommendations = [
  { title: '睡眠质量提升', content: '改善睡眠的7个技巧' },
  { title: '心理健康指南', content: '压力管理的有效方法' },
  { title: '日常养生小贴士', content: '简单易行的健康习惯' },
];
export const HomePage = () => (
  <Layout 
    className="min-h-screen"
    style={{ 
      display: 'flex',
      flexDirection: 'column',
      width: '100%', 
      minHeight: '100vh',
      overflowX: 'hidden'  
    }}
  >
    <AppHeader />

    <Content 
      className="flex-1 p-6"
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '54px', 
        maxWidth: 1536,  
        margin: '0 auto', 
        boxSizing: 'border-box' 
      }}
    >
      <div 
        className="w-full" 
        style={{ 
          maxWidth: '100%',  
          padding: '0 5rem',
          boxSizing: 'border-box'
        }}
      >
        <NotificationBanner />
        <HealthCardGrid cards={cards} />
        <RecommendationSection items={recommendations} />
        <QuickActions />
      </div>
    </Content>
  </Layout>
);