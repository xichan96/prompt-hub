import React from "react";
import Header, { type HeaderProps } from "./Header";
import Sider, { type SiderProps } from "./Sider";

export const Layout: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      width: "100%",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Main: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div
    style={{
      height: "100vh",
      paddingTop: 48,
      display: "flex",
      backgroundColor: "var(--body-bg)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Content: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div
    style={{
      width: "100%",
      minHeight: "100%",
      overflowY: "auto",
      backgroundColor: "var(--body-bg)",
      padding: "24px",
      ...style,
    }}
  >
    {children}
  </div>
);

export {
  Header,
  Sider,
  type HeaderProps,
  type SiderProps,
};

