import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let nextId = 0;

const STYLES = {
  success: {
    bar: "bg-green-500",
    icon: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
  },
  error: {
    bar: "bg-red-500",
    icon: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  },
  info: {
    bar: "bg-blue-500",
    icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  },
};

const DURATION = 3500;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback((message, type = "success") => {
    const id = ++nextId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), DURATION);
  }, [remove]);

  const toast = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    info:    (msg) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const { bar, icon } = STYLES[type] || STYLES.info;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 min-w-[260px] max-w-xs overflow-hidden"
              >
                {/* Colored left bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${bar}`} />

                <div className="ml-1">{icon}</div>

                <p className="text-sm text-gray-700 flex-1 leading-snug">{message}</p>

                <button
                  onClick={() => remove(id)}
                  className="text-gray-300 hover:text-gray-500 transition flex-shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
