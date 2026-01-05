import { Modal, Form, Input, Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Setting } from '@/apis/setting';
import { parseJsonValue, JsonField } from '@/utils/jsonParser';

interface GeneralSettingModalProps {
  visible: boolean;
  editingSetting: Setting | null;
  valueIsJson: boolean;
  jsonFields: JsonField[];
  form: any;
  onClose: () => void;
  onSubmit: (values: any) => void;
  setValueIsJson: (value: boolean) => void;
  setJsonFields: (fields: JsonField[]) => void;
}

export const GeneralSettingModal = ({
  visible,
  editingSetting,
  valueIsJson,
  jsonFields,
  form,
  onClose,
  onSubmit,
  setValueIsJson,
  setJsonFields,
}: GeneralSettingModalProps) => {
  return (
    <Modal
      title={editingSetting ? '编辑配置' : '新增配置'}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
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
  );
};

