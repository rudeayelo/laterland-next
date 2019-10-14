import React, { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Alert } from "./Alert";

type Alert = {
  content: React.ReactNode;
  type: "default" | "success" | "danger" | "warning";
};

type AlertContext = {
  setAlert({ content, type }: Alert): void;
  setActive(active: boolean): void;
};

export const AlertContext = React.createContext<AlertContext>({
  setAlert: ({ content, type }: Alert) => {
    throw new Error("setAlert() not implemented");
  },
  setActive: (active: boolean) => {
    throw new Error("setActive() not implemented");
  }
});

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const [active, setActive] = useState(false);

  const variants = {
    active: {
      y: 0
    },
    inactive: {
      y: "-100%"
    }
  };

  return (
    <AlertContext.Provider value={{ setAlert, setActive }}>
      <motion.div
        variants={variants}
        animate={active ? "active" : "inactive"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10
        }}
      >
        {alert && (
          <Alert intent={alert.type} m={3}>
            {alert.content}
          </Alert>
        )}
      </motion.div>
      {children}
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  const { setAlert, setActive } = useContext(AlertContext);

  const DEFAULT_TIMEOUT = 3000;
  let timeoutFn;

  const activate = (timeout: number = DEFAULT_TIMEOUT) => {
    setActive(true);
    timeoutFn = setTimeout(() => setActive(false), timeout);
  };

  const deactivate = (timeout: number = DEFAULT_TIMEOUT) => {
    clearTimeout(timeoutFn);
    setActive(false);
    setAlert(null);
  };

  const alertInfo = (content: React.ReactNode) => {
    setAlert({ content, type: "default" });
    activate();
  };
  const alertSuccess = (content: React.ReactNode) => {
    setAlert({ content, type: "success" });
    activate();
  };
  const alertDanger = (content: React.ReactNode) => {
    setAlert({ content, type: "danger" });
    activate();
  };
  const closeAlert = () => {
    deactivate();
  };

  return { alertInfo, alertSuccess, alertDanger, closeAlert };
};

export { AlertProvider, useAlert };
