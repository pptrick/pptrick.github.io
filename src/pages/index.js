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
            <p className={`${styles.intropara} ${styles.introtext}`}>Hi, I am currently an MEng student in the department of Electronic Engineering and Computer Science at UC Berkeley. Before joining UCBerkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China). My professional and research interest lies in Computer Graphics and 3D Vision, aiming to enhance machines' 3D perception and create Mixed Reality. My research areas include 3D object tracking, 3D reconstruction, and avatar creation. I would like to explore more interesting areas in 3D in the future!</p>
            <p className={styles.intropara}><BsFillPersonFill />&nbsp;&nbsp; Master Student of EECS, University of California Berkeley</p>
            <p className={styles.intropara}><BsFillGeoAltFill />&nbsp;&nbsp;  Berkeley, California, United States</p>
            <p className={styles.intropara}><BsFillEnvelopeOpenFill />&nbsp;&nbsp;  chuanyu_pan@berkeley.edu</p>
            <p className={styles.intropara}><BsPinterest />&nbsp;&nbsp;  Research Interest: 3D Computer Vision, Computer Graphics, VR/AR/MR</p>

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
              <Grid container spacing={2}>
                    <Grid item xs={4}> {/*An image set on left*/}
                      <img
                      src="/images/pubimg.png"
                      className={styles.image}
                      alt="pubimg"
                      />
                    </Grid>
                    <Grid item xs={8}> {/*Content set on right*/}
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
              <Grid container spacing={2}>
                    <Grid item xs={4}> {/*An image set on left*/}
                      <img
                      src="/images/eduimg.png"
                      className={styles.image}
                      alt="pubimg"
                      />
                    </Grid>
                    <Grid item xs={8}> {/*Content set on right*/}
                    <p className={styles.imagetext}>I'm currently a master student at UC Berkeley, major in computer Science (visual computing and computer graphics). Before joining berkeley, I received my bachelor's degree in Computer Science and Technology at Tsinghua University (Beijing, China).</p>
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
