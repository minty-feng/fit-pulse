import { Select, Table, Space } from 'antd';
import { UserData, ComparisonItem } from './types';

interface ComparisonProps {
  users: UserData[];
  compareUsers: string[];
  comparisonData: ComparisonItem[];
  onCompareChange: (users: string[]) => void;
}

export const WeightComparison = ({
  users,
  compareUsers,
  comparisonData,
  onCompareChange,
}: ComparisonProps) => {
  return (
    <>
      <Space style={{ marginBottom: 24 }}>
        <Select
          value={compareUsers[0]}
          onChange={(value) => onCompareChange([value, compareUsers[1]])}
          options={users.map((u) => ({
            value: u.userId,
            label: u.username,
          }))}
          style={{ width: 200 }}
        />
        <span style={{ fontSize: 18 }}>VS</span>
        <Select
          value={compareUsers[1]}
          onChange={(value) => onCompareChange([compareUsers[0], value])}
          options={users
            .filter((u) => u.userId !== compareUsers[0])
            .map((u) => ({
              value: u.userId,
              label: u.username,
            }))}
          style={{ width: 200 }}
        />
      </Space>

      <Table
        columns={[
          {
            title: '对比日期',
            dataIndex: 'date',
            sorter: (a: ComparisonItem, b: ComparisonItem) =>
              dayjs(a.date).unix() - dayjs(b.date).unix(),
          },
          {
            title: users.find((u) => u.userId === compareUsers[0])?.username,
            dataIndex: 'user1',
            align: 'center' as const,
          },
          {
            title: users.find((u) => u.userId === compareUsers[1])?.username,
            dataIndex: 'user2',
            align: 'center' as const,
          },
        ]}
        dataSource={comparisonData}
        rowKey="date"
        pagination={false}
        bordered
      />
    </>
  );
};