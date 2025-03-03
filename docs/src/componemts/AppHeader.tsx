// components/AppHeader.tsx
import { Layout, Menu, Row, Col, Grid } from 'antd';
import { BulbOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { CommonLink } from './CommonLink';

const { Header } = Layout;
const { useBreakpoint } = Grid;

// 样式化组件
const StyledHeader = styled(Header)`
  background: white !important;
  width: 100% !important;
  padding: 0 16px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  z-index: 50;
  height: 48px;
`;

const CenteredRow = styled(Row)`
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  height: 100%;
`;

const BrandWrapper = styled(Col)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  @media (max-width: 768px) {
    position: static;
    transform: none;
    text-align: center;
  }
`;

const MenuWrapper = styled(Col)`
  display: flex !important;
  justify-content: flex-end;
  flex-grow: 1;
`;

const StyledMenu = styled(Menu)`
  &.ant-menu {
    border: 0;
    background: transparent;
    width: auto;
    line-height: 48px;
    
    &-horizontal {
      border-bottom: none !important;
      display: inline-flex;
      
      &::after {
        display: none !important;
      }
    }
    
    &-item {
      display: flex !important;
      align-items: center !important;
      height: 48px !important;
      padding: 0 16px !important;
      
      &:hover {
        background: rgba(0,0,0,0.03) !important;
      }
      
      a {
        color: #4a5568 !important;
        transition: color 0.2s;
        
        &:hover {
          color: #4299e1 !important;
        }
      }
    }
  }
`;

const BrandText = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4299e1;
  white-space: nowrap;
`;

export const AppHeader = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <StyledHeader>
      <CenteredRow justify="space-between" align="middle">
        {/* 左侧空白占位 */}
        <Col flex="auto" />
        
        {/* 居中品牌 */}
        <BrandWrapper>
          <BrandText>健康管理平台</BrandText>
        </BrandWrapper>
        
        {/* 右侧菜单 */}
        <MenuWrapper flex="auto">
          <StyledMenu
            mode={isMobile ? 'vertical' : 'horizontal'}
            theme="light"
            overflowedIndicator={null}
          >
            <Menu.Item key="weight">
              <CommonLink to="/weight">
                <DashboardOutlined style={{ marginRight: 8 }} />
                体重管理
              </CommonLink>
            </Menu.Item>
            <Menu.Item key="blog">
              <CommonLink to="/blog">
                <UserOutlined style={{ marginRight: 8 }} />
                健康知识
              </CommonLink>
            </Menu.Item>
            <Menu.Item key="monitor">
              <CommonLink to="/monitor">
                <BulbOutlined style={{ marginRight: 8 }} />
                平台监控
              </CommonLink>
            </Menu.Item>
          </StyledMenu>
        </MenuWrapper>
      </CenteredRow>
    </StyledHeader>
  );
};