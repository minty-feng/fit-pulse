import { Table, Space, Button } from 'antd';
import { WeightRecord } from './types';
import { format, parseISO } from 'date-fns';
import dayjs from 'dayjs';

interface RecordTableProps {
  data: WeightRecord[];
  pagination: any;
  onDelete: (id: string) => void;
  onEdit: (record: WeightRecord) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export const WeightRecordTable = ({
  data,
  pagination,
  onDelete,
  onEdit,
  onPageChange,
}: RecordTableProps) => {
  const columns = [
    {
      title: '序号',
      dataIndex: 'seq',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '日期',
      dataIndex: 'date',
      render: (date: string) => format(parseISO(date), 'yyyy-MM-dd'),
      sorter: (a: WeightRecord, b: WeightRecord) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '体重 (kg)',
      dataIndex: 'weight',
      render: (value: number) => value.toFixed(1),
      sorter: (a: WeightRecord, b: WeightRecord) => a.weight - b.weight,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      render: (date: string) => format(parseISO(date), 'yyyy-MM-dd HH:mm'),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 150,
      render: (_: any, record: WeightRecord) => (
        <Space>
          <Button onClick={() => onEdit(record)}>编辑</Button>
          <Button danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      scroll={{ x: 1600 }}
      pagination={{
        ...pagination,
        onChange: onPageChange,
      }}
      bordered
    />
  );
};