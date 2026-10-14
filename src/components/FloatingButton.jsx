import { motion } from "framer-motion";
import { ChatIcon, CloseIcon } from "./Icons";

export default function FloatingButton({ isOpen, onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <>
          <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-pulse-ring animation-delay-2000" />
        </>
      )}

      <motion.button
        onClick={onClick}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-500/60 transition-shadow animate-gradient-x"
        whileHover={{ scale: 1.1, rotate: isOpen ? 0 : 6 }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        aria-label={isOpen ? "Tutup chat" : "Buka chat AI"}
      >
        {isOpen ? <CloseIcon size={22} /> : <ChatIcon size={24} />}
      </motion.button>
    </div>
  );
}
