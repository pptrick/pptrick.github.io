import Head from 'next/head'
import Layout from '../components/layout'
import styles from '../styles/Home.module.css'
import utilStyles from '../styles/utils.module.css'
import {BsFillPersonFill, BsFillGeoAltFill, BsFillEnvelopeOpenFill, BsGithub, BsGoogle, BsLinkedin} from 'react-icons/bs';

const iconlink_size = 23

export default function Home() {
  return (
    <div>
      <Head>
        <title>Chuanyu Pan</title>
      </Head>
      <Layout>
        <section className={utilStyles.headingMd}>
            <p className={styles.intropara}><BsFillPersonFill /> Undergrad of CST, Tsinghua University</p>
            <p className={styles.intropara}><BsFillGeoAltFill /> Haidian, Beijing, China</p>
            <p className={styles.intropara}><BsFillEnvelopeOpenFill /> pancy17@mails.tsinghua.edu.cn</p>
            <ul className={styles.intropara}>
              <il className={styles.iconlink}><a href='https://github.com/pptrick' className={styles.link}><BsGithub size={iconlink_size}/></a></il>
              <il className={styles.iconlink}><a href='https://scholar.google.com/citations?user=wNKoPGAAAAAJ&hl=en' className={styles.link}><BsGoogle size={iconlink_size}/></a></il>
              <il className={styles.iconlink}><a href='https://www.linkedin.cn/injobs/in/%E4%BC%A0%E5%AE%87-chuanyu-pan-%E6%BD%98-206a59220' className={styles.link}><BsLinkedin size={iconlink_size}/></a></il>
            </ul>
        </section>
      </Layout>
    </div>
  )
}
