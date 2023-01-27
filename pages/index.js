import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useSigner, useNetwork, useAccount } from "wagmi";
import axios from "axios";
import Swal from "sweetalert2";

import FileUploader from "../Components/FileUploader/FileUploader";
import ChainBanner from "../Components/ChainBanner/ChainBanner";
import Confetti from "../Components/Confetti/Confetti";
import Form from "../Components/Form/Form";
import Navbar from "../Components/Navbar/Navbar";

import styles from "../styles/Home.module.scss";
import abi from "../utils/abi.json";

export default function Home() {
  const [uploadSize, setUploadSize] = useState(0);
  const [requiredUpload, setRequiredUpload] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fireShot, setFireShot] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [isRightChain, setIsRightChain] = useState(true);

  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { isConnected: wagmiConnection, address } = useAccount();

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 7000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setRecipient(address);
    } else {
      setRecipient("");
    }
  }, [isConnected]);

  useEffect(() => {
    if (wagmiConnection) {
      setIsConnected(true);
    }
  }, [wagmiConnection]);

  const ipfsUpload = async (data) => {
    try {
      let rawResponse = axios.post(
        "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder",
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY,
          },
        }
      );
      let ipfsUrl = (await rawResponse).data[0].path;
      if (ipfsUrl.startsWith("https://ipfs.moralis.io:2053/ipfs/")) {
        return ipfsUrl
          .split("https://ipfs.moralis.io:2053/ipfs/")
          .join("ipfs://");
      } else {
        return responseObject;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (chain?.id === 137) {
      setIsRightChain(true);
    } else {
      setIsRightChain(false);
    }
  }, [chain]);

  const fireConfetti = () => {
    setFireShot(true);
  };

  useEffect(() => {
    if (fireShot) setFireShot(false);
  }, [fireShot]);

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setProcessStatus("Processing Image...");

    let imageIPFSUrl = await ipfsUpload(requiredUpload);

    setProcessStatus("Preparing Metadata...");

    let metadata = {
      name: title,
      description,
      image: imageIPFSUrl,
    };

    let metadataUploadObject = {
      path: "metadata",
      content: btoa(JSON.stringify(metadata)),
    };

    setProcessStatus("Processing Metadata...");
    let metadataURL = await ipfsUpload([metadataUploadObject]);
    // console.log(metadataURL);

    try {
      const { ethereum } = window;
      // console.log(signer);
      setProcessStatus("Minting...");
      Toast.fire({
        icon: "info",
        title: "Check your wallet to sign transaction",
      });

      if (signer.provider) {
        // const provider = new ethers.providers.Web3Provider(ethereum, "any");
        // const signer = provider.getSigner();
        const mintAToken = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          abi,
          signer
        );

        console.log("Minting Token..");
        const mintTokenTxn = await mintAToken.mintToken(
          metadataURL,
          recipient ? recipient : address,
          {
            gasLimit: 400000,
          }
        );

        await mintTokenTxn.wait();
        console.log("mined ", mintTokenTxn.hash);
        // console.log("Token Minted!");

        Swal.fire({
          title: "Transaction Mined!",
          html: `<a href="${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${mintTokenTxn.hash}" target="_blank">${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${mintTokenTxn.hash}</a>`,
          imageUrl: imageIPFSUrl,
          imageWidth: 200,
          imageAlt: "NFT Image",
        });

        setIsUploading(false);
        setProcessStatus("");
        fireConfetti();
      } else {
        console.log("Oops");
      }
    } catch (error) {
      console.log(error);
      setProcessStatus("Create an NFT Moment");
      setIsUploading(false);
    }
  };

  return (
    <>
      <Confetti fireShot={fireShot} />
      {!isRightChain && isConnected ? <ChainBanner /> : null}
      <div className={styles.Container}>
        <Navbar />
        <div className={styles.ContainerControl}>
          <div className={styles.ContainerControlContent}>
            <FileUploader
              setUploadSize={setUploadSize}
              setRequiredUpload={setRequiredUpload}
              isUploading={isUploading}
              requiredUpload={requiredUpload}
            />
          </div>
          <div className={styles.ContainerControlContent}>
            <Form
              isUploading={isUploading}
              setTitle={setTitle}
              title={title}
              description={description}
              recipient={recipient}
              setRecipient={setRecipient}
              setDescription={setDescription}
              formSubmitHandler={formSubmitHandler}
              disableForm={!isConnected}
              disabledSubmission={
                !isRightChain ||
                isUploading ||
                !requiredUpload ||
                (recipient && !ethers.utils.isAddress(recipient))
              }
              processStatus={processStatus}
            />
          </div>
        </div>
      </div>
    </>
  );
}
