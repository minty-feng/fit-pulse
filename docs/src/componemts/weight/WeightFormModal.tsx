import { Modal, Form, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';
import { WeightFormValues, WeightRecord } from './types';

interface FormModalProps {
  visible: boolean;
  editingRecord?: WeightRecord | null;
  onSubmit: (values: WeightFormValues) => void;
  onCancel: () => void;
}

export const WeightFormModal = ({
  visible,
  editingRecord,
  onSubmit,
  onCancel,
}: FormModalProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={editingRecord ? '编辑记录' : '新增记录'}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: editingRecord ? dayjs(editingRecord.date) : dayjs(),
          weight: editingRecord?.weight,
        }}
        onFinish={onSubmit}
      >
        <Form.Item
          name="date"
          label="记录日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="weight"
          label="体重 (kg)"
          rules={[
            { required: true, message: '请输入体重值' },
            {
              validator(_, value) {
                const num = Number(value);
                if (isNaN(num)) return Promise.reject('请输入有效数字');
                if (num < 20) return Promise.reject('体重不能小于20kg');
                if (num > 300) return Promise.reject('体重不能超过300kg');
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            step="0.1"
            suffix="kg"
            placeholder="请输入体重值"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};