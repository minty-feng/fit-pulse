import { Row, Col } from 'antd';
import styled from 'styled-components';
import { CommonLink } from './CommonLink';

const StyledQuickActions = styled.div`
  background-color: #f9fafb;
  padding: 2rem 0;
  border-radius: 12px;
  margin-top: 2rem;
`;

const StyledRow = styled(Row)`
  max-width: 56rem;
  margin: 0 auto;
`;

const StyledCommonLink = styled(CommonLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 500;
  color: #374151;
  
  &:hover {
    color: #2563eb;
  }
`;

export const QuickActions = () => (
  <StyledQuickActions>
    <StyledRow justify="space-around">
      <Col>
        <StyledCommonLink to="/report">
          <span>📊</span>
          <span>生成健康报告</span>
        </StyledCommonLink>
      </Col>
      <Col>
        <StyledCommonLink to="/reminder">
          <span>⏰</span>
          <span>设置提醒</span>
        </StyledCommonLink>
      </Col>
    </StyledRow>
  </StyledQuickActions>
);