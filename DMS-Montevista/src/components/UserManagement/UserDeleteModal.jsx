import ConfirmModal from "../common/ConfirmModal";

export default function UserDeleteModal({ open, onClose, onConfirm, user, deleting }) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{user?.full_name}</span>?
          This action cannot be undone.
        </>
      }
      confirmLabel="Delete"
      loading={deleting}
    />
  );
}
