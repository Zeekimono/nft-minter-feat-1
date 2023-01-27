import styles from "./FileUploader.module.scss";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUploader({
  requiredUpload,
  setUploadSize,
  setRequiredUpload,
  isUploading,
}) {
  const [imageUrl, setImageUrl] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    // console.log(acceptedFiles[0]);
    if (isUploading) return;
    if (acceptedFiles.length > 1 || !acceptedFiles.length) return;

    let folderSize = 0;
    const binaryFolderArray = [];

    for (let index = 0; index < acceptedFiles.length; index++) {
      let content = await fileToBase64(acceptedFiles[index]);
      folderSize += acceptedFiles[index].size;
      setImageUrl(content);
      binaryFolderArray.push({
        path: "image",
        content: content.split(",")[1],
      });
    }

    setUploadSize(folderSize);
    setRequiredUpload(binaryFolderArray);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  const fileToBase64 = async (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
    });

  const nameChangeHandler = (e) => {
    setUploadName(e.target.value);
  };

  return (
    <div>
      {!imageUrl ? (
        <div className={styles.FileUploader} {...getRootProps()}>
          <input {...getInputProps()} accept="image/*" type="file" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              {requiredUpload
                ? "File Ready"
                : "Drag and drop some files here, or click to select files"}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.ImagePreview}>
          <div
            className={styles.ImagePreviewClose}
            onClick={() => {
              setImageUrl("");
              setRequiredUpload("");
            }}
          >
            <span className={styles.ImagePreviewClose_bars}></span>
            <span className={styles.ImagePreviewClose_bars}></span>
          </div>
          <img src={imageUrl} alt="" />
        </div>
      )}
    </div>
  );
}
