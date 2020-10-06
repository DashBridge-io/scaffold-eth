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
      mnemonic: "window attend cram label noble they parent bonus measure same wagon keen",
    },
    apps: {
      tutorialContract: {
        contractId: "6MibJvnvYAHPTAfiCzp2ZQP2JALWMyNEim64PtRVD648",
      },
    },
  };
  const client = new Dash.Client(clientOpts);

  const uploadToDashDrive = async function (data) {
    const platform = client.platform;

    try {
      const identity = await platform.identities.get("B2gSaMW42k6ScaZk2E1tT2Ygj7LT17oED1arVXaW4Rro");

      const docProperties = {
        message: data,
      };

      // Create the note document
      const noteDocument = await platform.documents.create("tutorialContract.note", identity, docProperties);

      console.log("doc not submitted yet " + JSON.stringify(noteDocument));

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
      const documents = await client.platform.documents.get("tutorialContract.note", queryOpts);
      console.log(documents[0]);
      return documents[0].data.message;
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

  let ipfsDisplay = "";
  if (dashDriveId) {
    if (!dashDriveContents) {
      ipfsDisplay = <Spin />;
    } else {
      ipfsDisplay = (
        <pre style={{ margin: 8, padding: 8, border: "1px solid #dddddd", backgroundColor: "#ededed" }}>
          {dashDriveContents}
        </pre>
      );
    }
  }
  const asyncGetAttestation = async () => {
    let result = await getFromDashDrive(myAttestation);
    setAttestationContents(result.toString());
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
      Enter a bunch of data:
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
          console.log("UPLOADING...");
          setSending(true);
          setDashDriveId();
          setDashDriveContents();
          const dashDocument = await uploadToDashDrive(data);
          console.log("result: " + JSON.stringify(dashDocument));
          if (dashDocument && dashDocument.id) {
            setDashDriveId(dashDocument.id);
          }
          setSending(false);
          console.log("RESULT:", dashDocument);
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
        {ipfsDisplay}
        <Button
          disabled={!dashDriveId}
          style={{ margin: 8 }}
          size="large"
          shape="round"
          type="primary"
          onClick={async () => {
            props.tx(props.writeContracts["Attestor"].attest(dashDriveId));
          }}
        >
          Attest to this hash on Ethereum
        </Button>
      </div>
      <div style={{ padding: 32, textAlign: "left" }}>{attestationDisplay}</div>
    </div>
  );
}
