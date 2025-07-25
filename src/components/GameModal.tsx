"use client";

import React, { useEffect } from 'react';

interface GameModalProps {
  isOpen: boolean;
  message: string;
  type: 'win' | 'lose' | 'info';
  onClose: () => void;
}

export default function GameModal({ isOpen, message, type, onClose }: GameModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalStyle = () => {
    switch (type) {
      case 'win':
        return {
          borderColor: 'var(--neon-green)',
          boxShadow: '0 0 50px rgba(57, 255, 20, 0.5)',
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(0, 212, 255, 0.1))'
        };
      case 'lose':
        return {
          borderColor: 'var(--neon-red)',
          boxShadow: '0 0 50px rgba(255, 7, 58, 0.5)',
          background: 'linear-gradient(135deg, rgba(255, 7, 58, 0.1), rgba(191, 0, 255, 0.1))'
        };
      default:
        return {
          borderColor: 'var(--neon-blue)',
          boxShadow: '0 0 50px rgba(0, 212, 255, 0.5)',
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(191, 0, 255, 0.1))'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'win':
        return '🎉';
      case 'lose':
        return '💥';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={getModalStyle()}>
        <div className="modal-icon">
          {getIcon()}
        </div>
        <div className="modal-message">
          {message}
        </div>
        <button className="modal-close" onClick={onClose}>
          Continue
        </button>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          padding: 2rem;
          border-radius: 16px;
          border: 2px solid;
          backdrop-filter: blur(20px);
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: slideInScale 0.4s ease-out;
        }
        
        .modal-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 10px currentColor);
        }
        
        .modal-message {
          font-size: 1.5rem;
          font-weight: 600;
          font-family: 'Orbitron', monospace;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .modal-close {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
          color: white;
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }
        
        .modal-close:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5);
        }
        
        .modal-close:active {
          transform: translateY(0);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .modal-content {
            padding: 1.5rem;
            margin: 1rem;
          }
          
          .modal-icon {
            font-size: 2.5rem;
          }
          
          .modal-message {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}