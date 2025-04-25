'use client';

import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // 颜色配置
  const colors = {
    warning: {
      bg: 'bg-white',
      border: 'border-accent',
      icon: 'text-accent',
      button: 'bg-accent hover:bg-accent/90',
      text: 'text-gray-700'
    },
    danger: {
      bg: 'bg-white',
      border: 'border-red-500',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600',
      text: 'text-gray-800'
    },
    info: {
      bg: 'bg-white',
      border: 'border-primary',
      icon: 'text-primary',
      button: 'bg-primary hover:bg-primary/90',
      text: 'text-gray-700'
    },
    success: {
      bg: 'bg-white',
      border: 'border-tertiary',
      icon: 'text-tertiary',
      button: 'bg-tertiary hover:bg-tertiary/90',
      text: 'text-gray-700'
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimatingOut(false);
    } else if (isVisible) {
      handleAnimateOut();
    }
  }, [isOpen]);

  const handleAnimateOut = () => {
    setIsAnimatingOut(true);
    // 等待动画完成后隐藏
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleConfirm = () => {
    handleAnimateOut();
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  const handleCancel = () => {
    handleAnimateOut();
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 transition-opacity duration-300 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleCancel}
    >
      <div 
        className={`w-full max-w-md transition-all duration-300 ${
          isAnimatingOut 
            ? 'translate-y-8 scale-95 opacity-0' 
            : 'translate-y-0 scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`cartoon-card border-4 p-5 ${colors[type].bg} ${colors[type].border} shadow-xl animate-none overflow-visible`}>
          {/* 顶部摇晃的图标 */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className={`w-12 h-12 rounded-full bg-white border-4 ${colors[type].border} flex items-center justify-center animate-swing`}>
              {type === 'warning' || type === 'danger' ? (
                <FiAlertTriangle className={`text-xl ${colors[type].icon}`} />
              ) : (
                <FiCheckCircle className={`text-xl ${colors[type].icon}`} />
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className={`${colors[type].text} mb-6`}>{message}</p>
            
            <div className="flex space-x-3 justify-center">
              <button
                className={`cartoon-btn-secondary flex-1 max-w-32 ${isAnimatingOut ? '' : 'animate-pop'}`}
                style={{ animationDelay: '0.1s' }}
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button
                className={`cartoon-btn flex-1 max-w-32 ${colors[type].button} ${isAnimatingOut ? '' : 'animate-pop'}`}
                style={{ animationDelay: '0.2s' }}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
          
          {/* 关闭按钮 */}
          <button 
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={handleCancel}
          >
            <FiX className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
} 