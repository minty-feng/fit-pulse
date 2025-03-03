// components/RecommendationSection.tsx
import { Row, Col } from 'antd';
import { CommonLink } from './CommonLink';

interface Recommendation {
  title: string;
  content: string;
}

export const RecommendationSection = ({ items }: { items: Recommendation[] }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">推荐阅读</h2>
    <Row gutter={[24, 24]}>
      {items.map((item) => (
        <Col key={item.title} xs={24} md={8}>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
            <p className="text-gray-600 mt-2 mb-4">{item.content}</p>
            <CommonLink 
              to="#" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              立即阅读
            </CommonLink>
          </div>
        </Col>
      ))}
    </Row>
  </section>
);