import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  return (
    <nav className={styles.Navbar}>
      <img src="/logo.png" />
      <h2>NFT Minting Feature</h2>
      <div>
        <ConnectButton
          chainStatus={{ smallScreen: "icon", largeScreen: "icon" }}
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
        />
      </div>
    </nav>
  );
}
