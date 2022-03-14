import Head from 'next/head'
import styles from '../styles/layout.module.css'
import utilStyles from '../styles/utils.module.css'
import MyNav from './nav'

const name = 'Chuanyu Pan (潘传宇)'

export default function Layout({ children}) {
  return (
    <div>
        <Head>
          <title>Chuanyu Pan</title>
          <meta name="keywords" content="ChuanyuPan, 潘传宇, Chuanyu, Tsinghua, 清华"></meta>
          <meta name="description" content="This page is Chuanyu Pan's home page."></meta>
          <meta name="author" content="Chuanyu Pan 潘传宇"></meta>
          <meta http-equiv="content-Type" content="text/html; charset=utf-8"></meta>
          <meta name="google-site-verification" content="RisFS-DjchuTNwiHmyLFchX4R3TSW4H2DcU57Zza9d0" />
        </Head>
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
