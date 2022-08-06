import Layout from '../components/layout'
import styles from '../styles/education.module.css'
import Divider from '@mui/material/Divider'
import {Grid, Item} from '@mui/material/'
import {BsFillBookFill, BsBuilding, BsPersonFill, BsFillClockFill} from 'react-icons/bs';

function EducationCard(eduData){
    console.log(eduData)
    return(
        <ul className={styles.CardContainer}>
            <Grid container spacing={2}>
                <Grid item xs={4} sm={3} md={2}> {/*An image set on left*/}
                    <div>
                        <img
                        src={eduData.img_path}
                        alt={eduData.school}
                        className={styles.eduImg}
                        />
                    </div>
                </Grid>
                <Grid item xs={0} sm={1} md={2}/>
                <Grid item xs={8}> {/*Content set on right*/}
                    <div className={styles.eduTitle}>{eduData.school}</div>
                    <div className={styles.eduDepart}><BsBuilding/> {eduData.department}</div>
                    <div className={styles.eduDegree}><BsPersonFill/> {eduData.degree}</div>
                    <div className={styles.eduTime}><BsFillClockFill/> {eduData.time}</div>
                </Grid>
            </Grid>
        </ul>
    )
}

export default function Education(){
    return (
        <Layout>
            <Divider className={styles.divider}><BsFillBookFill/> Education</Divider>
            <EducationCard school="University of California Berkeley" time="2022.8 - present" department="Department of Electronic Engineering and Computer Science" degree="Student, Master of Engineering" img_path="/images/Berkeley.png"/>
            <EducationCard school="Tsinghua University" time="2019.7 - 2022.7" department="Department of Computer Science and Technology" degree="Student, Bachelor of Engineering in Science" img_path="/images/tsinghua.png"/>
            <EducationCard school="Stanford University" time="2021.3 - 2021.11" department="Geometric Computation Group and Artificial Intelligence Lab" degree="Exchange Research Student" img_path="/images/stanford.png"/>
            <EducationCard school="Tsinghua University" time="2017.8 - 2019.7" department="Department of Physics" degree="Student" img_path="/images/tsinghua.png"/>
        </Layout>
    )
}