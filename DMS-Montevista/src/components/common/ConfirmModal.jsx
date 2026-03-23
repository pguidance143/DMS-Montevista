import Modal from "./Modal";
import ActionButton from "./ActionButton";
import { TriangleAlert } from "lucide-react";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message,
  confirmLabel = "Delete",
  loading = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={TriangleAlert}
      size="sm"
      footer={
        <>
          <ActionButton
            label="Cancel"
            variant="secondary"
            tooltip="Go back"
            onClick={onClose}
            disabled={loading}
          />
          <ActionButton
            label={loading ? "Deleting…" : confirmLabel}
            variant="danger"
            tooltip="Confirm and delete permanently"
            onClick={onConfirm}
            disabled={loading}
          />
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
          <TriangleAlert className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
