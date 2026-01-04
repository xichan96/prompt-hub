import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, message, Flex, Popconfirm, Form, Input, Modal, TableColumnsType, Tabs, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createSetting, deleteSetting, getSettings, updateSetting, Setting, CreateSettingRequest, UpdateSettingRequest, DeleteSettingRequest, getLLMSetting, updateLLMSetting, LLMSetting, UpdateLLMSettingRequest } from '@/apis/setting';
import Page from '@/components/Page';
import dayjs from 'dayjs';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmSetting, setLlmSetting] = useState<LLMSetting | null>(null);
  const [llmModalVisible, setLlmModalVisible] = useState(false);
  const [llmForm] = Form.useForm();
  const [valueIsJson, setValueIsJson] = useState(false);
  const [jsonFields, setJsonFields] = useState<Array<{ key: string; value: any; isJson?: boolean; nestedFields?: Array<{ key: string; value: any }> }>>([]);

  const getList = async () => {
    try {
      setLoading(true);
      const params = filterGroup ? { group: filterGroup } : undefined;
      const res = await getSettings(params);
      setSettings(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
    getLLMConfig();
  }, [filterGroup]);

  const parseJsonValue = (value: string): { isJson: boolean; data: any; fields: Array<{ key: string; value: any; isJson?: boolean; nestedFields?: Array<{ key: string; value: any }> }> } => {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const fields = Object.entries(parsed).map(([key, val]) => {
          const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
          const nestedJson = typeof val === 'object' && val !== null && !Array.isArray(val) 
            ? parseJsonValue(valStr) 
            : null;
          
          if (nestedJson && nestedJson.isJson) {
            return {
              key,
              value: valStr,
              isJson: true,
              nestedFields: nestedJson.fields,
            };
          }
          return {
            key,
            value: valStr,
            isJson: false,
          };
        });
        return { isJson: true, data: parsed, fields };
      }
    } catch {
      // Not valid JSON
    }
    return { isJson: false, data: null, fields: [] };
  };

  const handleEdit = (record: Setting) => {
    setEditingSetting(record);
    const jsonResult = parseJsonValue(record.value);
    setValueIsJson(jsonResult.isJson);
    if (jsonResult.isJson) {
      setJsonFields(jsonResult.fields);
      form.setFieldsValue({
        group: record.group,
        key: record.key,
        jsonFields: jsonResult.fields,
      });
    } else {
      setJsonFields([]);
      form.setFieldsValue({ ...record });
    }
    setModalVisible(true);
  };

  const handleDelete = async (record: Setting) => {
    try {
      await deleteSetting({ group: record.group, key: record.key });
      message.success('删除成功');
      getList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let submitValue: string;
      if (valueIsJson && values.jsonFields) {
        const jsonObj: Record<string, any> = {};
        values.jsonFields.forEach((field: { key: string; value: string; nestedFields?: Array<{ key: string; value: string }> }) => {
          if (field.nestedFields && field.nestedFields.length > 0) {
            const nestedObj: Record<string, any> = {};
            field.nestedFields.forEach((nested: { key: string; value: string }) => {
              try {
                nestedObj[nested.key] = JSON.parse(nested.value);
              } catch {
                nestedObj[nested.key] = nested.value;
              }
            });
            jsonObj[field.key] = nestedObj;
          } else {
            try {
              jsonObj[field.key] = JSON.parse(field.value);
            } catch {
              jsonObj[field.key] = field.value;
            }
          }
        });
        submitValue = JSON.stringify(jsonObj);
      } else {
        submitValue = values.value;
      }

      const submitData = {
        group: values.group,
        key: values.key,
        value: submitValue,
      };

      if (editingSetting) {
        await updateSetting(submitData as UpdateSettingRequest);
        message.success('更新成功');
      } else {
        await createSetting(submitData as CreateSettingRequest);
        message.success('创建成功');
      }
      getList();
      setModalVisible(false);
      form.resetFields();
      setEditingSetting(null);
      setValueIsJson(false);
      setJsonFields([]);
    } catch (error) {
      message.error(editingSetting ? '更新失败' : '创建失败');
    }
  };

  const columns: TableColumnsType<Setting> = [
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
      align: 'center',
    },
    {
      title: '键',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getLLMConfig = async () => {
    try {
      setLlmLoading(true);
      const res = await getLLMSetting();
      setLlmSetting(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleLLMSubmit = async (values: UpdateLLMSettingRequest) => {
    try {
      await updateLLMSetting(values);
      message.success('更新成功');
      setLlmModalVisible(false);
      getLLMConfig();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const groups = Array.from(new Set(settings.map(s => s.group)));

  return (
    <Page title="系统设置" description="管理系统配置项">
      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: '通用配置',
            children: (
              <Card className="content-card">
                <Flex
                  align="center"
                  justify="space-between"
                  gap={20}
                  style={{ marginBottom: 16 }}
                >
                  <Space>
                    <Input
                      placeholder="筛选分组"
                      value={filterGroup}
                      onChange={(e) => setFilterGroup(e.target.value)}
                      style={{ width: 200 }}
                      allowClear
                    />
                  </Space>
                  <Space>
                    <div>共 {settings.length} 个配置</div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        form.resetFields();
                        setEditingSetting(null);
                        setValueIsJson(false);
                        setJsonFields([]);
                        setModalVisible(true);
                      }}
                    >
                      新增配置
                    </Button>
                  </Space>
                </Flex>

                <Table
                  columns={columns}
                  dataSource={settings}
                  loading={loading}
                  rowKey={(record) => `${record.group}-${record.key}`}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'llm',
            label: 'LLM配置',
            children: (
              <Card className="content-card">
                <Flex
                  align="center"
                  justify="space-between"
                  gap={20}
                  style={{ marginBottom: 16 }}
                >
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      if (llmSetting) {
                        llmForm.setFieldsValue(llmSetting);
                      }
                      setLlmModalVisible(true);
                    }}
                  >
                    编辑LLM配置
                  </Button>
                </Flex>
                {llmSetting && (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <p><strong>当前提供商:</strong> {llmSetting.provider}</p>
                    {llmSetting.provider === 'openai' && (
                      <div>
                        <p><strong>Base URL:</strong> {llmSetting.openai.base_url}</p>
                        <p><strong>Model:</strong> {llmSetting.openai.model}</p>
                        <p><strong>API Type:</strong> {llmSetting.openai.api_type}</p>
                      </div>
                    )}
                    {llmSetting.provider === 'deepseek' && (
                      <div>
                        <p><strong>Base URL:</strong> {llmSetting.deepseek.base_url}</p>
                        <p><strong>Model:</strong> {llmSetting.deepseek.model}</p>
                      </div>
                    )}
                    {llmSetting.provider === 'volce' && (
                      <div>
                        <p><strong>Base URL:</strong> {llmSetting.volce.base_url || '未设置'}</p>
                        <p><strong>Model:</strong> {llmSetting.volce.model || '未设置'}</p>
                      </div>
                    )}
                  </Card>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingSetting ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSetting(null);
          setValueIsJson(false);
          setJsonFields([]);
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="group"
            label="分组"
            rules={[{ required: true, message: '请输入分组' }]}
          >
            <Input placeholder="请输入分组" />
          </Form.Item>
          <Form.Item
            name="key"
            label="键"
            rules={[{ required: true, message: '请输入键' }]}
          >
            <Input placeholder="请输入键" disabled={!!editingSetting} />
          </Form.Item>
          {valueIsJson ? (
            <Form.Item label="值（JSON格式）">
              <Form.List name="jsonFields">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const fieldData = form.getFieldValue(['jsonFields', name]);
                      const hasNestedFields = fieldData?.nestedFields && fieldData.nestedFields.length > 0;
                      
                      return (
                        <div key={key} style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                          <Space style={{ display: 'flex', marginBottom: hasNestedFields ? 8 : 0 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              rules={[{ required: true, message: '请输入键名' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="键名" style={{ width: 150 }} />
                            </Form.Item>
                            {!hasNestedFields ? (
                              <>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  rules={[{ required: true, message: '请输入值' }]}
                                  style={{ marginBottom: 0, flex: 1 }}
                                >
                                  <Input placeholder="值" style={{ width: 400 }} />
                                </Form.Item>
                                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                  const prevVal = prevValues?.jsonFields?.[name]?.value;
                                  const currVal = currentValues?.jsonFields?.[name]?.value;
                                  return prevVal !== currVal;
                                }}>
                                  {() => {
                                    const currentValue = form.getFieldValue(['jsonFields', name, 'value']);
                                    const canExpand = currentValue && (() => {
                                      try {
                                        const parsed = JSON.parse(currentValue);
                                        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
                                      } catch {
                                        return false;
                                      }
                                    })();
                                    
                                    return canExpand ? (
                                      <Button
                                        type="link"
                                        onClick={() => {
                                          const jsonResult = parseJsonValue(currentValue);
                                          if (jsonResult.isJson) {
                                            form.setFieldValue(['jsonFields', name, 'nestedFields'], jsonResult.fields);
                                            form.setFieldValue(['jsonFields', name, 'value'], undefined);
                                          }
                                        }}
                                      >
                                        展开JSON
                                      </Button>
                                    ) : null;
                                  }}
                                </Form.Item>
                              </>
                            ) : (
                              <div style={{ flex: 1 }}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'nestedFields']}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Form.List name={[name, 'nestedFields']}>
                                    {(nestedFields, { add: addNested, remove: removeNested }) => (
                                      <div style={{ paddingLeft: 20, borderLeft: '2px solid #1890ff' }}>
                                        {nestedFields.map(({ key: nestedKey, name: nestedName, ...nestedRestField }) => (
                                          <Space key={nestedKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                              {...nestedRestField}
                                              name={[nestedName, 'key']}
                                              rules={[{ required: true, message: '请输入键名' }]}
                                              style={{ marginBottom: 0 }}
                                            >
                                              <Input placeholder="键名" style={{ width: 120 }} />
                                            </Form.Item>
                                            <Form.Item
                                              {...nestedRestField}
                                              name={[nestedName, 'value']}
                                              rules={[{ required: true, message: '请输入值' }]}
                                              style={{ marginBottom: 0, flex: 1 }}
                                            >
                                              <Input placeholder="值" style={{ width: 300 }} />
                                            </Form.Item>
                                            <Button type="link" onClick={() => removeNested(nestedName)} danger size="small">
                                              删除
                                            </Button>
                                          </Space>
                                        ))}
                                        <Button type="dashed" onClick={() => addNested()} size="small" icon={<PlusOutlined />}>
                                          添加字段
                                        </Button>
                                      </div>
                                    )}
                                  </Form.List>
                                </Form.Item>
                              </div>
                            )}
                            <Button type="link" onClick={() => remove(name)} danger>
                              删除
                            </Button>
                          </Space>
                        </div>
                      );
                    })}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加字段
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          ) : (
            <Form.Item
              name="value"
              label="值"
              rules={[{ required: true, message: '请输入值' }]}
            >
              <Input.TextArea placeholder="请输入值（支持JSON格式）" rows={4} />
            </Form.Item>
          )}
          {editingSetting && !valueIsJson && (
            <Form.Item>
              <Button
                type="link"
                onClick={() => {
                  const jsonResult = parseJsonValue(editingSetting.value);
                  if (jsonResult.isJson) {
                    setValueIsJson(true);
                    setJsonFields(jsonResult.fields);
                    form.setFieldsValue({
                      jsonFields: jsonResult.fields,
                    });
                  } else {
                    message.warning('当前值不是有效的JSON格式');
                  }
                }}
              >
                解析为JSON表单
              </Button>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="编辑LLM配置"
        open={llmModalVisible}
        onCancel={() => {
          setLlmModalVisible(false);
          llmForm.resetFields();
        }}
        onOk={() => llmForm.submit()}
        width={800}
      >
        <Form
          form={llmForm}
          layout="vertical"
          onFinish={handleLLMSubmit}
        >
          <Form.Item
            name="provider"
            label="提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select placeholder="请选择提供商">
              <Select.Option value="openai">OpenAI</Select.Option>
              <Select.Option value="deepseek">DeepSeek</Select.Option>
              <Select.Option value="volce">Volce</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.provider !== currentValues.provider}>
            {({ getFieldValue }) => {
              const provider = getFieldValue('provider');
              return (
                <>
                  {provider === 'openai' && (
                    <>
                      <Form.Item
                        name={['openai', 'api_key']}
                        label="API Key"
                        rules={[{ required: true, message: '请输入API Key' }]}
                      >
                        <Input.Password placeholder="请输入API Key" />
                      </Form.Item>
                      <Form.Item
                        name={['openai', 'base_url']}
                        label="Base URL"
                        rules={[{ required: true, message: '请输入Base URL' }]}
                      >
                        <Input placeholder="请输入Base URL" />
                      </Form.Item>
                      <Form.Item
                        name={['openai', 'model']}
                        label="Model"
                        rules={[{ required: true, message: '请输入Model' }]}
                      >
                        <Input placeholder="请输入Model" />
                      </Form.Item>
                      <Form.Item
                        name={['openai', 'org_id']}
                        label="Org ID"
                      >
                        <Input placeholder="请输入Org ID" />
                      </Form.Item>
                      <Form.Item
                        name={['openai', 'api_type']}
                        label="API Type"
                        rules={[{ required: true, message: '请输入API Type' }]}
                      >
                        <Input placeholder="请输入API Type" />
                      </Form.Item>
                    </>
                  )}

                  {provider === 'deepseek' && (
                    <>
                      <Form.Item
                        name={['deepseek', 'api_key']}
                        label="API Key"
                        rules={[{ required: true, message: '请输入API Key' }]}
                      >
                        <Input.Password placeholder="请输入API Key" />
                      </Form.Item>
                      <Form.Item
                        name={['deepseek', 'base_url']}
                        label="Base URL"
                        rules={[{ required: true, message: '请输入Base URL' }]}
                      >
                        <Input placeholder="请输入Base URL" />
                      </Form.Item>
                      <Form.Item
                        name={['deepseek', 'model']}
                        label="Model"
                        rules={[{ required: true, message: '请输入Model' }]}
                      >
                        <Input placeholder="请输入Model" />
                      </Form.Item>
                    </>
                  )}

                  {provider === 'volce' && (
                    <>
                      <Form.Item
                        name={['volce', 'api_key']}
                        label="API Key"
                        rules={[{ required: true, message: '请输入API Key' }]}
                      >
                        <Input.Password placeholder="请输入API Key" />
                      </Form.Item>
                      <Form.Item
                        name={['volce', 'base_url']}
                        label="Base URL"
                      >
                        <Input placeholder="请输入Base URL" />
                      </Form.Item>
                      <Form.Item
                        name={['volce', 'model']}
                        label="Model"
                      >
                        <Input placeholder="请输入Model" />
                      </Form.Item>
                    </>
                  )}
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

