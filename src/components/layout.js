import styles from '../styles/layout.module.css'
import utilStyles from '../styles/utils.module.css'
import MyNav from './nav'
import {BsFillPersonFill, BsFillGeoAltFill, BsFillEnvelopeOpenFill} from 'react-icons/bs';

const name = 'Chuanyu Pan (潘传宇)'

export default function Layout({ children}) {
  return (
    <div>
        <MyNav/>
        <div className={styles.container}>
            <header className={styles.header}>
                    <img
                    src="/images/profile.jpg"
                    className={`${styles.headerHomeImage} ${utilStyles.borderCircle}`}
                    alt={name}
                    />
                    <h1 className={utilStyles.heading2Xl}>{name}</h1>
            </header>
            <section className={utilStyles.headingMd}>
                <p className={styles.intropara}><BsFillPersonFill /> Undergrad of CST, Tsinghua University</p>
                <p className={styles.intropara}><BsFillGeoAltFill /> Haidian, Beijing, China</p>
                <p className={styles.intropara}><BsFillEnvelopeOpenFill /> pancy17@mails.tsinghua.edu.cn</p>
            </section>
            <main>{children}</main>
        </div>
    </div>
  )
}
