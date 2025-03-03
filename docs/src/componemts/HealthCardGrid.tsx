// components/HealthCardGrid.tsx
import { Card, Row, Col } from 'antd';
import { CommonLink } from './CommonLink';

interface CardItem {
  title: string;
  content: string;
  path: string;
}


export const HealthCardGrid = ({ cards }: { cards: CardItem[] }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">健康资料库</h2>
    <Row gutter={[24, 24]}>
      {cards.map((card) => (
        <Col key={card.title} xs={24} md={12} lg={8}>
          <Card
            className="shadow-lg rounded-xl hover:shadow-xl transition-shadow"
            actions={[
              <CommonLink 
                to={card.path}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                查看详情 →
              </CommonLink>
            ]}
          >
            <Card.Meta
              title={<span className="text-lg font-medium">{card.title}</span>}
              description={<span className="text-gray-600">{card.content}</span>}
            />
          </Card>
        </Col>
      ))}
    </Row>
  </section>
);