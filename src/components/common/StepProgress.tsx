import React from "react";
import { FaCheck } from "react-icons/fa";

interface StepProgressProps {
  current: number;
  steps: string[];
  className?: string;
  labelClassName?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  current,
  steps,
  className = "",
  labelClassName = "text-[var(--color-muted-text)]",
}) => (
  <div className={`flex items-center gap-1.5 ${className}`.trim()}>
    {steps.map((_, idx) => {
      const stepNum = idx + 1;

      return (
        <React.Fragment key={stepNum}>
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300 ${
              stepNum <= current
                ? "text-[var(--color-surface)]"
                : "bg-[var(--color-control-bg)] text-[var(--color-muted-text)]"
            }`}
            style={
              stepNum <= current
                ? { backgroundColor: "var(--color-primary-500)" }
                : undefined
            }
          >
            {stepNum < current ? <FaCheck className="w-3.5 h-3.5" /> : stepNum}
          </div>
          {stepNum < steps.length && (
            <div
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  stepNum < current
                    ? "var(--color-primary-500)"
                    : "var(--color-border)",
              }}
            />
          )}
        </React.Fragment>
      );
    })}
    <span
      className={`ml-2 text-xs font-semibold whitespace-nowrap ${labelClassName}`.trim()}
    >
      {steps[current - 1]}
    </span>
  </div>
);
