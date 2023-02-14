import Layout from '../components/layout'
import styles from '../styles/publication.module.css'
import Divider from '@mui/material/Divider'
import {BsFillLightbulbFill} from 'react-icons/bs';

export default function Project(){
    return (
        <Layout>
            <Divider className={styles.divider}><BsFillLightbulbFill/> Projects</Divider>
            <div>Sorry, this page is not available yet. Coming soon!</div>
        </Layout>
    )
}