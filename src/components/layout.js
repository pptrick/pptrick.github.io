import styles from '../styles/layout.module.css'
import utilStyles from '../styles/utils.module.css'
import MyNav from './nav'
import {BsFillPersonFill, BsFillGeoAltFill, BsFillEnvelopeOpenFill, BsGithub, BsGoogle, BsLinkedin} from 'react-icons/bs';

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
            <main>{children}</main>
        </div>
    </div>
  )
}
