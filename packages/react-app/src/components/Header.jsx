import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/DashBridge-io/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Eth - DashDrive"
        subTitle="scaffold-eth example using DashDrive for storage"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
