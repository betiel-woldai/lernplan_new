import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './SimplifiedHeader.module.css';

interface SimplifiedHeaderProps {
  title?: string;
}

const SimplifiedHeader = ({ title }: SimplifiedHeaderProps) => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.headerWrapper}>
        <Link
          href={`${process.env.NEXT_PUBLIC_DIAS_BASE_URL || 'http://localhost:3001'}/dias-overview`}
          className={styles.backButton}
          title="Zurück zur DIAS Übersicht"
        >
          <FaArrowLeft className={styles.backArrow} />
          <span className={styles.backText}>
            Zurück zur DIAS Übersicht
          </span>
        </Link>

        <div className={styles.rightSection}>
          {title && <h1 className={styles.pageTitle}>{title}</h1>}
          <Link
            href="https://www.hs-ansbach.de/forschung/projekte/dias-der-digitale-studienassistent/"
            className={styles.logo}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <Image
              src="/logo1.png"
              alt="Logo"
              className={styles.logoImage}
              width={30}
              height={30}
            /> */}
            <div className={styles.title}>
              <span className={styles.line1}>DIAS | Digitaler Intelligenter Assistent</span>
              <span className={styles.line2}>Powered by HS Ansbach</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SimplifiedHeader;
