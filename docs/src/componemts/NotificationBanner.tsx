// components/NotificationBanner.tsx
import { Alert } from 'antd';

export const NotificationBanner = () => (
  <Alert
    message="系统通知：本周五进行系统维护（00:00-02:00）"
    type="info"
    showIcon
    closable
    className="mb-6 rounded-lg bg-blue-50 border-blue-200"
  />
);