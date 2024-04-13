import { useCallback, useState } from "react";

type UseAlertReturnType = {
  message: string;
  isVisible: boolean;
  showAlert: (message: string) => void;
  hideAlert: () => void;
};

export const useAlert = (): UseAlertReturnType => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const showAlert = useCallback((message: string) => {
    setMessage(message);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setMessage("");
  }, []);

  return { message, isVisible, showAlert, hideAlert };
};

type AlertProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed right-5 top-5 rounded-md bg-red-500 p-4 text-white shadow-lg">
      <div>{message}</div>
      <button onClick={onClose} className="absolute right-1 top-1 text-lg">
        &times;
      </button>
    </div>
  );
};

export default Alert;
