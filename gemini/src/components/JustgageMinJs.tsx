import React, { useEffect, useRef, useState, useCallback } from 'react';

// TODO: This component acts as a React wrapper around the legacy JustGage.js library.
// It is critical that Raphael.js and JustGage.js (the library derived from the input content)
// are loaded globally in your application's `index.html` or equivalent entry point
// BEFORE this component attempts to render. For example:
// <script src="path/to/raphael.min.js"></script>
// <script src="path/to/justgage.min.js"></script>
// Without these global scripts, the component will not function as expected.

// Minimal type declarations for `Raphael` and `JustGage` to satisfy TypeScript.
// In a real project, you would typically use `@types/raphael` and create or find
// a comprehensive declaration file for JustGage if one doesn't exist.
declare global {
  interface RaphaelElement {
    attr: (attributes: object) => RaphaelElement;
    animate: (attributes: object, time: number, type: string, callback?: () => void) => void;
    transform: (transformString: string) => void;
    node: {
      firstChild: {
        attributes: {
          dy?: { value: number; };
        };
      };
    };
    id: string;
  }

  interface RaphaelPaper {
    path: () => RaphaelElement;
    text: (x: number, y: number, text: string | number) => RaphaelElement;
    customAttributes: {
      pki?: (t: number, e?: boolean) => { path: string };
      ndl?: (t: number) => { path: string };
    };
    setViewBox: (x: number, y: number, width: string | number, height: string | number, fit: boolean) => void;
    canvas: HTMLElement;
    clear: () => void; // Added for cleanup
  }

  interface RaphaelStatic {
    (container: string | HTMLElement, width: string | number, height: string | number): RaphaelPaper;
    eve: {
      on: (event: string, handler: (...args: any[]) => void) => void;
      off: (event: string, handler: (...args: any[]) => void) => void;
    };
  }

  var Raphael: RaphaelStatic; // Global Raphael object

  class JustGage {
    constructor(options: {
      id?: string;
      parentNode?: HTMLElement;
      value: number;
      min: number;
      max: number;
      label?: string;
      // A selection of common JustGage options. More can be added as needed based on the library's full API.
      valueFontColor?: string;
      labelFontColor?: string;
      levelColors?: string[];
      donut?: boolean;
      pointer?: boolean;
      startAnimationTime?: number;
      startAnimationType?: string;
      refreshAnimationTime?: number;
      refreshAnimationType?: string;
      onAnimationEnd?: (() => void) | null;
      textRenderer?: ((value: any) => string | boolean) | null;
      humanFriendly?: boolean;
      formatNumber?: boolean;
      displayRemaining?: boolean;
      decimals?: number;
      symbol?: string;
      gaugeWidthScale?: number;
      relativeGaugeSize?: boolean;
      customSectors?: { ranges: { lo: number; hi: number; color: string }[]; percents?: boolean };
      counter?: boolean;
      hideValue?: boolean;
      hideMinMax?: boolean;
      minTxt?: string | boolean;
      maxTxt?: string | boolean;
      humanFriendlyDecimal?: number;
      reverse?: boolean;
      gaugeColor?: string;
      valueFontFamily?: string;
      labelFontFamily?: string;
      valueMinFontSize?: number;
      labelMinFontSize?: number;
      minLabelMinFontSize?: number;
      maxLabelMinFontSize?: number;
      showInnerShadow?: boolean;
      noGradient?: boolean;
      differential?: boolean;
      donutStartAngle?: number;
      pointerOptions?: {
        toplength?: number;
        bottomlength?: number;
        bottomwidth?: number;
        stroke?: string;
        stroke_width?: number;
        stroke_linecap?: string;
        color?: string;
      };
    });
    refresh: (newValue: number, newMax?: number, newMin?: number, newLabel?: string) => void;
    // Access to internal properties for cleanup or advanced manipulation if needed
    canvas: RaphaelPaper;
    config: any;
    level: RaphaelElement;
    txtValue: RaphaelElement;
    originalValue: number | string;
    bindEvent: (eventName: string, handler: Function) => void;
  }
}

interface JustgageProps {
  setView: (view: string) => void;
  value: number;
  min?: number;
  max?: number;
  label?: string;
  id?: string; // Unique ID for the gauge container. Defaults to 'justgage-container'.
  // Allows passing any other JustGage constructor options directly as props.
  [key: string]: any;
}

export const JustgageMinJs = ({ setView, value, min = 0, max = 100, label = '', id = 'justgage-container', ...otherOptions }: JustgageProps) => {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const justGageInstance = useRef<JustGage | null>(null);

  useEffect(() => {
    // Check if JustGage and Raphael libraries are available globally before attempting to initialize.
    if (typeof window !== 'undefined' && window.JustGage && window.Raphael && gaugeRef.current) {
      const gaugeOptions = {
        id: id, // JustGage can use this ID or the parentNode directly.
        parentNode: gaugeRef.current, // Provide the ref element directly for robust instantiation.
        value: value,
        min: min,
        max: max,
        label: label,
        ...otherOptions,
      };

      try {
        // Instantiate JustGage. This is the 'lógica básica' from the provided script.
        const gauge = new window.JustGage(gaugeOptions);
        justGageInstance.current = gauge;
      } catch (error) {
        console.error('Erro ao instanciar JustGage:', error);
      }

      // Cleanup function: remove the gauge when the component unmounts to prevent memory leaks.
      return () => {
        if (justGageInstance.current && justGageInstance.current.canvas) {
          justGageInstance.current.canvas.clear(); // Clear all SVG elements from the Raphael paper.
          // Depending on JustGage's internal cleanup, you might also need to remove the SVG element
          // if it's not fully detached by `clear()`.
        }
        justGageInstance.current = null;
      };
    } else {
      // Log a warning if the necessary global libraries are not found.
      console.warn('JustGage ou Raphael não estão disponíveis globalmente. Por favor, certifique-se de que as bibliotecas estejam carregadas.');
    }
  }, [id]); // Re-initialize the gauge if its container ID changes.

  useEffect(() => {
    // Update the gauge when its core properties (value, min, max, label) change.
    if (justGageInstance.current) {
      // JustGage's `refresh` method supports updating the value, max, min, and label.
      // For `otherOptions`, JustGage does not provide a generic update method for all configuration.
      // If changes in `otherOptions` (e.g., `donut` mode, `levelColors`) require a full re-render,
      // you might need to manage the `id` prop to force re-initialization of the component,
      // or manually update properties if JustGage's internal API allows it.
      try {
        justGageInstance.current.refresh(value, max, min, label);
      } catch (error) {
        console.error('Erro ao atualizar JustGage:', error);
      }
    }
  }, [value, min, max, label, JSON.stringify(otherOptions)]); // Deep compare `otherOptions` for changes.

  return (
    <div
      id={id}
      ref={gaugeRef}
      // Applying basic Tailwind CSS for a modern, responsive container.
      className="w-full h-64 flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md border border-gray-200"
    >
      {/* The JustGage SVG content will be rendered inside this div by the library. */}
      {/* Adding navigation buttons as requested, replacing legacy <a> tags. */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setView("DashboardPage")}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out"
        >
          Ver Dashboard
        </button>
        <button
          onClick={() => setView("SettingsPage")}
          className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out"
        >
          Ajustar Configurações
        </button>
      </div>
    </div>
  );
};