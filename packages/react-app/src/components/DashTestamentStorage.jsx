import React, { useState, useEffect } from "react";
import { Input, Button, Spin } from "antd";
import { useContractReader } from "../hooks";
import { Address } from ".";

export default function DashTestamentStorage(props) {
  const { TextArea } = Input;
  const [data, setData] = useState();
  const [sending, setSending] = useState();
  const [dashDriveId, setDashDriveId] = useState();
  const [dashDriveContents, setDashDriveContents] = useState();
  const myAttestation = useContractReader(props.readContracts, "Attestor", "attestations", [props.address], 1777);
  const [attestationContents, setAttestationContents] = useState();
  const Dash = require("dash"); 

  const clientOpts = {
    network: "evonet",
    wallet: {
      mnemonic: "<-- replace with wallet mnemonic -->",
    },
    apps: {
      attestorDataContract: {
        contractId: "<-- replace with DASH data contract ID -->",
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const uploadToDashDrive = async function (data) {
    const platform = client.platform;

    try {
      const identity = await platform.identities.get("<-- replace with DASH Identity Id -->");

      const docProperties = {
        statement: data,
      };

      // Create the note document
      const noteDocument = await platform.documents.create("attestorDataContract.attestation", identity, docProperties);

      const documentBatch = {
        create: [noteDocument],
        replace: [],
        delete: [],
      };
      // Sign and submit the document(s)
      await platform.documents.broadcast(documentBatch, identity);
      console.log("doc submitted." + JSON.stringify(noteDocument));
      return noteDocument;
    } catch (e) {
      console.error("Something went wrong:", e);
    } finally {
      client.disconnect();
    }
  };

  const getFromDashDrive = async hashToGet => {
    try {
      const queryOpts = {
        where: [["$id", "==", hashToGet]],
      };
      const documents = await client.platform.documents.get("attestorDataContract.attestation", queryOpts);
      return documents[0] !== undefined ? documents[0].data.statement : "";
    } catch (e) {
      console.error("Something went wrong:", e);
    } finally {
      client.disconnect();
    }
  };

  const asyncGetFile = async () => {
    let result = await getFromDashDrive(dashDriveId);
    setDashDriveContents(result.toString());
  };

  useEffect(() => {
    if (dashDriveId) asyncGetFile();
  }, [dashDriveId]);

  let dashDriveDisplay = "";
  if (dashDriveId) {
    if (!dashDriveContents) {
      dashDriveDisplay = <Spin />;
    } else {
      dashDriveDisplay = (
        <pre style={{ margin: 8, padding: 8, border: "1px solid #dddddd", backgroundColor: "#ededed" }}>
          {dashDriveContents}
        </pre>
      );
    }
  }
  const asyncGetAttestation = async () => {
    const result = await getFromDashDrive(myAttestation);
    if (result !== undefined) {
      setAttestationContents(result.toString());
    }
  };

  useEffect(() => {
    if (myAttestation) asyncGetAttestation();
  }, [myAttestation]);

  let attestationDisplay = "";
  if (myAttestation) {
    if (!attestationContents) {
      attestationDisplay = <Spin />;
    } else {
      attestationDisplay = (
        <div>
          <Address value={props.address} /> attests to:
          <pre style={{ margin: 8, padding: 8, border: "1px solid #dddddd", backgroundColor: "#ededed" }}>
            {attestationContents}
          </pre>
        </div>
      );
    }
  }
  return (
    <div style={{ padding: 32, textAlign: "left" }}>
      Enter a statement you attest to:
      <TextArea
        rows={10}
        value={data}
        onChange={e => {
          setData(e.target.value);
        }}
      />
      <Button
        style={{ margin: 8 }}
        loading={sending}
        size="large"
        shape="round"
        type="primary"
        onClick={async () => {
          setSending(true);
          setDashDriveId();
          setDashDriveContents();
          const dashDocument = await uploadToDashDrive(data);
          if (dashDocument && dashDocument.id) {
            setDashDriveId(dashDocument.id);
          }
          setSending(false);
        }}
      >
        Upload to Dash Drive
      </Button>
      <div style={{ padding: 32, textAlign: "left" }}>
        Dash Drive ID:{" "}
        <Input
          value={dashDriveId}
          onChange={e => {
            setDashDriveId(e.target.value);
          }}
        />
        {dashDriveDisplay}
        <Button
          disabled={!dashDriveId}
          style={{ margin: 8 }}
          size="large"
          shape="round"
          type="primary"
          onClick={async () => {
            props.tx(props.writeContracts.Attestor.attest(dashDriveId));
          }}
        >
          Attest to this hash on Ethereum
        </Button>
      </div>
      <div style={{ padding: 32, textAlign: "left" }}>{attestationDisplay}</div>
    </div>
  );
}
