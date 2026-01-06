import React from 'react';
import { Modal, Input } from 'antd';

interface PublishModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
  description,
  onDescriptionChange,
}) => {
  return (
    <Modal
      title="发布提示词"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
    >
      <Input.TextArea
        rows={4}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="请输入发布说明"
      />
    </Modal>
  );
};

export default PublishModal;
