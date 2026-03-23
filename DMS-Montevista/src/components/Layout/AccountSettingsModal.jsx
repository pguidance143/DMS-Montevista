import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AccountSettingsModal = ({ showModal, setShowModal, user, onSave }) => {
  const [fullName, setFullName] = useState(user?.username || "");
  const [error, setError] = useState(null);

  const prevShowModalRef = useRef();

  useEffect(() => {
    if (showModal && !prevShowModalRef.current) {
      if (user) {
        setFullName(user.username || "");
        setError(null);
      }
    }
    prevShowModalRef.current = showModal;
  }, [showModal, user]);

  const handleClose = () => {
    setShowModal(false);
    setError(null);
  };

  const handleSubmit = () => {
    onSave({ username: fullName.trim() });
    setShowModal(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="account-settings-title"
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full shadow-xl border border-gray-200 relative"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close account settings"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2
                id="account-settings-title"
                className="text-lg font-semibold text-gray-900 mb-6 text-center"
              >
                Account Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Your full name"
                    autoFocus
                    disabled
                  />
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    value={user.role || "—"}
                    readOnly
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-500 cursor-default"
                  />
                </div>

                {error && (
                  <motion.p
                    className="text-red-600 text-sm text-center"
                    role="alert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-3 rounded-lg text-white bg-red-600 hover:bg-red-700 border border-red-600 transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountSettingsModal;
