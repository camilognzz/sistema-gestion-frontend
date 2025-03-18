import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title }) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-900/60" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SuccessModal;
