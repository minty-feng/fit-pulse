import { useState } from 'react';
import { Card, Tabs, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { WeightComparison } from '../componemts/weight/WeightComparison';
import { WeightQueryForm } from '../componemts/weight/WeightQueryForm';
import { WeightRecordTable } from '../componemts/weight/WeightRecordTable';
import { WeightFormModal } from '../componemts/weight/WeightFormModal';
import { instance, WeightService  as service } from '../features/ service/service-header';


import { UserData, WeightRecord, WeightFormValues } from '../componemts/weight/types';

const mockUsers: UserData[] = [
    {
      userId: 'user1',
      username: '当前用户',
      records: []
    },
    {
      userId: 'user2',
      username: '用户A',
      records: [
        { id: '1', userId: 'user2', seq: 1, date: '2024-03-01', weight: 65, 
         submittedAt: '2024-03-01', updatedAt: '2024-03-01' },
        { id: '2', userId: 'user2', seq: 2, date: '2024-03-05', weight: 64, 
         submittedAt: '2024-03-05', updatedAt: '2024-03-05' }
      ]
    },
    {
      userId: 'user3',
      username: '用户B',
      records: [
        { id: '3', userId: 'user3', seq: 1, date: '2024-03-02', weight: 70, 
         submittedAt: '2024-03-02', updatedAt: '2024-03-02' },
        { id: '4', userId: 'user3', seq: 2, date: '2024-03-06', weight: 69, 
         submittedAt: '2024-03-06', updatedAt: '2024-03-06' }
      ]
    }
  ];
  

export const WeightPage = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [currentUser] = useState<UserData>(mockUsers[0]);
  const [allUsers] = useState<UserData[]>(mockUsers);
  const [records, setRecords] = useState<WeightRecord[]>(currentUser.records);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [queryParams, setQueryParams] = useState<Partial<WeightRecord>>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
  });
  const ret0 = instance.get('/weight/records') // 实际请求 → /api/weight/records
  console.log(ret0)
  const ret = service.getRecords({page: 1, size: 1})
  console.log(ret)
  console.log(ret.list)

  const [compareUsers, setCompareUsers] = useState<string[]>(['user1', 'user2']);

  // 生成序列号
  const generateSeq = () => 
    records.length > 0 ? Math.max(...records.map(r => r.seq)) + 1 : 1;

  // 过滤数据
  const filteredRecords = records.filter(record => 
    Object.entries(queryParams).every(([key, value]) => {
      if (!value) return true;
      if (key === 'date') return dayjs(record.date).isSame(value, 'day');
      return String(record[key as keyof WeightRecord]).includes(String(value));
    })
  );

  // 获取对比数据
  const getCompareData = () => {
    const [user1, user2] = compareUsers;
    const user1Records = allUsers.find(u => u.userId === user1)?.records || [];
    const user2Records = allUsers.find(u => u.userId === user2)?.records || [];
    
    const allDates = Array.from(new Set([
      ...user1Records.map(r => r.date),
      ...user2Records.map(r => r.date)
    ])).sort();

    return allDates.map(date => ({
      date: dayjs(date).format('YYYY-MM-DD'),
      user1: user1Records.find(r => r.date === date)?.weight.toFixed(1) || '-',
      user2: user2Records.find(r => r.date === date)?.weight.toFixed(1) || '-'
    }));
  };

  // 提交处理
  const handleSubmit = (values: WeightFormValues) => {
    const payload = {
      ...values,
      date: values.date.toISOString(),
      weight: Number(values.weight),
    };

    if (editingRecord) {
      const updatedRecord = {
        ...editingRecord,
        ...payload,
        updatedAt: new Date().toISOString()
      };
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
      message.success('记录更新成功');
    } else {
      const newRecord = {
        ...payload,
        id: Date.now().toString(),
        seq: generateSeq(),
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRecords(prev => [...prev, newRecord]);
      message.success('记录添加成功');
    }
    setModalVisible(false);
  };

  return (
    <div style={{ maxWidth: 1920, margin: '24px auto', padding: '0 48px' }}>
      <Card title="体重管理系统">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="体重记录" key="1">
            <WeightQueryForm
              onSearch={setQueryParams}
              onReset={() => setQueryParams({})}
            />
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ margin: '16px 0' }}
            >
              新增记录
            </Button>

            <WeightRecordTable
              data={filteredRecords}
              pagination={pagination}
              onDelete={(id) => {
                setRecords(prev => prev.filter(r => r.id !== id));
                message.success('删除成功');
              }}
              onEdit={(record) => {
                setEditingRecord(record);
                setModalVisible(true);
              }}
              onPageChange={(page, pageSize) => 
                setPagination(prev => ({ ...prev, current: page, pageSize }))
              }
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="体重对比" key="2">
            <WeightComparison
              users={allUsers}
              compareUsers={compareUsers}
              comparisonData={getCompareData()}
              onCompareChange={setCompareUsers}
            />
          </Tabs.TabPane>
        </Tabs>

        <WeightFormModal
          visible={modalVisible}
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
          }}
        />
      </Card>
    </div>
  );
};