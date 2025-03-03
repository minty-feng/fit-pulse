// src/components/LoadingSpin/index.tsx
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';

// 方案一：基础旋转动画
export const BasicSpinner = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #1677ff; // 使用Ant Design主色
  }
`;

// 方案二：高级动态渐变
const PulseContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;

  div {
    position: absolute;
    border: 4px solid #1677ff;
    opacity: 1;
    border-radius: 50%;
    animation: pulse 1.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  div:nth-child(2) {
    animation-delay: -0.7s;
  }

  @keyframes pulse {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
`;

// 全屏加载组件
const FullScreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

type SizeType = 'small' | 'medium' | 'large';
type ModeType = 'inline' | 'fullscreen';

interface LoadingProps {
  size?: SizeType;
  mode?: ModeType;
  tip?: string;
}

const sizeMap: Record<SizeType, number> = {
  small: 24,
  medium: 32,
  large: 40
};

export const LoadingSpin = ({
  size = 'medium',
  mode = 'inline',
  tip = '加载中...'
}: LoadingProps) => {
  const renderIcon = <LoadingOutlined spin style={{ fontSize: sizeMap[size] }} />;

  const content = (
    <Spin indicator={renderIcon} tip={tip}>
      {mode === 'fullscreen' && <div style={{ height: '100vh' }} />}
    </Spin>
  );

  return mode === 'fullscreen' ? (
    <FullScreenWrapper>{content}</FullScreenWrapper>
  ) : (
    content
  );
};

// 使用示例：
// <LoadingSpin size="large" mode="fullscreen" tip="数据加载中..." />