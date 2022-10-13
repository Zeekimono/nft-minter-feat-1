import styles from "./ChainBanner.module.scss";

export default function ChainBanner({ chain }) {
  return (
    <div className={styles.ChainBanner}>
      You&lsquo;re not on the supported network. Kindly{" "}
      <span>
        <u>switch</u>
      </span>{" "}
      to Polygon to use the system
    </div>
  );
}
