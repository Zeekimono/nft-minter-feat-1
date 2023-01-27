import styles from "./Form.module.scss";

export default function Form({
  disableForm,
  setTitle,
  title,
  description,
  recipient,
  setRecipient,
  setDescription,
  formSubmitHandler,
  disabledSubmission,
  processStatus,
}) {
  return (
    <form className={styles.Form} onSubmit={(e) => formSubmitHandler(e)}>
      <h2>
        Create An <span className={styles.dynamic}>NFT Moment</span>
      </h2>
      <p>
        File types supported: JPG, PNG, GIF, SVG, MP4, WEBM. Max size: 40 MB.
        Thank you for creating an NFT Moment!
      </p>
      <div className={styles.FormEntry}>
        <input
          placeholder={"Title"}
          type="text"
          value={title}
          disabled={disableForm}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder={"Description"}
          disabled={disableForm}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          placeholder={"Recipient-Address"}
          type="text"
          disabled={disableForm}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </div>
      <button disabled={disabledSubmission} type="submit">
        {processStatus ? processStatus : "Create an NFT Moment"}
      </button>
    </form>
  );
}
