import Layout from '../components/layout'
import styles from '../styles/Home.module.css'
import utilStyles from '../styles/utils.module.css'
import {BsFillPersonFill, BsFillGeoAltFill, BsFillEnvelopeOpenFill, BsPinterest, BsGithub, BsGoogle, BsLinkedin, BsFillFileEarmarkMedicalFill} from 'react-icons/bs';

import Link from 'next/link'
import {Grid, Item} from '@mui/material/'

const iconlink_size = 23

export default function Home() {
  return (
    <div>
      <Layout>
        <section className={utilStyles.headingMd}>
          {/* about me */}
          <section className={styles.sectioncard}>
            <h2 className={styles.sectiontitle}>About me</h2>
            <p className={`${styles.intropara} ${styles.introtext}`}>Hi, I'm currently a 3D AI research engineer at Meshy, exploring future 3D generative tools. I received a master's degree in EECS at UC Berkeley and a bachelor's degree in CS at Tsinghua University (Beijing, China). My working and research interest lies in Computer Graphics and 3D Vision, aiming to enhance machines' 3D perception and create 3D Mixed Reality.</p>
            <p className={styles.intropara}><BsFillPersonFill />&nbsp;&nbsp; 3D AI Research Engineer @ <a href='https://www.meshy.ai/' target="_blank" className={styles.link}>Meshy</a></p>
            <p className={styles.intropara}><BsFillGeoAltFill />&nbsp;&nbsp;  San Jose, California, United States</p>
            <p className={styles.intropara}><BsFillEnvelopeOpenFill />&nbsp;&nbsp;  chuanyu_pan@berkeley.edu</p>
            <p className={styles.intropara}><BsPinterest />&nbsp;&nbsp;  Research Interest: 3D AI, Computer Graphics, VR/AR/MR</p>

            <ul className={styles.iconpara}>
              <span className={styles.iconlink}><a href='https://github.com/pptrick' className={styles.link}><BsGithub size={iconlink_size}/></a></span>
              <span className={styles.iconlink}><a href='https://scholar.google.com/citations?user=wNKoPGAAAAAJ&hl=en' className={styles.link}><BsGoogle size={iconlink_size}/></a></span>
              <span className={styles.iconlink}><a href='https://www.linkedin.com/in/chuanyu-pan/' className={styles.link}><BsLinkedin size={iconlink_size}/></a></span>
              <span className={styles.iconlink}><a href='/files/resume.pdf' className={styles.link}><BsFillFileEarmarkMedicalFill size={iconlink_size}/></a></span>
            </ul>
          </section>

          {/* publications */}
          <Link href='/publication'>
          <section className={styles.sectioncard}>
            <h2 className={styles.sectiontitle}>Publication</h2>
            <div className={styles.intropara}>
              <Grid container spacing={6}>
                    <Grid item xs={12} md={4}> {/*An image set on left*/}
                      <img
                      src="/images/pubimg.png"
                      className={styles.image}
                      alt="pubimg"
                      />
                    </Grid>
                    <Grid item xs={12} md={8}> {/*Content set on right*/}
                      <p className={styles.imagetext}>My research interests mainly lies in 3D vision and computer graphics, and I have publications on top conferences like CVPR, ICLR, etc. I had experience on 3D reconstruction and perception, and hope to investigate more in these fields.</p>
                    </Grid>
              </Grid>
            </div>
          </section>
          </Link>

          {/* education */}
          <Link href='/education'>
          <section className={styles.sectioncard}>
            <h2 className={styles.sectiontitle}>Education</h2>
            <div className={styles.intropara}>
              <Grid container spacing={6}>
                    <Grid item xs={12} md={4}> {/*An image set on left*/}
                      <img
                      src="/images/eduimg.png"
                      className={styles.image}
                      alt="pubimg"
                      />
                    </Grid>
                    <Grid item xs={12} md={8}> {/*Content set on right*/}
                    <p className={styles.imagetext}>I obtained my master's degree from UC Berkeley, major in computer Science (visual computing and computer graphics). Before joining berkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China).</p>
                    </Grid>
              </Grid>
            </div>
          </section>
          </Link>

        </section>
      </Layout>
    </div>
  )
}
