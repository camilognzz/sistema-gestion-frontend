import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg shadow-xl p-6 w-80 sm:max-w-lg">
          <div className="flex items-center">
            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
              <ExclamationTriangleIcon className="size-6 text-red-600" />
            </div>
            <div className="ml-4 text-left">
              <DialogTitle className="text-lg font-bold text-gray-900">
                {title}
              </DialogTitle>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
