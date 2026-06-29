import React from 'react';
import type { OrderStatus } from './Badge';
import './StatusStepper.css';

interface StatusStepperProps {
  currentStatus: OrderStatus;
}

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'RECIBIDO', label: 'RECIBIDO' },
  { status: 'EN_COCINA', label: 'EN_COCINA' },
  { status: 'EN_DESPACHO', label: 'EN_DESPACHO' },
  { status: 'ENTREGADO', label: 'ENTREGADO' },
];

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const currentIndex = steps.findIndex(s => s.status === currentStatus);
  
  // Si está en reparto, lo consideramos como 'EN_DESPACHO' para el stepper lineal (basado en el mock de 4 pasos)
  const activeIndex = currentStatus === 'EN_REPARTO' ? 2 : currentIndex;

  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <div key={step.status} className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
            <div className="stepper-node">
              <div className="stepper-circle" />
            </div>
            {index < steps.length - 1 && <div className="stepper-line" />}
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
