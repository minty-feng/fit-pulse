import { Form, Input, DatePicker, Button, Row, Col, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { WeightFormValues } from './types';

interface QueryFormProps {
  onSearch: (values: Partial<WeightFormValues>) => void;
  onReset: () => void;
}

export const WeightQueryForm = ({ onSearch, onReset }: QueryFormProps) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={(values) => {
        const processedValues = {
          ...values,
          date: values.date?.format('YYYY-MM-DD'),
        };
        onSearch(processedValues);
      }}
    >
      <Row gutter={24} style={{ width: '100%' }}>
        <Col span={6}>
          <Form.Item name="id" label="ID">
            <Input placeholder="输入记录ID" allowClear />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="date" label="日期">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="weight" label="体重">
            <Input type="number" step="0.1" suffix="kg" allowClear />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="submittedAt" label="提交时间">
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                onReset();
              }}
            >
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};